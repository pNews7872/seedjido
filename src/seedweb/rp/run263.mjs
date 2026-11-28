import fs from 'fs'; import {out} from './cmp263.mjs';
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');let mem;const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st});const ex=instance.exports;mem=ex.memory;
const VP=["on_land_surface","underground","in_mountain","partly_buried","on_ocean_floor"],RT=["NONE","CLOCKWISE_90","CLOCKWISE_180","COUNTERCLOCKWISE_90"];
const V=+(process.env.V||35);
for(const sd of (process.env.SEEDS||"").split(",")){const s=BigInt.asUintN(64,BigInt(sd));ex.set_mcv(V);ex.set_seed(Number(s&0xffffffffn),Number(s>>32n),V);let ok=0,n=0,bad=[];
 for(const w of out){n++;const r=ex.rp_frame(w.cx*16,w.cz*16);const o=new Int32Array(mem.buffer,ex.out_ptr(),128);const t=o[102]<10?"portal_"+(o[102]+1):"giant_portal_"+(o[102]-9);
  const same=t===w.tmpl&&RT[o[106]]===w.rot&&(o[107]?"FRONT_BACK":"NONE")===w.mir&&o[100]===w.y&&VP[o[101]]===w.vp; if(same)ok++; else bad.push(`${w.k} ${w.x},${w.z} 월드 ${w.tmpl} ${w.rot} y${w.y} ${w.vp} / 계산 ${t} ${RT[o[106]]} y${o[100]} ${VP[o[101]]}`);}
 console.log(sd,'일치',ok,'/',n); for(const b of bad.slice(0,15))console.log('  ',b);}
