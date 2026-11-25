import fs from 'fs';
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json')); const C=JSON.parse(fs.readFileSync('/tmp/reg/cand.json'));
const loaded=new Set();for(let i=0;i<sc.cl.length;i+=2)loaded.add(sc.cl[i]+','+sc.cl[i+1]);
const all=sc.lavaIn.concat(sc.lavaSky);
const cs=C.filter(c=>c[0]===0&&loaded.has((c[1]>>4)+','+(c[3]>>4))&&c[4]&&c[6]&&c[9]!==1);
const hit=(q)=>all.some(c=>c[0]>=q[1]-9&&c[0]<=q[1]+8&&c[2]>=q[3]-9&&c[2]<=q[3]+8&&c[1]>=q[2]-6&&c[1]<=q[2]+1);
const anyNear=(q)=>all.some(c=>Math.abs(c[0]-q[1])<=24&&Math.abs(c[2]-q[3])<=24);
const T=cs.filter(hit),F=cs.filter(c=>!hit(c));
const avg=(a,f)=>(a.reduce((s,c)=>s+f(c),0)/a.length).toFixed(1);
console.log('n',T.length,F.length);
console.log('surf-y',avg(T,c=>c[7]-c[2]),avg(F,c=>c[7]-c[2]));
console.log('lx',avg(T,c=>c[1]&15),avg(F,c=>c[1]&15),'lz',avg(T,c=>c[3]&15),avg(F,c=>c[3]&15));
console.log('F with any lava within 24',F.filter(anyNear).length);
// y buckets ratio
const b={};for(const c of cs){const k=Math.floor(c[2]/16)*16;b[k]=b[k]||[0,0];b[k][hit(c)?0:1]++;}console.log(b);
