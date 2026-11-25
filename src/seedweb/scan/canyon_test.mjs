import fs from 'fs';
import {block} from './blk.mjs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const s=BigInt.asUintN(64,-1764505425291978715n); e.set_seed_dim(Number(s&0xffffffffn),Number(s>>32n),e.mc_wd(),0);
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json'));
const loaded=new Set();for(let i=0;i<sc.cl.length;i+=2)loaded.add(sc.cl[i]+','+sc.cl[i+1]);
const n=e.structs_rect(204,-1500,-1500,1500,1500,4096);
const a=new Int32Array(e.memory.buffer,e.rect_ptr(),n*4).slice();
let tot=0,hit=0;
for(let i=0;i<n;i+=7){
  const pts=[];for(let k=1;k<=6;k++)pts.push([a[(i+k)*4],a[(i+k)*4+1],a[(i+k)*4+2]]);
  const mid=pts[2]; if(!loaded.has((mid[0]>>4)+','+(mid[2]>>4))) continue;
  let ok=0,c=0,txt=[];
  for(const q of pts.slice(1,5)){ if(!loaded.has((q[0]>>4)+','+(q[2]>>4))) continue; c++; const b=await block(q[0],q[1],q[2]); txt.push(b); if(['air','cave_air','water','lava'].includes(b)) ok++; }
  if(!c) continue; tot++; if(ok>=Math.ceil(c/2)) hit++;
  if(tot<=12) console.log('mid',mid,'len',a[i*4+3]>>4&4095,txt.join(','));
}
console.log('canyons in loaded',tot,'carved-at-path',hit);
