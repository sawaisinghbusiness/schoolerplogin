const fs=require('fs'),vm=require('vm'),path=require('path'),ts=require('typescript');
function loadDemo(root,prefix){const map=new Map([[prefix+':demo-session','1']]);const modules=new Map();
 function load(file){file=path.resolve(file);if(modules.has(file))return modules.get(file).exports;const m={exports:{}};modules.set(file,m);const source=fs.readFileSync(file,'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText;
 vm.runInNewContext(js,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),URL,Date,Math,JSON,Promise,process:{env:{NEXT_PUBLIC_DEMO:'0'}},setTimeout,clearTimeout,fetch:()=>Promise.reject(Error('Fixture external requests disabled')),localStorage:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},window:{},console},{filename:file});return m.exports}
 return load(root+'/lib/demo.ts');}
module.exports={loadDemo};
