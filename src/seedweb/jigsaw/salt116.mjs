import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const ch=[];
for(const f of fs.readdirSync('/tmp/w116')){const b=fs.readFileSync('/tmp/w116/'+f);for(let i=0;i<1024;i++){const off=(b.readUInt32BE(i*4)>>>8)*4096;if(!off)continue;const len=b.readUInt32BE(off);const r=parseNBT(new Uint8Array(zlib.inflateSync(b.subarray(off+5,off+4+len))));for(const te of r.Level.TileEntities||[])if(te.LootTable&&String(te.LootTable).includes('village'))ch.push({x:te.x,y:te.y,z:te.z,t:String(te.LootTable),s:BigInt.asIntN(64,te.LootTableSeed)});}}
console.log(ch.map(c=>c.t+' '+c.x+','+c.y+','+c.z+' '+c.s).join('\n'));
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');let mem;const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st});const ex=instance.exports;mem=ex.memory;ex.set_mcv(19);ex.set_seed(12345,0,19);
const rd=q=>{const u=new Uint8Array(mem.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
for(const c of ch){for(let salt=0;salt<100000;salt++){const L=rd(ex.salt_longs(c.x,c.z,salt,8)).trim().split(' ').map(BigInt);const k=L.indexOf(c.s);if(k>=0){console.log(c.t,'salt',salt,'index',k);break;}}}
