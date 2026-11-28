import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
import {makeAssembler} from './jigsaw.mjs';
const W=[];
for(const f of fs.readdirSync('/tmp/w116')){const b=fs.readFileSync('/tmp/w116/'+f);for(let i=0;i<1024;i++){const off=(b.readUInt32BE(i*4)>>>8)*4096;if(!off)continue;const len=b.readUInt32BE(off);const r=parseNBT(new Uint8Array(zlib.inflateSync(b.subarray(off+5,off+4+len))));const S=r.Level.Structures&&r.Level.Structures.Starts&&r.Level.Structures.Starts.village;if(S&&S.id!=='INVALID')W.push(S);}}
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');let mem;const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st});const ex=instance.exports;mem=ex.memory;
ex.set_mcv(19);ex.set_seed(12345,0,19);
const D=JSON.parse(fs.readFileSync(process.env.VF||'village_1_16.json'));const asm=makeAssembler(D);
const VT=["plains","desert","savanna","taiga","snowy"];
for(const S of W){const x=S.ChunkX*16,z=S.ChunkZ*16;const ty=VT[ex.subtype_flag(5,x,z)&7];
 const pcs=asm(12345n,S.ChunkX,S.ChunkZ,{startPool:`village/${ty}/town_centers`,y:0,heightFn:(a,b)=>ex.rp_height(a,b),projectStart:true,maxDepth:6,maxDist:80,hack:true,fastutil:true});
 const RN={NONE:0,CLOCKWISE_90:1,CLOCKWISE_180:2,COUNTERCLOCKWISE_90:3};const wl=S.Children.map(c=>[String(c.pool_element.location||(c.pool_element.elements&&'list')||(c.pool_element.feature&&'f')||'?').replace('minecraft:',''),...Array.from(c.BB)].join(' ')+(process.env.RD?' r'+RN[c.rotation]:''));
 const cl=(pcs||[]).map(p=>[(p.el.l||(p.el.t==='l'?'list':p.el.t==='f'?'f':'?')),...p.bb].join(' ')+(process.env.RD?' r'+p.rot:''));
 const nf=x=>!x.startsWith('f ');const wl2=wl.filter(nf),cl2=cl.filter(nf);let same=0;for(let i=0;i<Math.min(wl2.length,cl2.length);i++){if(wl2[i]===cl2[i])same++;else{console.log('  첫 차이',i,'월드',wl2[i],'| 계산',cl2[i]);break;}}
 console.log(ty,x,z,'월드 조각(지형장식 제외)',wl2.length,'계산',cl2.length,'일치',same);}
{const S=W[0];console.log(S.Children.slice(0,3).map(c=>[c.pool_element.location,c.rotation,c.PosX,c.PosY,c.PosZ,c.ground_level_delta].join(' ')).join('\n'));
 const pcs=asm(12345n,S.ChunkX,S.ChunkZ,{startPool:`village/plains/town_centers`,y:0,heightFn:(a,b)=>ex.rp_height(a,b),projectStart:true,maxDepth:6,maxDist:80,hack:true});
 console.log(pcs.slice(0,3).map(p=>[p.el.l,p.rot,...p.pos].join(' ')).join('\n')); console.log(JSON.stringify(D.T['village/plains/town_centers/plains_fountain_01']?.j), JSON.stringify(D.T['village/common/well_bottom'].j), D.T['village/common/well_bottom'].s);}
if(process.env.SHOW){const [vi,a,b]=process.env.SHOW.split(',').map(Number);const S=W[vi];const ty=VT[ex.subtype_flag(5,S.ChunkX*16,S.ChunkZ*16)&7];
 const pcs=asm(12345n,S.ChunkX,S.ChunkZ,{startPool:`village/${ty}/town_centers`,y:0,heightFn:(a,b)=>ex.rp_height(a,b),projectStart:true,maxDepth:6,maxDist:80,hack:true,fastutil:true});
 for(let i=a;i<b;i++){const c=S.Children[i],p=pcs[i];console.log(i,'W',String(c.pool_element.location||(c.pool_element.feature&&'f')||'e').replace('minecraft:',''),c.rotation,Array.from(c.BB).join(','),JSON.stringify(c.junctions[0]||{}),'| C',p&&(p.el.l||p.el.t),p&&p.rot,p&&p.bb.join(','),'depth',p&&p.depth);}}
if(process.env.NEAR){const S=W[0];const pcs=asm(12345n,S.ChunkX,S.ChunkZ,{startPool:`village/plains/town_centers`,y:0,heightFn:(a,b)=>ex.rp_height(a,b),projectStart:true,maxDepth:6,maxDist:80,hack:true,fastutil:true});
 const [x,y,z]=[-745,71,-402];pcs.forEach((p,i)=>{const b=p.bb;if(x>=b[0]-1&&x<=b[3]+1&&z>=b[2]-1&&z<=b[5]+1)console.log(i,p.el.l||p.el.t,p.el.pr,'rot',p.rot,b.join(','),'jn',JSON.stringify(p.jn.slice(0,1)),'depth',p.depth);});
 for(const [a,b] of [[-745,-402],[-745,-403],[-746,-402],[-744,-402]])console.log('h',a,b,ex.rp_height(a,b));}
