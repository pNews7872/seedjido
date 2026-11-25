import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const s=BigInt.asUintN(64,-1764505425291978715n); e.set_seed(Number(s&0xffffffffn),Number(s>>32n),e.mc_wd());
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json'));
const loaded=new Set();for(let i=0;i<sc.cl.length;i+=2)loaded.add(sc.cl[i]+','+sc.cl[i+1]);
const pred={1:[],2:[],3:[]};const t=Date.now();
for(let tx=-8;tx<8;tx++)for(let tz=-8;tz<8;tz++){const n=e.features_tile(tx,tz);const a=new Int32Array(e.memory.buffer,e.feat_ptr(),n*4);for(let i=0;i<n;i++){const k=a[i*4+3]&15;if(pred[k]&&loaded.has((a[i*4]>>4)+','+(a[i*4+2]>>4)))pred[k].push([a[i*4],a[i*4+1],a[i*4+2],a[i*4+3]]);}}
console.log('pred ms',Date.now()-t);
fs.writeFileSync('/tmp/reg/pred.json',JSON.stringify(pred));
const dun=sc.spawners.filter(s=>['zombie','skeleton','spider'].includes(s[3]));
const MOBS=['skeleton','zombie','zombie','spider'];let dm=0,mm=0;
for(const q of pred[1]){const a=dun.find(s=>s[0]===q[0]&&s[2]===q[2]&&Math.abs(s[1]-q[1])<=1);if(a){dm++;if(MOBS[(q[3]>>4)&3]===a[3])mm++;}}
console.log('dungeons actual',dun.length,'pred',pred[1].length,'matched',dm,'mob ok',mm);
const inBox=(c,q,y0,y1)=>c[0]>=q[0]-1&&c[0]<=q[0]+16&&c[2]>=q[2]-1&&c[2]<=q[2]+16&&c[1]>=y0&&c[1]<=y1;
const sm=pred[3].filter(q=>sc.lavaSky.some(c=>inBox(c,q,q[1]-6,q[1]+1)));
console.log('surface pred',pred[3].length,'matched',sm.length, JSON.stringify(pred[3].map(q=>[q[0],q[1],q[2],sm.includes(q)?1:0])));
const um=pred[2].filter(q=>sc.lavaIn.concat(sc.lavaSky).some(c=>inBox(c,q,q[1]-6,q[1]+1)));
console.log('under pred',pred[2].length,'matched',um.length);
console.log('sky clusters',JSON.stringify(sc.lavaSky.slice(0,30)));
