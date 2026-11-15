const fs=require('fs'),path=require('path');
const roots={staff:'C:/Users/ADMIN/Desktop/folder for staff app erp project',parents:'C:/Users/ADMIN/Desktop/folder for parents app erp project'};
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const rows=[];
for(const [app,root]of Object.entries(roots))for(const file of walk(path.join(root,'app')).filter(f=>f.endsWith('page.tsx'))){
 const source=fs.readFileSync(file,'utf8');const relative=path.relative(root,file).replaceAll('\\','/');
 const route='/'+relative.replace(/^app\//,'').replace(/\([^/]+\)\//g,'').replace(/page\.tsx$/,'');
 const group=app==='parents'?'parents':route.startsWith('/erp/')?'erp-app':route.startsWith('/trip/')?'driver':route==='/me/'||route.startsWith('/me/')?'alias':'staff';
 const imports=[...source.matchAll(/(?:from\s*|import\s*)["'](@\/[^"']+)["']/g)].map(m=>m[1]);
 const targets=imports.map(i=>path.join(root,i.slice(2))).flatMap(p=>[p+'.tsx',p+'.ts',path.join(p,'index.tsx')].filter(fs.existsSync)).map(p=>path.relative(root,p).replaceAll('\\','/'));
 const query=[...new Set([...source.matchAll(/\.get\(["']([^"']+)/g)].map(m=>m[1]).filter(k=>['id','exam','student','i','class','section','subject','tab','m','sent','q','new','search','date','view','enquiry'].includes(k)))];
 rows.push({app,group,route,file:relative,lines:source.split('\n').length,targets,redirect:[...source.matchAll(/(?:redirect|replace)\(["']([^"']+)|<Redirect to=["']([^"']+)/g)].map(m=>m[1]||m[2]),query});
}
fs.writeFileSync(__dirname+'/source-inventory.json',JSON.stringify(rows,null,2));
console.log(JSON.stringify({total:rows.length,groups:rows.reduce((a,r)=>(a[r.group]=(a[r.group]||0)+1,a),{}),pages:rows.filter(r=>r.group!=='driver').map(r=>({group:r.group,route:r.route,lines:r.lines,target:r.lines<12?r.targets:undefined,query:r.query}))},null,2));
