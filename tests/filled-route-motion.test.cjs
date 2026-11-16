const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const staff=process.env.STAFF_ERP_ROOT||'C:/Users/ADMIN/Desktop/folder for staff app erp project';
test('filled-route rerenders preserve forward afternoon bus movement instead of re-anchoring backwards',t=>{
 const file=staff+'/lib/routeFill.ts';if(!fs.existsSync(file))return t.skip('Staff checkout unavailable');
 let filled,memo,deps;
 const react={useEffect(){},useState:()=>[filled,()=>{}],useMemo:(fn,next)=>{if(!deps||next.some((d,i)=>!Object.is(d,deps[i]))){memo=fn();deps=next}return memo}};
 const exports={};const context={exports,require:name=>{if(name==='react')return react;throw Error(name)},Map,console};
 const compile=text=>ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(compile(fs.readFileSync(file,'utf8'))+'\nexports.signatureForTest=signature;',context);
 const route={id:'r1',school:{name:'School',lat:25.7,lng:71.408},stops:[{name:'Stop',lat:null,lng:null,kids:[{id:'k1'}]}],path:null};
 const path={pts:[[25.7,71.4],[25.7,71.404],[25.7,71.408]],road:true};
 filled={sig:exports.signatureForTest(route),r:{...route,path,stops:[{...route.stops[0],lat:25.7,lng:71.4}]}};
 const first=exports.useFilledRoute(route);assert.strictEqual(exports.useFilledRoute(route),first,'Position-only renders must keep route identity');
 const bus={exports:{}};vm.runInNewContext(compile(fs.readFileSync(staff+'/lib/bus.ts','utf8')),bus);
 const {tripPath,metres,nearestIdx}=bus.exports;
 const page=fs.readFileSync(staff+'/app/(app)/trip/page.tsx','utf8');const begin=page.indexOf('const t = setInterval(() => {',page.indexOf('if (PRETEND_BUS)'))+'const t = setInterval(() => {'.length;const end=page.indexOf('      }, 700);',begin);assert(end>begin);
 let activeRoute=first,road=tripPath(first,'afternoon');const positions=[];
 const sim=vm.createContext({exports:{},cur:road,p:{lat:road[0][0],lng:road[0][1]},i:0,lastStep:0,ptsRef:{current:road},target:{current:{lat:25.7,lng:71.4}},metres,nearestIdx,place:p=>positions.push({...p}),setKmh(){},Math});
 vm.runInContext(compile('exports.tick=()=>{'+page.slice(begin,end)+'}'),sim);
 for(let i=0;i<40;i++){const next=exports.useFilledRoute(route);if(next!==activeRoute){activeRoute=next;road=tripPath(next,'afternoon')}sim.ptsRef.current=road;sim.exports.tick()}
 assert(positions.length>=40);assert(metres(positions[0],positions.at(-1))>150,'Bus must progress beyond its starting vertex');
 const remaining=positions.map(p=>metres(p,sim.target.current));assert(remaining.every((d,i)=>i===0||d<=remaining[i-1]+.01),'Bus must not reverse toward the previous vertex');
 const updated={...route,stops:[{...route.stops[0],kids:[{id:'k2'}]}]};const refreshed=exports.useFilledRoute(updated);
 assert.equal(refreshed.stops[0].kids[0].id,'k2','Latest passengers must survive memoization');assert.strictEqual(refreshed.path,path);
 assert.strictEqual(exports.useFilledRoute(updated),refreshed);
});
