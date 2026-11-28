import fs from 'fs'; import {out, block} from './cmp263.mjs';
const T=JSON.parse(fs.readFileSync('t116.json'));
const F={portal_1:[3,1,4,2,6],portal_2:[5,2,5,4,8],portal_3:[4,2,5,3,7],portal_4:[4,2,5,3,7],portal_5:[2,1,4,3,8],portal_6:[2,0,4,1,5],portal_7:[3,2,5,0,4],portal_8:[5,2,6,3,8],portal_9:[4,3,6,1,5],giant_portal_1:[5,4,11,3,12],giant_portal_2:[5,4,11,3,12],giant_portal_3:[5,4,11,3,12]};
const R={NONE:0,CLOCKWISE_90:1,CLOCKWISE_180:2,COUNTERCLOCKWISE_90:3};
function tr(x,z,mir,rot,px,pz){if(mir)x=-x;switch(rot){case 2:return[2*px-x,2*pz-z];case 3:return[px-pz+z,px+pz-x];case 1:return[px+pz-z,pz-px+x];default:return[x,z];}}
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');let mem;const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st});const ex=instance.exports;mem=ex.memory;
const s=BigInt.asUintN(64,-1764505425291978715n);ex.set_mcv(35);ex.set_seed(Number(s&0xffffffffn),Number(s>>32n),35);
let ok=0,n=0;
for(const p of out){const f=F[p.tmpl];if(!f)continue;const t=T[p.tmpl],rot=R[p.rot],mir=p.mir==='FRONT_BACK',px=t.s[0]>>1,pz=t.s[2]>>1;
 const good=(ty,tz)=>{const [a,b]=tr(f[0],tz,mir,rot,px,pz);return block(p.x+a,p.y+ty,p.z+b);};
 let best=99,unk=false;for(let a0=f[1];a0<=f[2];a0++)for(let a1=a0+3;a1<=f[2];a1++)for(let c0=f[3];c0<=f[4];c0++)for(let c1=c0+4;c1<=f[4];c1++){let m=0;
  for(let z=a0;z<=a1;z++)for(let y=c0;y<=c1;y++){const ez=z===a0||z===a1,ey=y===c0||y===c1;if(!(ez||ey)||(ez&&ey))continue;const b=good(y,z);if(b==='?')unk=true;if(b!=='obsidian')m++;}best=Math.min(best,m);}
 if(unk)continue; const r=ex.rp_frame(p.cx*16,p.cz*16); n++; if(r===best)ok++; else console.log(p.tmpl,p.x,p.y,p.z,p.vp,'실제',best,'계산',r);}
console.log('필요 개수 일치',ok,'/',n);
