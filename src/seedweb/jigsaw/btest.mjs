import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs'; import {makeAssembler,piecesChests} from './jigsaw.mjs';
const S=-1764505425291978715n;
const starts=[],BE=new Map();
for(const d of ['/tmp/nreg/1','/tmp/nreg/2'])for(const f of fs.readdirSync(d)){const b=fs.readFileSync(d+'/'+f);if(b.length<8192)continue;const dv=new DataView(b.buffer,b.byteOffset);
 for(let i=0;i<1024;i++){const off=(dv.getUint32(i*4)>>>8)*4096;if(!off)continue;const len=dv.getUint32(off);let r;try{const raw=zlib.inflateSync(b.subarray(off+5,off+4+len));r=parseNBT(new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength));}catch(x){continue;}
  const st=r.structures&&r.structures.starts;if(st)for(const [k,v] of Object.entries(st))if(k.includes('bastion')&&v.Children)starts.push({cx:Number(v.ChunkX),cz:Number(v.ChunkZ),ch:v.Children.map(c=>({t:String(c.pool_element?.location||c.pool_element?.elements?.[0]?.location||''),bb:Array.from(c.BB).map(Number)}))});
  for(const be of (r.block_entities||[])) if(be.LootTable&&String(be.LootTable).includes('bastion')) BE.set(be.x+','+be.y+','+be.z,BigInt.asIntN(64,BigInt(be.LootTableSeed)).toString());}}
console.log('bastions',starts.length,'chests',BE.size);
const D=JSON.parse(fs.readFileSync('bastion.json'));const asm=makeAssembler(D);
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,S);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),-1);
const rd=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
let full=0,ok=0,bad=0,miss=0;
for(const st of starts){const pcs=asm(S,st.cx,st.cz,{startPool:'bastion/starts',y:33,maxDepth:6,maxDist:80,minY:0,maxY:255});
 let same=0;for(let i=0;i<st.ch.length;i++)if(pcs[i]&&pcs[i].bb.join()===st.ch[i].bb.join())same++;
 if(same===st.ch.length&&pcs.length===st.ch.length)full++;else console.log('bastion',st.cx,st.cz,'pieces',same,'/',st.ch.length,'pred',pcs.length);
 const seqs={},used={};
 for(const c of piecesChests(D,pcs)){const cx=c.x>>4,cz=c.z>>4,k=cx+','+cz;if(!seqs[k])seqs[k]=rd(e.salt_longs(cx*16,cz*16,+process.argv[2]||40018,64)).trim().split(' ');used[k]=used[k]||0;const sd=seqs[k][used[k]++];
  if(!c.table)continue;const w=BE.get(c.x+','+c.y+','+c.z);if(!w){miss++;continue;}if(w===sd)ok++;else{bad++;console.log(' BAD',c.x,c.y,c.z,c.table,'idx',seqs[k].indexOf(w),'used',used[k]-1);}}}
console.log('full',full,'/',starts.length,'chest ok',ok,'bad',bad,'miss',miss);
