const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function compile(file,extras={}){
 const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{exports,process:{env:{}},AbortController,setTimeout,clearTimeout,...extras});return exports;
}
function client(fetch,extra={}){return compile('lib/apiClient.ts',{fetch,...extra}).api;}
test('preserves cookies and successful JSON response',async()=>{
 let call;const api=client(async(url,init)=>{call={url,init};return new Response(JSON.stringify({id:3}));});
 const r=await api.post('/api/students',{name:'Test'});assert.equal(r.ok,true);assert.equal(r.data.id,3);assert.equal(call.init.credentials,'include');assert.equal(call.init.method,'POST');assert.equal(JSON.parse(call.init.body).name,'Test');
});
test('request deadline aborts slow fetch without retrying a write',async()=>{
 let expire,calls=0,cleared=false;
 const api=client((url,{signal})=>{calls++;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))));},{setTimeout:fn=>(expire=fn,1),clearTimeout:()=>cleared=true});
 const waiting=api.post('/api/fees/collect',{});expire();const r=await waiting;
 assert.equal(r.ok,false);assert.match(r.error,/timed out/);assert.equal(calls,1);assert.equal(cleared,true);
});
test('deadline also covers response-body reads',async()=>{
 let expire;const api=client(async(url,{signal})=>({ok:true,status:200,text:()=>new Promise((resolve,reject)=>{if(signal.aborted)reject(new Error('aborted'));else signal.addEventListener('abort',()=>reject(new Error('aborted')));})}),{setTimeout:fn=>(expire=fn,1),clearTimeout:()=>{}});
 const waiting=api.get('/api/students');await Promise.resolve();expire();assert.match((await waiting).error,/timed out/);
});
test('expired protected API raises recovery event; forbidden and login failure do not',async()=>{
 let status=401;const events=[];const api=client(async()=>new Response('{"error":"Denied"}',{status}),{window:{dispatchEvent:e=>events.push(e.type)},CustomEvent:class{constructor(type){this.type=type;}}});
 await api.get('/api/students');assert.deepEqual(events,['schooldesk:session-expired']);
 events.length=0;await api.post('/api/auth/login',{});status=403;await api.get('/api/students');assert.deepEqual(events,[]);
});
test('logout distinguishes server failure from an already expired session',async()=>{
 let result={ok:false,status:0,error:'offline'};
 const {authService}=compile('lib/services/authService.ts',{require:()=>({api:{post:async()=>result}})});
 assert.equal((await authService.logout()).success,false);result={ok:false,status:401};assert.equal((await authService.logout()).success,true);result={ok:true,status:200};assert.equal((await authService.logout()).success,true);
});
test('fee preview source stays in parity with server calculator',t=>{
 const backend='../sms backend/src/lib/feeEngine.ts';if(!fs.existsSync(backend)){t.skip('Adjacent backend checkout not available');return;}
 const normalise=s=>s.replace(/\r\n/g,'\n');assert.equal(normalise(fs.readFileSync('lib/feeEngine.ts','utf8')),normalise(fs.readFileSync(backend,'utf8')),'Review calculator drift before deploying preview changes');
});
test('spreadsheet import/export preserves Hindi, identifiers and amounts in XLS/XLSX',()=>{
 const XLSX=require('xlsx');
 for(const bookType of ['xlsx','biff8']){
  const rows=[['Name','Admission','Amount'],['प्रिशा जोशी','ADM-0012',10500],['Test Parent','000045',0]];
  const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet(rows),'Students');
  const restored=XLSX.read(XLSX.write(book,{type:'buffer',bookType}),{type:'buffer'});
  assert.deepEqual(XLSX.utils.sheet_to_json(restored.Sheets.Students,{header:1}),rows);
 }
});
test('caller cancellation is distinct from a timeout and is not retried',async()=>{
 const controller=new AbortController();let calls=0;
 const api=client((url,{signal})=>new Promise((resolve,reject)=>{calls++;const fail=()=>reject(new Error('aborted'));if(signal.aborted)fail();else signal.addEventListener('abort',fail);}));
 const waiting=api.get('/api/students',{signal:controller.signal});controller.abort();const result=await waiting;assert.equal(result.error,'Request cancelled.');assert.equal(calls,1);
});
test('generated credentials have strong random length and satisfy validation',()=>{
 const {suggestPassword,passwordProblem}=compile('lib/services/userService.ts',{require:()=>({api:{}}),crypto:require('node:crypto').webcrypto});const passwords=new Set();
 for(let i=0;i<100;i++){const password=suggestPassword();assert.match(password,/^[A-Za-z2-9]{4}(-[A-Za-z2-9]{4}){3}$/);assert.equal(passwordProblem(password),null);passwords.add(password);}
 assert.equal(passwords.size,100);
});
