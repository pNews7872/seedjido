import fs from 'fs';
import {inflate, parseNBT, packed} from "./lib.mjs";


const b=fs.readFileSync('/tmp/reg/x/region/r.0.0.mca'); const dv=new DataView(b.buffer,b.byteOffset);
let shown=0;
for(let i=0;i<1024&&shown<1;i++){const loc=dv.getUint32(i*4),off=(loc>>>8)*4096;if(!off)continue;const len=dv.getUint32(off),kind=b[off+4];
 const raw=await inflate(b.subarray(off+5,off+4+len),kind); const root=parseNBT(raw);
 if(i==0){console.log(Object.keys(root)); const s=root.sections[8]; console.log(Object.keys(s), s.block_states&&Object.keys(s.block_states)); console.log(JSON.stringify(s.block_states.palette).slice(0,300)); console.log(root.Heightmaps&&Object.keys(root.Heightmaps), root.Status);}
 for(const s of root.sections||[]){const p=s.block_states&&s.block_states.palette; if(p&&p.some(e=>/lava/.test(e.Name))){console.log('lava sec',root.xPos,root.zPos,s.Y,JSON.stringify(p.filter(e=>/lava/.test(e.Name))));shown++;break;}}
}
