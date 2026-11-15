const fs=require('fs'),crypto=require('crypto'),cp=require('child_process');
const inventory=require('./source-inventory.json');
const roots={staff:'C:/Users/ADMIN/Desktop/folder for staff app erp project',parents:'C:/Users/ADMIN/Desktop/folder for parents app erp project'};
const manifest={capturedAt:new Date().toISOString(),scope:'Review only; source inventory and synthetic browser evidence, not all-state certification',repositories:{},sources:[]};
for(const [app,root]of Object.entries(roots)){
 const git=(...args)=>cp.execFileSync('git',['-c','safe.directory='+root,...args],{cwd:root,encoding:'utf8'}).trim();
 manifest.repositories[app]={root,head:git('rev-parse','HEAD'),trackedLocalChanges:git('diff','--name-only').split('\n').filter(Boolean)};
 const files=new Set(inventory.filter(r=>r.app===app).flatMap(r=>[r.file,...r.targets]));
 for(const f of ['components/AppShell.tsx','components/ui.tsx','app/globals.css','lib/api.ts','lib/parent.tsx','lib/staff.tsx','lib/erpMode.ts','app/action-palette.css','app/status-badges.css'])if(fs.existsSync(root+'/'+f))files.add(f);
 for(const file of files){const bytes=fs.readFileSync(root+'/'+file);manifest.sources.push({app,file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length})}
}
fs.writeFileSync(__dirname+'/audit-baseline.json',JSON.stringify(manifest,null,2));
console.log('Recorded source hashes for '+manifest.sources.length+' files.');
