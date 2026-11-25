import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const S=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(S&0xffffffffn),Number(S>>32n),e.mc_wd(),-1);
const sc=JSON.parse(fs.readFileSync('/tmp/nscan.json'));const L=2900;
const P=[];for(const [x0,z0] of [[-L,-L],[0,-L],[-L,0],[0,0]]){const n=e.structs_rect(20,x0,z0,x0+L-1,z0+L-1,4096);const a=new Int32Array(e.memory.buffer,e.rect_ptr(),n*4);for(let i=0;i<n;i++)P.push(Array.from(a.slice(i*4,i*4+4)));}
const gh=new Set(sc.ghasts.map(g=>g.join(',')));
const A=new Map(sc.starts.filter(s=>s.id==='minecraft:nether_fossil').map(s=>[s.ch[0].bb[0]+','+s.ch[0].bb[2],s]));
let tp=0,fp=0,fn=0,tn=0,posok=0,matched=0;
for(const q of P){const s=A.get(q[0]+','+q[2]);if(!s)continue;matched++;const bb=s.ch[0].bb;
 const real=sc.ghasts.find(g=>g[0]>=bb[0]&&g[0]<=bb[3]&&g[2]>=bb[2]&&g[2]<=bb[5]&&g[1]===bb[1]);
 const pr=q[3]&1; if(real&&pr){tp++; if(real[0]===q[0]+((q[3]>>4)&15)&&real[2]===q[2]+((q[3]>>8)&15))posok++;} else if(real)fn++; else if(pr)fp++; else tn++;}
console.log('fossils pred',P.length,'matched by BB corner',matched,'ghast TP',tp,'pos exact',posok,'FP',fp,'FN',fn,'TN',tn);
