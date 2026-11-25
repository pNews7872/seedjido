const fs=require('fs');
const buf=fs.readFileSync('seed.wasm');
const mod=new WebAssembly.Module(buf);
console.log(WebAssembly.Module.imports(mod));
const stub=new Proxy({}, {get:(t,k)=>()=>0});
const inst=new WebAssembly.Instance(mod,{wasi_snapshot_preview1:stub, env:stub});
const e=inst.exports;
const mem=()=>new Int32Array(e.memory.buffer);
const ids=e.ids_ptr()>>2; mem()[ids]=186; mem()[ids+1]=184; // pale_garden, mangrove_swamp
const MC=e.mc_wd();
let t=Date.now(), hits=[];
for(let s=0;s<8000;s++){ if(e.test_seed(s,0,MC,2,500,32,0,0,256)) hits.push(s); }
console.log('time',Date.now()-t,'hits',hits);
e.nearest(2,500,16,0,0,256); const o=e.out_ptr()>>2; console.log(Array.from(mem().slice(o,o+6)));
e.test_seed(7387,0,MC,2,500,32,0,0,256); e.nearest(2,500,16,0,0,256); console.log('7387',Array.from(mem().slice(o,o+6)));
