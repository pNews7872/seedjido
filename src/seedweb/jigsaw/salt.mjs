import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const W=[];
for (const f of ['r.0.-3.mca','r.-1.-3.mca'].filter(f=>fs.existsSync('/tmp/reg/x/region/'+f))) {const b=fs.readFileSync('/tmp/reg/x/region/'+f);const dv=new DataView(b.buffer,b.byteOffset);
 for(let i=0;i<1024;i++){const off=(dv.getUint32(i*4)>>>8)*4096;if(!off)continue;const len=dv.getUint32(off);let r;try{const raw=zlib.inflateSync(b.subarray(off+5,off+4+len));r=parseNBT(new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength));}catch(x){continue;}
 for(const be of (r.block_entities||[])) if(be.LootTable&&String(be.LootTable).includes('ancient')) W.push([be.x,be.y,be.z,BigInt.asIntN(64,BigInt(be.LootTableSeed)).toString(),String(be.LootTable)]);}}
fs.writeFileSync('/tmp/acw.json',JSON.stringify(W));console.log(W.length);
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const rd=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
const w=W[0];
for(let st=0;st<11;st++)for(let di=0;di<60;di++){const l=rd(e.salt_longs(w[0],w[2],di+10000*st,6)).trim().split(' ');const i=l.indexOf(w[3]);if(i>=0)console.log('step',st,'di',di,'idx',i);}
