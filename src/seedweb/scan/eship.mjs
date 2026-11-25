import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const S=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(S&0xffffffffn),Number(S>>32n),e.mc_wd(),1);
const sc=JSON.parse(fs.readFileSync('/tmp/escan.json'));const L=3900;
const r=[];for(const [x0,z0] of [[-L,-L],[0,-L],[-L,0],[0,0]]){const n=e.structs_rect(121,x0,z0,x0+L-1,z0+L-1,4096);const a=new Int32Array(e.memory.buffer,e.rect_ptr(),n*4);for(let i=0;i<n;i++)r.push(Array.from(a.slice(i*4,i*4+4)));}
const A=new Map(sc.starts.filter(s=>s.id==='minecraft:end_city').map(s=>[s.cx+','+s.cz,s]));
let d=[];for(const q of r){const s=A.get((q[0]>>4)+','+(q[2]>>4));if(!s)continue;const sh=s.ch.find(c=>c.t&&c.t.includes('ship'));if(!sh)continue;
 const f=q[3],dz=(f&511)-256,dx=((f>>9)&511)-256,ry=(f>>18)&63;const py=q[1]+ry*2-8;
 const ax=(sh.bb[0]+sh.bb[3])/2,az=(sh.bb[2]+sh.bb[5])/2;d.push([py-sh.bb[1],Math.round(q[0]+dx-ax),Math.round(q[2]+dz-az),s.ch[0].bb[1]]);}
console.log(d.length,JSON.stringify(d));
