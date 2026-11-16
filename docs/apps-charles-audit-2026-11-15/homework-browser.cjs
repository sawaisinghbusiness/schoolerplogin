const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {loadDemo}=require('./demo-fixtures.cjs');
const {respond,fixtures}=require('./erp-fixtures.cjs');
const inventory=require('./source-inventory.json');
const out=__dirname+'/implementation-browser'+(process.env.AUDIT_RUN?'/'+process.env.AUDIT_RUN:'');fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rows=[],errors=[],missing=[],blocked=[];
const modes={staff:{base:'http://127.0.0.1:3332',prefix:'sa',root:'C:/Users/ADMIN/Desktop/folder for staff app erp project'},erp:{base:'http://127.0.0.1:3332',prefix:'sa'},parents:{base:'http://127.0.0.1:3131',prefix:'pa',root:'C:/Users/ADMIN/Desktop/folder for parents app erp project'}};
const qs={
 '/erp/attendance/mark/section/':'?class=6th&section=A',
 '/erp/exams/marks/sheet/':'?exam=exam-review&section=6th%20-%20A&subject=Maths',
 '/erp/exams/setup/edit/':'?id=exam-review',
 '/erp/exams/report-cards/':'?exam=exam-review&section=6th%20-%20A',
 '/erp/fees/collect/':'?student=review-1',
 '/erp/messages/detail/':'?id=message-review',
 '/erp/parent-chats/chat/':'?id=chat0',
 '/erp/students/detail/':'?id=review-0',
 '/erp/staff/detail/':'?id=staff0',
 '/erp/students/enquiries/detail/':'?id=enquiry0',
 '/erp/copy-check/sheet/':'?id=check-review&section=6th%20-%20A',
 '/erp/syllabus/plan/':'?class=6th&subject=Maths',
 '/erp/transport/route/':'?id=route1',
 '/erp/soon/':'?m=library',
 '/messages/chat/':'?id=c1',
 '/students/detail/':'?id=sec-5b-s1',
 '/teachers/chat/':'?id=t-neha',
 '/fees/detail/':'?i=0','/fees/pay/':'?i=0',
 '/meetings/detail/':'?id=meet-ptm',
 '/exam/detail/':'?id=half-yearly',
 '/events/album/':'?id=teachers'
};
function connection(url){return new Promise((resolve,reject)=>{const socket=new WebSocket(url),pending=new Map(),listeners=new Map();let id=0;socket.onopen=()=>resolve({call:(method,params={})=>new Promise((done,fail)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);fail(Error('CDP timeout '+method))},90000);pending.set(n,m=>{clearTimeout(timer);m.error?fail(Error(m.error.message)):done(m.result)});socket.send(JSON.stringify({id:n,method,params}))}),on:(name,fn)=>listeners.set(name,fn),close:()=>socket.close()});socket.onerror=reject;socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}else listeners.get(m.method)?.(m.params)}})}
function measure(){
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[aria-hidden=true]')};
 const rect=e=>{const r=e.getBoundingClientRect();return{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
 const name=e=>e.getAttribute('aria-label')||e.textContent.trim().replace(/\s+/g,' ').slice(0,90)||e.getAttribute('placeholder')||e.getAttribute('name')||e.id;
 const controls=[...document.querySelectorAll('button,a,input,select,textarea')].filter(visible).map(e=>({tag:e.tagName,name:name(e),...rect(e),font:getComputedStyle(e).fontSize,label:e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||(e.labels?.length?'associated label':null),disabled:e.disabled||false}));
 const small=controls.filter(e=>(e.w<44||e.h<44)&&e.tag!=='INPUT'&&e.tag!=='TEXTAREA');
 const unlabelled=[...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea')].filter(visible).filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>({name:name(e),...rect(e)}));
 const clipped=[...document.querySelectorAll('button,label,h1,h2,h3,strong,[class*=truncate]')].filter(visible).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({text:name(e),...rect(e)}));
 const typography=[...document.querySelectorAll('h1,h2,h3,p,dt,dd,button')].filter(visible).map(e=>({tag:e.tagName,text:name(e),size:getComputedStyle(e).fontSize,weight:getComputedStyle(e).fontWeight,color:getComputedStyle(e).color}));
 return{url:location.pathname+location.search,title:document.title,text:document.body.innerText,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyFont:getComputedStyle(document.body).fontFamily,controls,small,unlabelled,clipped,typography,images:[...document.images].filter(visible).map(e=>({alt:e.alt,loaded:e.complete&&e.naturalWidth>0,src:e.getAttribute('src')})),animations:document.getAnimations().map(a=>({name:a.animationName,state:a.playState,duration:a.effect?.getTiming().duration,iterations:a.effect?.getTiming().iterations}))};
}
(async()=>{
 const version=await(await fetch('http://127.0.0.1:9223/json/version')).json(),browser=await connection(version.webSocketDebuggerUrl);
 try{for(const [mode,config]of Object.entries(modes)){
  if(process.env.AUDIT_MODE&&process.env.AUDIT_MODE!==mode)continue;
  const demo=config.root?loadDemo(config.root,config.prefix):null;
  const context=await browser.call('Target.createBrowserContext'),target=await browser.call('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});
  const tabs=await(await fetch('http://127.0.0.1:9223/json')).json(),page=await connection(tabs.find(t=>t.id===target.targetId).webSocketDebuggerUrl);
  let current='',pending=0,filterFailure=null,markWrites=0,failMark=true,responseDelay=0;
  const ev=async expr=>{const r=await page.call('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
  page.on('Page.javascriptDialogOpening',()=>{void page.call('Page.handleJavaScriptDialog',{accept:false})});
  page.on('Runtime.exceptionThrown',e=>errors.push({mode,route:current,error:e.exceptionDetails.exception?.description||e.exceptionDetails.text}));
  page.on('Fetch.requestPaused',async e=>{pending++;let answer;const u=new URL(e.request.url);try{
   if(process.env.AUDIT_MESSAGE&&e.request.method==='POST'&&u.pathname.includes('/recipients/')){markWrites++;answer={status:failMark?503:200,payload:failMark?{error:'Synthetic save failure'}:{ok:true}}}
   else if(e.request.method!=='GET'&&e.request.method!=='OPTIONS'){blocked.push({mode,route:current,path:u.pathname,method:e.request.method});answer={status:403,payload:{error:'Read-only synthetic audit blocks mutations'}}}
   else if(filterFailure&&u.pathname.includes(filterFailure))answer={status:503,payload:{error:'Synthetic service unavailable'}};
   else if(mode==='erp')answer=respond(e.request.method,u,null,'admin');
   else{const short=u.pathname.replace(mode==='parents'?'/api/parent':'/api/staff-app','')+u.search;answer={status:200,payload:await demo.demoApi(short,'GET',{})}}
  }catch(error){answer={status:error.status||500,payload:{error:error.message}};missing.push({mode,route:current,path:u.pathname,query:u.search,status:answer.status,error:error.message})}
  if(answer.missing)missing.push({mode,route:current,path:answer.missing,status:answer.status});
  if(responseDelay)await sleep(responseDelay);
  await page.call('Fetch.fulfillRequest',{requestId:e.requestId,responseCode:answer.status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(answer.payload)).toString('base64')}).catch(()=>{});pending--});
  await page.call('Page.enable');await page.call('Runtime.enable');await page.call('Fetch.enable',{patterns:[{urlPattern:'*://*/api/*'}]});
  await page.call('Network.setCookie',{name:'schooldesk_session',value:'synthetic-audit',url:config.base,path:'/'});
  await page.call('Page.addScriptToEvaluateOnNewDocument',{source:`if(!sessionStorage.getItem('audit-seeded')){localStorage.clear();localStorage.setItem('${config.prefix}:signed-in','1');localStorage.setItem('${config.prefix}:lang','${process.env.AUDIT_LANG||'en'}');localStorage.setItem('sa:erp','${mode==='erp'?'1':'0'}');localStorage.setItem('pa:child','demo-priya');localStorage.setItem('pa:onboarded','1');sessionStorage.setItem('audit-seeded','1')}window.alert=()=>{};Object.defineProperty(navigator,'geolocation',{value:{watchPosition(){return 1},clearWatch(){},getCurrentPosition(){}}});`});
  const capture=async(route,width=Number(process.env.AUDIT_WIDTH||390),suffix='')=>{
   current=route;await page.call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});await page.call('Page.navigate',{url:config.base+route});
   for(let i=0;i<300;i++){await sleep(200);if(await ev('!!document.body&&document.readyState!=="loading"')&&pending===0&&await ev('document.body.innerText.length>20'))break}
   await sleep(900);if(mode==='parents'){await ev('(()=>{const b=[...document.querySelectorAll("button")].find(b=>b.textContent.includes("Change and send again")||b.textContent.includes("Done, send to teacher"));if(b)b.click()})()');await sleep(300)}else{await ev('document.querySelectorAll("details").forEach(d=>d.open=true)');await sleep(200)}if(process.env.AUDIT_TEXT_SCALE)await ev('('+function(){const scale=2;const els=[...document.querySelectorAll('body *')].filter(e=>!e.closest('svg'));const sizes=els.map(e=>[parseFloat(getComputedStyle(e).fontSize),getComputedStyle(e).lineHeight]);els.forEach((e,i)=>{e.style.fontSize=sizes[i][0]*scale+'px';if(sizes[i][1]!=='normal')e.style.lineHeight=parseFloat(sizes[i][1])*scale+'px'});}.toString()+')()');const data=await ev('('+measure.toString()+')()');
   const id=(route.split('?')[0].replace(/^\/|\/$/g,'').replaceAll('/','--')||'home')+'-'+width+suffix;
   const file=mode+'/'+id+'.png';fs.mkdirSync(out+'/'+mode,{recursive:true});const shot=await page.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(out+'/'+file,Buffer.from(shot.data,'base64'));
   rows.push({mode,requested:route,file,...data});const target=out+'/inventory-'+mode+(process.env.AUDIT_RUN?'-'+process.env.AUDIT_RUN:process.env.AUDIT_EXTRA?'-extra':'')+'.json';fs.writeFileSync(target,JSON.stringify(rows.filter(r=>r.mode===mode),null,2));console.log(mode+' '+route+(data.scrollWidth>width?' OVERFLOW':''));return data;
  };
  try{
   let routes=inventory.filter(r=>mode==='parents'?r.app==='parents':mode==='erp'?r.group==='erp-app':r.app==='staff'&&['staff','alias'].includes(r.group)).map(r=>r.route);
   if(mode==='erp')routes.unshift('/','/profile/');
   if(process.env.AUDIT_ROUTES)routes=process.env.AUDIT_ROUTES.split(',');
   if(!process.env.AUDIT_INTERACTIONS)for(const route of routes)await capture(route+(qs[route]||''));
   if(process.env.AUDIT_INTERACTIONS){
    const findings=[];
    const act=async text=>{const result=await ev('('+function(t){const e=[...document.querySelectorAll('button,a')].find(e=>e.textContent.trim()===t);if(!e)return false;e.click();return true}.toString()+')('+JSON.stringify(text)+')');assert(result,'Missing '+text);await sleep(450)};
    const stateShot=async id=>{await sleep(250);const data=await ev('('+measure.toString()+')()');const file=mode+'/'+id+'.png';const shot=await page.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+file,Buffer.from(shot.data,'base64'));findings.push({id,file,...data});return data};
    const fill=async(selector,value)=>ev('('+function(selector,value){const e=document.querySelector(selector);if(!e)throw Error('Missing '+selector);Object.getOwnPropertyDescriptor(e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,value);e.dispatchEvent(new Event('input',{bubbles:true}));}.toString()+')('+JSON.stringify(selector)+','+JSON.stringify(value)+')');
    if(mode==='staff'){
     await capture('/marks/');await act('Enter marks');await sleep(550);const before=await ev('document.querySelector("input[inputmode=decimal]").value');await fill('input[inputmode=decimal]','13');await stateShot('marks-edited');await act('Change');await sleep(550);const after=await ev('document.querySelector("input[inputmode=decimal]").value');findings.push({test:'Unsaved marks after Change and reopen',before,typed:'13',after,lost:after!=='13'});
     await capture('/homework/');await ev('(()=>{const b=document.querySelector("button[aria-haspopup=listbox]");b.focus();b.click()})()');await sleep(200);await page.call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowDown',windowsVirtualKeyCode:40});await page.call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowDown',windowsVirtualKeyCode:40});findings.push({test:'SelectBox ArrowDown',active:await ev('document.activeElement.outerHTML.slice(0,400)'),options:await ev('document.querySelectorAll("[role=option]").length')});await stateShot('select-keyboard');
     await page.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',windowsVirtualKeyCode:27});await sleep(100);assert(await ev('document.activeElement.getAttribute("aria-haspopup")==="listbox"'),'Select Escape restores trigger focus');
     if(process.env.AUDIT_RETRY){
      await ev('Object.keys(localStorage).filter(k=>k.startsWith("sa:cache:")&&k.includes("homework")).forEach(k=>localStorage.removeItem(k))');filterFailure='/api/staff-app/homework';await capture('/homework/',390,'-retry-failed');
      filterFailure=null;responseDelay=1200;await ev('document.querySelector(".retry-button").click()');await sleep(300);assert(await ev('document.querySelector(".retry-button").disabled'),'Retry stays pending while both requests run');await sleep(1500);responseDelay=0;assert(await ev('!document.querySelector(".retry-button")'),'Successful retry removes the failure');findings.push({test:'Retry awaits delayed multi-resource recovery',passed:true});
     }
     await capture('/homework/');await act('Check');await stateShot('homework-check');await capture('/leave/?tab=requests');await stateShot('leave-requests');await act('My leave');assert(await ev('document.querySelector("nav[aria-label=Main] a[aria-current=page]").innerText==="Profile"'),'My leave stays in Profile context');await ev('document.querySelectorAll("[role=tab]")[1].click()');await sleep(200);assert(await ev('document.querySelector("nav[aria-label=Main] a[aria-current=page]").innerText==="Home"'),'Student leave requests stay in Home context');findings.push({test:'Live Leave-tab navigation context',passed:true});
    }else if(mode==='erp'){
     await capture('/erp/exams/marks/sheet/'+qs['/erp/exams/marks/sheet/']);const selector='input[inputmode=decimal]';const exists=await ev('!!document.querySelector('+JSON.stringify(selector)+')');if(exists){await fill(selector,'13');await stateShot('erp-marks-edited');await act('Home');assert((await ev('location.pathname')).includes('/erp/exams/marks/sheet'),'Dirty ERP editor must retain its route when leaving is cancelled');findings.push({test:'In-app navigation from unsaved ERP marks',location:await ev('location.pathname'),dialogs:await ev('document.querySelectorAll("[role=dialog]").length')})}
     if(process.env.AUDIT_MESSAGE){
      await capture('/erp/messages/detail/?id=message-review');await ev('window.open=(...args)=>{window.__opened=args;return null}');
      await ev('[...document.querySelectorAll("button")].find(b=>b.textContent.includes("Send next:")).click()');await sleep(250);assert.equal(markWrites,0,'Opening WhatsApp must not write sent status');
      assert(await ev('!!window.__opened'),'WhatsApp was opened through the stub');
      await act('Yes, I sent it');assert.equal(markWrites,1);assert(await ev('[...document.querySelectorAll("[role=tab]")].some(t=>t.textContent==="Sent 1")'),'Failed confirmation must preserve sent count');
      failMark=false;await act('Yes, I sent it');assert.equal(markWrites,2);assert(await ev('[...document.querySelectorAll("[role=tab]")].some(t=>t.textContent==="Sent 2")'),'Successful confirmation updates sent count');
      findings.push({test:'WhatsApp open, failed save, confirmed save',passed:true,syntheticWrites:markWrites});await stateShot('message-confirmed');
     }
     await capture('/erp/fees/online/');await act('Payment QR & contact');await stateShot('payment-qr-settings');
     await capture('/erp/settings/classes/');await ev('document.querySelector(".erp-interface main button").click()').catch(()=>{});await stateShot('classes-dialog');
    }else{
     await capture('/search/');filterFailure='/api/parent';await ev('localStorage.removeItem("pa:cache:/homework?student=demo-priya");localStorage.removeItem("pa:cache:/notices?student=demo-priya")');await capture('/search/',390,'-unavailable');await fill('input','impossible-query');await sleep(250);await stateShot('search-unavailable-results');filterFailure=null;
     await capture('/calendar/');await act('Time table');await stateShot('calendar-timetable');
     await capture('/exam/?tab=result');await stateShot('exam-result');
     await capture('/study/');await act('Pomodoro');await stateShot('study-pomodoro');
     await capture('/login/');await ev('localStorage.setItem("pa:onboarded","1")');await capture('/login/',390,'-actual');
     await capture('/events/album/?id=teachers');await ev('(()=>{const b=document.querySelector("main li button");b.focus();b.click()})()');await stateShot('album-viewer');findings.push({test:'Album viewer dialog semantics',dialogs:await ev('document.querySelectorAll("[role=dialog],[aria-modal=true]").length'),active:await ev('document.activeElement.tagName')});await page.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',windowsVirtualKeyCode:27});await sleep(150);assert(await ev('!document.querySelector("[role=dialog]")'),'Album Escape closes dialog');assert(await ev('document.activeElement.tagName==="BUTTON"'),'Album restores thumbnail focus');findings.push({test:'Album Escape and focus restoration',passed:true});
    }
    fs.writeFileSync(out+'/interactions-'+mode+'.json',JSON.stringify({findings,errors,blocked},null,2));
   }
   if(!process.env.AUDIT_ROUTES&&!process.env.AUDIT_INTERACTIONS){
    const narrow=mode==='parents'?['/','/calendar/','/study/','/fees/pay/','/leave/apply/','/teachers/chat/']:mode==='erp'?['/erp/students/admission/','/erp/fees/collect/','/erp/exams/marks/sheet/','/erp/settings/classes/','/erp/messages/new/']:['/attendance/','/homework/','/marks/','/messages/chat/','/leave/apply/'];
    for(const route of narrow)await capture(route+(qs[route]||''),360);
   }
   const readRoutes=mode==='parents'?['/calendar/','/fees/','/teachers/']:mode==='erp'?['/erp/students/','/erp/fees/dues/','/erp/report/']:['/attendance/','/homework/'];
   if(!process.env.AUDIT_EXTRA&&!process.env.AUDIT_INTERACTIONS)for(const route of readRoutes){filterFailure=mode==='parents'?'/api/parent'+(route==='/calendar/'?'/attendance':route.slice(0,-1)):mode==='erp'?'/api'+route.slice(4,-1):'/api/staff-app'+route.slice(0,-1);await capture(route,390,'-error');filterFailure=null}
  }finally{await browser.call('Target.disposeBrowserContext',{browserContextId:context.browserContextId});page.close()}
 }}finally{browser.close();fs.writeFileSync(out+'/result'+(process.env.AUDIT_MODE?'-'+process.env.AUDIT_MODE:'')+(process.env.AUDIT_EXTRA?'-extra':'')+'.json',JSON.stringify({rows:rows.length,errors,missing,blocked,overflow:rows.filter(r=>r.scrollWidth>r.width).map(r=>({mode:r.mode,route:r.requested})),limits:'All APIs mocked; viewport emulation in Chromium; no real submissions, payments or messages.'},null,2))}
})().catch(e=>{console.error(e);process.exitCode=1});

