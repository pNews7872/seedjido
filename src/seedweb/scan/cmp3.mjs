import fs from 'fs';
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json')); const C=JSON.parse(fs.readFileSync('/tmp/reg/cand.json'));
const loaded=new Set();for(let i=0;i<sc.cl.length;i+=2)loaded.add(sc.cl[i]+','+sc.cl[i+1]);
const all=sc.lavaIn.concat(sc.lavaSky);
const hit=(q,y,list,off)=>list.some(c=>c[0]>=q[1]+off-1&&c[0]<=q[1]+off+16&&c[2]>=q[3]+off-1&&c[2]<=q[3]+off+16&&c[1]>=y-6&&c[1]<=y+1);
for(const kind of [0,1]){
  const cs=C.filter(c=>c[0]===kind&&loaded.has((c[1]>>4)+','+(c[3]>>4)));
  for(const off of [0,-8]){
    const act=cs.map(c=>hit(c,c[2],kind?sc.lavaSky:all,off));
    const n=act.filter(Boolean).length;
    // evaluate predictors
    const ev=(name,f)=>{let tp=0,fp=0,fn=0;cs.forEach((c,i)=>{const p=f(c);if(p&&act[i])tp++;else if(p)fp++;else if(act[i])fn++;});console.log(` ${name}: tp ${tp} fp ${fp} fn ${fn}`);};
    console.log(`kind ${kind} off ${off}: candidates ${cs.length}, actually present ${n}`);
    ev('thr only',c=>c[4]);
    ev('thr+shape0',c=>c[4]&&c[5]);
    ev('thr+shape-8',c=>c[4]&&c[6]);
  }
}
