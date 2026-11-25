const fs=require('fs');const m=new WebAssembly.Module(fs.readFileSync('seed.wasm'));
const stub=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:stub,env:stub}).exports;
const M=()=>new Int32Array(e.memory.buffer);const ip=e.ids_ptr()>>2, yp=e.ys_ptr()>>2;M()[ip]=186;M()[ip+1]=184;M()[yp]=256;M()[yp+1]=256;
const MC=e.mc_wd();
for(const sp of [0,1]){let t=Date.now(),h=[];for(let s=0;s<3000;s++){if(e.test_seed(s,0,MC,2,500,32,0,0,sp))h.push(s);}console.log('spawn',sp,'ms',Date.now()-t,h);}
for(const s of [7387,413,185]){e.set_seed(s,0,MC);e.nearest(2,500,16,0,0,1);const o=e.out_ptr()>>2;console.log(s,Array.from(M().slice(o,o+6)),'spawn',M()[o+48],M()[o+49]);}
