const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function feedback(t,supported=true){
 const file=(process.env.STAFF_ERP_ROOT||'C:/Users/ADMIN/Desktop/folder for staff app erp project')+'/lib/slideFeedback.ts';
 if(!fs.existsSync(file)){t.skip('Staff checkout unavailable');return}
 const trace={contexts:0,sounds:[],gains:[],buzzes:[]};let time=0;
 class Context{
  constructor(){trace.contexts++;this.state='running';this.currentTime=0;this.destination={}}
  decodeAudioData(){return Promise.resolve({duration:.82})}
  createGain(){return {gain:{setValueAtTime:value=>trace.gains.push(value),linearRampToValueAtTime(){}},connect(){},disconnect(){}}}
  createBufferSource(){return {connect(){},disconnect(){},start:(at,offset,duration)=>trace.sounds.push({at,offset,duration})}}
 }
 const module={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
  module,exports:module.exports,require:name=>{assert.equal(name,'@/lib/haptics');return {vibrate:ms=>trace.buzzes.push(ms)}},
  window:supported?{AudioContext:Context}:{},performance:{now:()=>time},
  fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)}),setTimeout:()=>0,
 });
 return {api:module.exports,trace,advance:ms=>{time+=ms}};
}
test('slide preload is silent; a slow drag plays at most five short low-volume ticks',async t=>{
 const m=feedback(t);if(!m)return;
 assert.equal(m.trace.contexts,0);m.api.preloadSlideSound();await new Promise(setImmediate);
 assert.equal(m.trace.sounds.length,0);assert.equal(m.trace.buzzes.length,0);
 m.api.slideGrab();for(const p of [.22,.44,.66,.88,1]){m.advance(1000);m.api.slideDrag(p)}
 assert.equal(m.trace.sounds.length,5);assert.equal(m.trace.buzzes.length,5);
 assert(m.trace.sounds.every(s=>s.duration>0&&s.duration<=.07));assert(m.trace.gains.every(g=>g===.1));
});
test('a quick flick skips intermediate ticks rather than emitting a burst',async t=>{
 const m=feedback(t);if(!m)return;m.api.preloadSlideSound();await new Promise(setImmediate);
 m.api.slideGrab();m.advance(10);m.api.slideDrag(.88);assert.equal(m.trace.sounds.length,1);assert.equal(m.trace.buzzes.length,1);
});
test('unavailable audio never prevents the slide feedback path',t=>{
 const m=feedback(t,false);if(!m)return;
 assert.doesNotThrow(()=>{m.api.preloadSlideSound();m.api.slideGrab();m.advance(1000);m.api.slideDrag(.44);m.api.resetSlideDrag()});
 assert.equal(m.trace.sounds.length,0);
});
