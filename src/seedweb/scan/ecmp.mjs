import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const S=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(S&0xffffffffn),Number(S>>32n),e.mc_wd(),1);
const sc=JSON.parse(fs.readFileSync('/tmp/escan.json'));const L=3900;
const inR=(x,z)=>x>=-L&&x<L&&z>=-L&&z<L;
function pred(st,L2=L){const r=[];for(const [x0,z0] of [[-L2,-L2],[0,-L2],[-L2,0],[0,0]]){const n=e.structs_rect(st,x0,z0,x0+L2-1,z0+L2-1,4096);if(n<0){console.log('too many',st);continue;}const a=new Int32Array(e.memory.buffer,e.rect_ptr(),n*4);for(let i=0;i<n;i++)r.push(Array.from(a.slice(i*4,i*4+4)));}return r;}
const P21=pred(21),P121=pred(121);const P=P21.concat(P121.map(q=>[...q,'ship']));
const A=sc.starts.filter(s=>s.id==='minecraft:end_city'&&inR(s.cx*16,s.cz*16));
const am=new Map(A.map(s=>[s.cx+','+s.cz,s]));let tp=0,fp=[],shipOk=0,shipBad=0,shipPos=0;const used=new Set();
for(const q of P){const k=(q[0]>>4)+','+(q[2]>>4);const s=am.get(k);if(!s){fp.push(q);continue;}tp++;used.add(k);
 const shipPiece=s.ch.find(c=>c.t&&c.t.includes('ship'));const hasShip=!!shipPiece;const pr=q[4]==='ship';
 if(hasShip===pr)shipOk++;else shipBad++;
 if(hasShip&&pr){const bb=shipPiece.bb;const sx=q[0]+((q[3]>>12)-2048),sz=q[2]+((q[3]&4095)-2048);if(sx>=bb[0]&&sx<=bb[3]&&sz>=bb[2]&&sz<=bb[5])shipPos++;}}
const fn=A.filter(s=>!used.has(s.cx+','+s.cz));
const nship=A.filter(s=>s.ch.some(c=>c.t&&c.t.includes('ship'))).length;console.log('ships actual',nship);console.log('end city pred',P.length,'actual',A.length,'TP',tp,'FP',fp.length,'FN',fn.length,'ship type ok',shipOk,'bad',shipBad,'ship pos inside',shipPos);
console.log('FP',fp.slice(0,6).map(q=>q.slice(0,3).join(',')).join(' | '),' FN',fn.slice(0,6).map(s=>s.cx*16+','+s.cz*16).join(' | '));
// gateways
const G=[];for(let x0=-L;x0<L;x0+=1000)for(let z0=-L;z0<L;z0+=1000){const n=e.structs_rect(22,x0,z0,Math.min(L,x0+1000)-1,Math.min(L,z0+1000)-1,4096);const a=new Int32Array(e.memory.buffer,e.rect_ptr(),Math.max(0,n)*4);for(let i=0;i<n;i++)G.push(Array.from(a.slice(i*4,i*4+4)));}
const gs=sc.gates.filter(g=>inR(g[0],g[2]));let gtp=0,gnear=0;const gfp=[];
for(const q of G){if(!inR(q[0],q[2]))continue;const ex=gs.find(g=>g[0]===q[0]&&g[2]===q[2]);if(ex){gtp++;continue;}const nr=gs.find(g=>Math.abs(g[0]-q[0])<=16&&Math.abs(g[2]-q[2])<=16);if(nr)gnear++;else gfp.push(q);}
const gpred=G.filter(q=>inR(q[0],q[2]));
const gfn=gs.filter(g=>!gpred.some(q=>Math.abs(g[0]-q[0])<=16&&Math.abs(g[2]-q[2])<=16));
console.log('gateways pred',gpred.length,'actual',gs.length,'exact xz',gtp,'within16',gnear,'FP',gfp.length,'FN',gfn.length, 'FN sample',gfn.slice(0,8).map(g=>g.join(',')).join(' | '));
// 섬/허공: 청크마다 (지도 계산: 16칸 축척 바이옴이 -2면 허공) vs (실제: 엔드 돌 있음)
const land=new Map();for(let i=0;i<sc.land.length;i+=3)land.set(sc.land[i]+','+sc.land[i+1],sc.land[i+2]);
let a=0,b=0,c=0,d=0;
for(let tz=-244;tz<244;tz+=61)for(let tx=-244;tx<244;tx+=61){const q=e.gen_area(16,tx,tz,61,61,64);const ids=new Int32Array(e.memory.buffer,q,61*61).slice();
 for(let j=0;j<61;j++)for(let i=0;i<61;i++){const k=(tx+i)+','+(tz+j);if(!land.has(k))continue;const pl=ids[j*61+i]!==-2,al=land.get(k)===1;if(pl&&al)a++;else if(!pl&&!al)b++;else if(pl&&!al)c++;else d++;}}
console.log('chunks land/land',a,'void/void',b,'pred land but void',c,'pred void but land',d,'agree',((a+b)/(a+b+c+d)*100).toFixed(2)+'%');
