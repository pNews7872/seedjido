import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs'; import {makeAssembler, piecesChests} from './jigsaw.mjs';
const W=[],TE=new Map();
for(const f of fs.readdirSync('/tmp/n116')){const b=fs.readFileSync('/tmp/n116/'+f);for(let i=0;i<1024;i++){const off=(b.readUInt32BE(i*4)>>>8)*4096;if(!off)continue;const len=b.readUInt32BE(off);let r;try{r=parseNBT(new Uint8Array(zlib.inflateSync(b.subarray(off+5,off+4+len))));}catch(e){continue;}const S=r.Level.Structures&&r.Level.Structures.Starts&&r.Level.Structures.Starts.bastion_remnant;if(S&&S.id!=='INVALID')W.push(S);
 for(const te of r.Level.TileEntities||[])if(/chest|barrel/.test(String(te.id)))TE.set(te.x+','+te.y+','+te.z,te);}}
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');let mem;const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st});const ex=instance.exports;mem=ex.memory;ex.set_mcv(19);ex.set_seed_dim(12345,0,19,-1);
const rd=q=>{const u=new Uint8Array(mem.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
const D=JSON.parse(fs.readFileSync('bastion_1_16.json'));const asm=makeAssembler(D);
const lab=c=>String(c.pool_element.location||(c.pool_element.feature&&'f')||'e').replace('minecraft:','')+' '+Array.from(c.BB).join(',');
const SALT=+(process.env.SALT||40012);
for(const S of W){const pcs=asm(12345n,S.ChunkX,S.ChunkZ,{startPool:'bastion/starts',y:33,maxDepth:20,maxDist:80,minY:0,maxY:255,fastutil:!process.env.NOFU,elFirst:true,startSkip:1});
 const wl=S.Children.map(lab).filter(x=>!x.startsWith('f ')),cl=pcs.map(p=>(p.el.l||p.el.t)+' '+p.bb.join(',')).filter(x=>!x.startsWith('f '));let k=0;while(k<wl.length&&k<cl.length&&wl[k]===cl[k])k++;
 const seqs={},used={};let ok=0,bad=0,opened=0,miss=0,badl=[];
 for(const c of piecesChests(D,pcs)){const cx=c.x>>4,cz=c.z>>4,kk=cx+','+cz;if(!seqs[kk])seqs[kk]=rd(ex.salt_longs(cx*16,cz*16,SALT,64)).trim().split(' ');used[kk]=used[kk]||0;const ls=BigInt(seqs[kk][used[kk]++]);if(!c.table)continue;
  const te=TE.get(c.x+','+c.y+','+c.z);if(!te){miss++;continue;}if(te.LootTableSeed===undefined){opened++;continue;}if(BigInt.asIntN(64,te.LootTableSeed)===ls)ok++;else{bad++;badl.push(c.table.split('/').pop()+'@'+c.x+','+c.y+','+c.z+' world '+te.LootTableSeed);}}
 console.log(S.ChunkX*16,S.ChunkZ*16,'조각',wl.length,'/',cl.length,'일치',k,k<wl.length?'첫 차이 월드 '+wl[k]+' | 계산 '+cl[k]:'','| 상자 일치',ok,'틀림',bad,'열림',opened,'없음',miss);for(const b of badl.slice(0,3))console.log('   ',b);}
import {JRandom} from './jigsaw.mjs';
for(const S of W){const r=new JRandom(0n);r.setLargeFeatureSeed(12345n,S.ChunkX,S.ChunkZ);const a=r.nextInt(4),b=r.nextInt(4),c=r.nextInt(4);
 console.log(S.ChunkX*16,S.ChunkZ*16,'월드',String(S.Children[0].pool_element.location).split('/')[1],S.Children[0].rotation,'난수',a,b,c);}
