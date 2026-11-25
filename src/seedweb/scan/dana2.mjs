import fs from 'fs'; import {block} from './blk.mjs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const s=BigInt.asUintN(64,-1764505425291978715n); e.set_seed(Number(s&0xffffffffn),Number(s>>32n),e.mc_wd());
const L=JSON.parse(fs.readFileSync('/tmp/reg/dlists.json'));
const AIRS=new Set(['air','cave_air']);
const tally={};
for(const d of L.fnList.slice(0,40)){
  const [x,y,z]=d;
  // real room: walls of the actual dungeon are cobble/mossy now (room already carved), so look outside: compare model vs real at y0 just outside walls ring radius 4..5
  for(let dx=-5;dx<=5;dx++)for(let dz=-5;dz<=5;dz++){ if(Math.max(Math.abs(dx),Math.abs(dz))<5) continue;
    for(const dy of [0,1]){ const r=await block(x+dx,y+dy,z+dz); const mo=e.dbg_block(x+dx,y+dy,z+dz); const k=`real:${AIRS.has(r)?'air':r} model:${['solid','air','water','lava'][mo]}`; tally[k]=(tally[k]||0)+1; }}
}
console.log(Object.entries(tally).sort((a,b)=>b[1]-a[1]).slice(0,20));
