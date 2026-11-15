const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'implementation-browser'),sets=[];
for(const run of ['', 'narrow-final','hindi','text-200','final-interactions']){
 const dir=path.join(root,run);if(!fs.existsSync(dir))continue;
 for(const file of fs.readdirSync(dir).filter(f=>/^inventory-.*\.json$/.test(f))){
  const rows=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8')).filter(r=>r.requested!=='/erp/payroll/');
  sets.push({run:run||'Initial applied pass',file:run+'/'+file,rows:rows.map(r=>({...r,screenshot:'implementation-browser/'+(run?run+'/':'')+r.file}))});
 }
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
let html='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Applied interface review</title><style>body{font:15px system-ui;background:#f5f6f2;color:#242628;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px}figure{margin:0;padding:12px;border:1px solid #cdd2cd;background:white;border-radius:10px}img{display:block;width:100%;height:650px;object-fit:contain;object-position:top}figcaption{margin-bottom:12px;overflow-wrap:anywhere}h2{margin-top:36px}</style><h1>Applied interface review</h1><p>Synthetic API data. English, 360px Hindi, narrow layouts and simulated 200% text are separate observations. Initial captures precede the final responsive corrections; use the named final passes for those screens. This gallery is not a native-device accessibility certification.</p>';
for(const set of sets){html+='<h2>'+esc(set.run)+' — '+esc(set.file.split('/').at(-1))+'</h2><main>';for(const r of set.rows)html+='<figure><figcaption>'+esc(r.requested)+' · '+r.width+'px'+(r.scrollWidth>r.width?' · overflow':'')+'</figcaption><a href="'+esc(r.screenshot)+'"><img loading="lazy" src="'+esc(r.screenshot)+'"></a></figure>';html+='</main>'}
fs.writeFileSync(__dirname+'/implementation-gallery.html',html);
fs.writeFileSync(__dirname+'/implementation-verification.json',JSON.stringify({capturedAt:new Date().toISOString(),sets:sets.map(s=>({run:s.run,file:s.file,observations:s.rows.length,overflow:s.rows.filter(r=>r.scrollWidth>r.width).map(r=>r.requested)}))},null,2));
console.log('Indexed '+sets.reduce((n,s)=>n+s.rows.length,0)+' observations.');
