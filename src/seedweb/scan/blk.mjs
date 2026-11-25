import fs from 'fs';
import {inflate, parseNBT, packed} from './lib.mjs';
const cache=new Map();
async function chunk(cx,cz){const k=cx+','+cz; if(cache.has(k))return cache.get(k);
 const rx=Math.floor(cx/32),rz=Math.floor(cz/32); const b=fs.readFileSync(`/tmp/reg/x/region/r.${rx}.${rz}.mca`); const dv=new DataView(b.buffer,b.byteOffset);
 const i=(cx&31)+(cz&31)*32; const loc=dv.getUint32(i*4),off=(loc>>>8)*4096; if(!off){cache.set(k,null);return null;} const len=dv.getUint32(off);
 const root=parseNBT(await inflate(b.subarray(off+5,off+4+len),b[off+4])); cache.set(k,root); return root;}
export async function block(x,y,z){const c=await chunk(Math.floor(x/16),Math.floor(z/16)); if(!c||!c.sections)return "?"; const sy=Math.floor(y/16);
 const s=c.sections.find(s=>s.Y===sy); if(!s)return '?'; const bs=s.block_states; const pal=bs.palette; let idx=0;
 if(pal.length>1){const bits=Math.max(4,Math.ceil(Math.log2(pal.length))); idx=packed(bs.data,bits,((y&15)<<8)|((z&15)<<4)|(x&15));}
 const e=pal[idx]; const n=typeof e==='string'?e:(e&&(e.Name||e.id||e[''])); if(!n){console.log('ENTRY',JSON.stringify(e),idx,pal.length);return '??';} return n.replace('minecraft:','');}
