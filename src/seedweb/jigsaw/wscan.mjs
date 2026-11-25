import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const W=[];
for (const f of fs.readdirSync('/tmp/reg/x/region').filter(f=>f.endsWith('.mca'))) {const b=fs.readFileSync('/tmp/reg/x/region/'+f);const dv=new DataView(b.buffer,b.byteOffset);
 for(let i=0;i<1024;i++){const off=(dv.getUint32(i*4)>>>8)*4096;if(!off)continue;const len=dv.getUint32(off);let r;try{const raw=zlib.inflateSync(b.subarray(off+5,off+4+len));r=parseNBT(new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength));}catch(x){continue;}
 for(const be of (r.block_entities||[])) if(be.LootTable&&/trial|village/.test(String(be.LootTable))) W.push([be.x,be.y,be.z,BigInt.asIntN(64,BigInt(be.LootTableSeed||0)).toString(),String(be.LootTable).replace('minecraft:',''),String(be.id)]);}}
fs.writeFileSync('/tmp/tvw.json',JSON.stringify(W));console.log(W.length);
const c={};for(const w of W)c[w[4]]=(c[w[4]]||0)+1;console.log(c);
