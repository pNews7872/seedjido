const fs=require('fs');const m=new WebAssembly.Module(fs.readFileSync('seed3.wasm'));
console.log(WebAssembly.Module.imports(m).map(i=>i.module+'.'+i.name).join(' '));
const stub=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:stub,env:stub}).exports;
const M=()=>new Int32Array(e.memory.buffer);const MC=e.mc_wd();
const big=3043870398149041969n; const lo=Number(big&0xffffffffn), hi=Number(big>>32n);
e.set_seed(lo,hi,MC); e.spawn_xz(); let o=e.out_ptr()>>2; console.log('spawn',M()[o+80],M()[o+81]);
// structure types enum index
const ST={Desert_Pyramid:1,Jungle_Temple:2,Swamp_Hut:3,Igloo:4,Village:5,Ocean_Ruin:6,Shipwreck:7,Monument:8,Mansion:9,Outpost:10,Ruined_Portal:11,Ancient_City:13,Treasure:14,Trail_Ruins:24,Trial_Chambers:25,Abandoned_Camp:26,Stronghold:27};
const sp=e.sids_ptr()>>2; const names=Object.keys(ST); names.forEach((k,i)=>M()[sp+i]=ST[k]);
let t=Date.now(); e.nearest(0,3000,32,0,0,1,names.length); console.log('ms',Date.now()-t);
o=e.out_ptr()>>2; names.forEach((k,i)=>console.log(k, M()[o+i*3],M()[o+i*3+1],'d',M()[o+i*3+2]));
