import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs'; import {makeAssembler, piecesChests} from './jigsaw.mjs';
const W=[],TE=new Map();
for(const f of fs.readdirSync('/tmp/w116')){const b=fs.readFileSync('/tmp/w116/'+f);for(let i=0;i<1024;i++){const off=(b.readUInt32BE(i*4)>>>8)*4096;if(!off)continue;const len=b.readUInt32BE(off);const r=parseNBT(new Uint8Array(zlib.inflateSync(b.subarray(off+5,off+4+len))));const S=r.Level.Structures&&r.Level.Structures.Starts&&r.Level.Structures.Starts.village;if(S&&S.id!=='INVALID')W.push(S);
 for(const te of r.Level.TileEntities||[])if(/chest|barrel/.test(String(te.id)))TE.set(te.x+','+te.y+','+te.z,te);}}
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');let mem;const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st});const ex=instance.exports;mem=ex.memory;ex.set_mcv(19);ex.set_seed(12345,0,19);
const rd=q=>{const u=new Uint8Array(mem.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
const D=JSON.parse(fs.readFileSync('village_1_16.json'));const asm=makeAssembler(D);
for(const S of W){const x=S.ChunkX*16,z=S.ChunkZ*16;const ty=['plains','desert','savanna','taiga','snowy'][ex.subtype_flag(5,x,z)&7];
 const pcs=asm(12345n,S.ChunkX,S.ChunkZ,{startPool:`village/${ty}/town_centers`,y:0,heightFn:(a,b)=>ex.rp_height(a,b),projectStart:true,maxDepth:6,maxDist:80,hack:true,fastutil:true});
 const seqs={},used={};let ok=0,bad=0,opened=0,miss=0;
 for(const c of piecesChests(D,pcs)){const cx=c.x>>4,cz=c.z>>4,k=cx+','+cz;if(!seqs[k])seqs[k]=rd(ex.salt_longs(cx*16,cz*16,40011,64)).trim().split(' ');used[k]=used[k]||0;const ls=BigInt(seqs[k][used[k]++]);if(!c.table)continue;
  const unsure=pcs.slice(0,c.piece).some(q=>q.el.t==='f'&&(q.pos[0]>>4)===cx&&(q.pos[2]>>4)===cz);
  const te=TE.get(c.x+','+c.y+','+c.z);if(!te){miss++;continue;}if(te.LootTableSeed===undefined){opened++;continue;}
  if(BigInt.asIntN(64,te.LootTableSeed)===ls)ok++;else{bad++;console.log('  틀림',c.table,c.x,c.y,c.z,unsure?'(u)':'');}}
 console.log(ty,x,z,'상자 시드 일치',ok,'틀림',bad,'열린 상자',opened,'월드에 없음',miss);}
