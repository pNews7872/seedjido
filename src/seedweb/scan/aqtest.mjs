import fs from 'fs'; import {block} from './blk.mjs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const s=BigInt.asUintN(64,-1764505425291978715n); e.set_seed(Number(s&0xffffffffn),Number(s>>32n),e.mc_wd());
const aq=+process.argv[2]; e.set_aquifer(aq);
let seed=12345; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const tab={}; let n=0;
// sample within a few tiles to keep cache reuse
for(let t=0;t<6;t++){ const tx=Math.floor(rnd()*12)-6, tz=Math.floor(rnd()*12)-6;
  for(let i=0;i<3000;i++){ const x=tx*256+Math.floor(rnd()*256), z=tz*256+Math.floor(rnd()*256), y=-60+Math.floor(rnd()*120);
    const r=await block(x,y,z); if(r==='?')continue; const rk = (r==='air'||r==='cave_air')?'air':r==='water'?'water':r==='lava'?'lava':'solid';
    const mo=['solid','air','water','lava'][e.dbg_block(x,y,z)];
    if(rk==='solid'&&mo==='solid') continue;
    const k=rk+'->'+mo; tab[k]=(tab[k]||0)+1; n++; } }
console.log('aquifer',aq,Object.entries(tab).sort((a,b)=>b[1]-a[1]));
