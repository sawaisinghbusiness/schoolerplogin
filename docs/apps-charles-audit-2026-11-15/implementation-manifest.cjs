const fs=require('fs'),crypto=require('crypto');
const baseline=require('./audit-baseline.json');
const roots={staff:'C:/Users/ADMIN/Desktop/folder for staff app erp project',parents:'C:/Users/ADMIN/Desktop/folder for parents app erp project'};
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sources=baseline.sources.map(s=>({...s,baselineSha256:s.sha256,sha256:sha(roots[s.app]+'/'+s.file),changed:sha(roots[s.app]+'/'+s.file)!==s.sha256}));
const protectedSources=sources.filter(s=>/components\/Sahayak|app\/\(app\)\/assistant\//.test(s.file));
if(protectedSources.some(s=>s.changed))throw Error('Protected assistant source changed; inspect before delivery');
fs.writeFileSync(__dirname+'/implementation-manifest.json',JSON.stringify({capturedAt:new Date().toISOString(),note:'Compared with the audit baseline; includes concurrent changes, not an attribution of ownership.',protectedAssistantSources:protectedSources.length,protectedAssistantUnchanged:true,sources},null,2));
console.log('Compared '+sources.length+' sources; protected assistant sources unchanged.');
