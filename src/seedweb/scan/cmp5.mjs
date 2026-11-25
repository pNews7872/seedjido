import fs from 'fs';
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json')); const C=JSON.parse(fs.readFileSync('/tmp/reg/cand.json'));
const loaded=new Set();for(let i=0;i<sc.cl.length;i+=2)loaded.add(sc.cl[i]+','+sc.cl[i+1]);
const all=sc.lavaIn.concat(sc.lavaSky);
const cs=C.filter(c=>c[0]===0&&loaded.has((c[1]>>4)+','+(c[3]>>4))&&c[4]);
const hit=(q)=>all.some(c=>c[0]>=q[1]-9&&c[0]<=q[1]+8&&c[2]>=q[3]-9&&c[2]<=q[3]+8&&c[1]>=q[2]-6&&c[1]<=q[2]+1);
const tab={};for(const c of cs){const k=`originAir=${c[9]===1} shape=${c[6]} actual=${hit(c)}`;tab[k]=(tab[k]||0)+1}
console.log(tab);
