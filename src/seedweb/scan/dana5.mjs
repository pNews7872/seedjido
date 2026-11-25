import fs from 'fs';
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json')); const D=JSON.parse(fs.readFileSync('/tmp/reg/dcand5.json'));
const loaded=new Set();for(let i=0;i<sc.cl.length;i+=2)loaded.add(sc.cl[i]+','+sc.cl[i+1]);
const act=new Map();for(const s of sc.spawners)if(['zombie','skeleton','spider'].includes(s[3]))act.set(s[0]+','+s[1]+','+s[2],s[3]);
const cand=D.filter(d=>loaded.has((d[0]>>4)+','+(d[2]>>4)));
const candSet=new Set(cand.map(d=>d[0]+','+d[1]+','+d[2]));
let tp=0,fp=0,fnIn=0; const fnList=[],fpList=[];
for(const d of cand){const a=act.get(d[0]+','+d[1]+','+d[2]); if(d[3]&&a)tp++; else if(d[3]){fp++;fpList.push(d)} else if(a){fnIn++;fnList.push(d)}}
const notCand=[...act.keys()].filter(k=>!candSet.has(k));
console.log('tp',tp,'fp',fp,'fn(candidate but we failed)',fnIn,'actual not on our chain',notCand.length,'actual total',act.size);
const why=a=>{const h={};for(const d of a){const k=d[5]?'floor':d[6]?'ceil':d[4]==0?'open0':d[4]>5?'open>5':'ok';h[k]=(h[k]||0)+1}return JSON.stringify(h)};
console.log('FN reasons',why(fnList)); console.log('FP open dist',JSON.stringify(fpList.reduce((h,d)=>(h[d[4]]=(h[d[4]]||0)+1,h),{})));
fs.writeFileSync('/tmp/reg/dlists.json',JSON.stringify({fnList,fpList,notCand}));
