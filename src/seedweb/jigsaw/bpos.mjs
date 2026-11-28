import fs from 'fs'; import {makeAssembler, piecesChests} from './jigsaw.mjs';
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');let mem;const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st});const ex=instance.exports;mem=ex.memory;ex.set_mcv(19);ex.set_seed_dim(12345,0,19,-1);
const n=ex.structs_rect(19,-400,-400,400,400,64);const a=new Int32Array(mem.buffer,ex.rect_ptr(),n*4).slice();
const D=JSON.parse(fs.readFileSync('bastion_1_16.json'));const asm=makeAssembler(D);
for(let i=0;i<n;i++){const x=a[i*4],z=a[i*4+2];const pcs=asm(12345n,x>>4,z>>4,{startPool:'bastion/starts',y:33,maxDepth:6,maxDist:80,minY:0,maxY:255,fastutil:true});
 const ch=piecesChests(D,pcs).filter(c=>c.table);const kind=pcs[0].el.l.split('/').slice(1,2)[0];console.log(x,z,'시작',pcs[0].el.l,'조각',pcs.length,'상자',ch.length, ch.slice(0,2).map(c=>c.x+','+c.y+','+c.z).join(' '));}
