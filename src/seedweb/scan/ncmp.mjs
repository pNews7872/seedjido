import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const S=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(S&0xffffffffn),Number(S>>32n),e.mc_wd(),-1);
const sc=JSON.parse(fs.readFileSync('/tmp/nscan.json'));
const L=2900;
function pred(st){const r=[];for(const [x0,z0] of [[-L,-L],[0,-L],[-L,0],[0,0]]){const n=e.structs_rect(st,x0,z0,x0+L-1,z0+L-1,4096);const a=new Int32Array(e.memory.buffer,e.rect_ptr(),n*4);for(let i=0;i<n;i++)r.push([a[i*4],a[i*4+1],a[i*4+2],a[i*4+3]]);}return r;}
const inR=(x,z)=>x>=-L&&x<L&&z>=-L&&z<L;
function cmp(name,st,id){
  const P=pred(st); const A=sc.starts.filter(s=>s.id===id&&inR(s.cx*16,s.cz*16));
  const aset=new Map(A.map(s=>[s.cx+','+s.cz,s])); let tp=0,fp=[];const used=new Set();
  for(const q of P){const k=(q[0]>>4)+','+(q[2]>>4); if(aset.has(k)){tp++;used.add(k);} else fp.push(q);}
  const fn=A.filter(s=>!used.has(s.cx+','+s.cz));
  console.log(name,'pred',P.length,'actual',A.length,'TP',tp,'FP',fp.length,'FN',fn.length, fp.slice(0,3).map(q=>q.slice(0,3).join(',')).join(' | '), fn.slice(0,3).map(s=>s.cx*16+','+s.cz*16).join(' | '));
  return {P,A,aset};
}
cmp('fortress',18,'minecraft:fortress');
const RP=cmp('ruined portal',12,'minecraft:ruined_portal_nether');
// bastion type
const B=cmp('bastion',19,'minecraft:bastion_remnant');
const T={units:0,hoglin_stable:1,treasure:2,bridge:3};let ok=0,bad=0;const conf={};
for(const q of B.P){const s=B.aset.get((q[0]>>4)+','+(q[2]>>4));if(!s)continue;const t=s.ch[0].t.split('/')[1];const k=T[t];if(k===q[3])ok++;else{bad++;conf[q[3]+'->'+t]=(conf[q[3]+'->'+t]||0)+1;}}
console.log('bastion type ok',ok,'bad',bad,conf);
// fossils
const F=cmp('fossil',20,'minecraft:nether_fossil');
// y and ghast
let yok=0,ydiff=[],gtp=0,gfp=0,gfn=0,gtn=0;
const gh=sc.ghasts;
const ghIn=(bb)=>gh.some(g=>g[0]>=bb[0]-2&&g[0]<=bb[3]+2&&g[2]>=bb[2]-2&&g[2]<=bb[5]+2&&g[1]>=bb[1]-3&&g[1]<=bb[4]+3);
for(const q of F.P){const s=F.aset.get((q[0]>>4)+','+(q[2]>>4));if(!s)continue;const bb=s.ch[0].bb; if(bb[1]===q[1])yok++; else ydiff.push(q[1]-bb[1]);
  const real=ghIn(bb); const pr=q[3]&1; if(real&&pr)gtp++;else if(real&&!pr)gfn++;else if(!real&&pr)gfp++;else gtn++;}
console.log('fossil y exact',yok,'diff sample',ydiff.slice(0,10));
console.log('ghast TP',gtp,'FP',gfp,'FN',gfn,'TN',gtn);
// blaze spawners
const BS=pred(102); const AS=sc.spawners.filter(s=>String(s[3]).includes('blaze')&&inR(s[0],s[2]));
const as=new Set(AS.map(s=>s.join(',').split(',').slice(0,3).join(',')));let btp=0,near=0;for(const q of BS){const k=q.slice(0,3).join(',');if(as.has(k))btp++;else if(AS.some(s=>Math.abs(s[0]-q[0])<=1&&Math.abs(s[2]-q[2])<=1&&Math.abs(s[1]-q[1])<=2))near++;}
console.log('blaze pred',BS.length,'actual',AS.length,'exact',btp,'near',near);
// 마른 가스트 위치 분석
const grid=new Map();for(const g of gh){const k=(g[0]>>4)+','+(g[2]>>4);(grid.get(k)||grid.set(k,[]).get(k)).push(g);}
const dys=[],dxz=[];let none=0;
for(const q of F.P){if(!(q[3]&1))continue;const s=F.aset.get((q[0]>>4)+','+(q[2]>>4));if(!s)continue;const bb=s.ch[0].bb;
 let best=null,bd=1e9;for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(const g of grid.get(((q[0]>>4)+dx)+','+((q[2]>>4)+dz))||[]){const d=Math.max(Math.abs(g[0]-(bb[0]+bb[3])/2),Math.abs(g[2]-(bb[2]+bb[5])/2));if(d<bd){bd=d;best=g;}}
 if(!best||bd>16){none++;continue;} dys.push(best[1]-bb[1]); dxz.push([best[0]-bb[0],best[2]-bb[2],bb[3]-bb[0],bb[5]-bb[2]]);}
const hist=a=>{const h={};for(const v of a)h[v]=(h[v]||0)+1;return h;};
console.log('pred-ghast fossils: none within16',none,'dy hist',hist(dys));
console.log(dxz.slice(0,15).map(v=>v.join(',')).join(' | '));
// ghasts not near any fossil BB
let orphan=0;for(const g of gh){if(!inR(g[0],g[2]))continue;let near=false;for(let dx=-1;dx<=1&&!near;dx++)for(let dz=-1;dz<=1&&!near;dz++){for(const s of [F.aset.get(((g[0]>>4)+dx)+','+((g[2]>>4)+dz))]){if(s){const bb=s.ch[0].bb;if(g[0]>=bb[0]-3&&g[0]<=bb[3]+3&&g[2]>=bb[2]-3&&g[2]<=bb[5]+3)near=true;}}}if(!near)orphan++;}
console.log('ghasts total in range',gh.filter(g=>inR(g[0],g[2])).length,'not near a fossil start chunk',orphan);
