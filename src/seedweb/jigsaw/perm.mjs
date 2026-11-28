import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs'; import {makeAssembler} from './jigsaw.mjs';
const W=[];
for(const f of fs.readdirSync('/tmp/w116')){const b=fs.readFileSync('/tmp/w116/'+f);for(let i=0;i<1024;i++){const off=(b.readUInt32BE(i*4)>>>8)*4096;if(!off)continue;const len=b.readUInt32BE(off);const r=parseNBT(new Uint8Array(zlib.inflateSync(b.subarray(off+5,off+4+len))));const S=r.Level.Structures&&r.Level.Structures.Starts&&r.Level.Structures.Starts.village;if(S&&S.id!=='INVALID')W.push(S);}}
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');let mem;const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st});const ex=instance.exports;mem=ex.memory;ex.set_mcv(19);ex.set_seed(12345,0,19);
const hc=new Map();const hf=(a,b)=>{const k=a+','+b;if(!hc.has(k))hc.set(k,ex.rp_height(a,b));return hc.get(k);};
const base=JSON.parse(fs.readFileSync('village_1_16.json'));
const lab=c=>String(c.pool_element.location||(c.pool_element.feature&&'f')||'e').replace('minecraft:','')+' '+Array.from(c.BB).join(',');
const wl=W.map(S=>S.Children.map(lab));
function score(D){const asm=makeAssembler(D);let tot=[];W.forEach((S,vi)=>{const ty=['plains','desert','savanna','taiga','snowy'][ex.subtype_flag(5,S.ChunkX*16,S.ChunkZ*16)&7];
 const pcs=asm(12345n,S.ChunkX,S.ChunkZ,{startPool:`village/${ty}/town_centers`,y:0,heightFn:hf,projectStart:true,maxDepth:6,maxDist:80,hack:true,fastutil:true});
 const cl=pcs.map(p=>(p.el.l||(p.el.t==='f'?'f':p.el.t))+' '+p.bb.join(','));let k=0;while(k<cl.length&&k<wl[vi].length&&cl[k]===wl[vi][k])k++;tot.push(k+'/'+wl[vi].length);});return tot.join(' ');}
const pool=process.argv[2]||'village/plains/decor';const el0=base.P[pool].el;
const perms=a=>a.length<=1?[a]:a.flatMap((x,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[x,...p]));
console.log('base',score(base));
for(const p of perms(el0.map((e,i)=>i))){const D=structuredClone(base);D.P[pool].el=p.map(i=>el0[i]);const s=score(D);if(!s.startsWith('56/')||true)console.log(p.join(''),s);}
