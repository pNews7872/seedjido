import fs from 'fs'; import {block} from './blk.mjs';
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json')); const C=JSON.parse(fs.readFileSync('/tmp/reg/cand.json'));
const loaded=new Set();for(let i=0;i<sc.cl.length;i+=2)loaded.add(sc.cl[i]+','+sc.cl[i+1]);
const all=sc.lavaIn.concat(sc.lavaSky);
const cs=C.filter(c=>c[0]===0&&loaded.has((c[1]>>4)+','+(c[3]>>4))&&c[4]&&c[6]&&c[9]!==1);
const hit=(q)=>all.some(c=>c[0]>=q[1]-9&&c[0]<=q[1]+8&&c[2]>=q[3]-9&&c[2]<=q[3]+8&&c[1]>=q[2]-6&&c[1]<=q[2]+1);
for(const [lab,arr] of [['TP',cs.filter(hit).slice(0,2)],['FP',cs.filter(c=>!hit(c)).slice(0,4)]]) for(const c of arr){
  const [_,x,y,z]=c; const cnt={};
  for(let dx=-8;dx<8;dx++)for(let dz=-8;dz<8;dz++)for(let dy=-4;dy<4;dy++){const b=await block(x+dx,y+dy,z+dz);cnt[b]=(cnt[b]||0)+1;}
  console.log(lab,x,y,z,JSON.stringify(cnt));
}
