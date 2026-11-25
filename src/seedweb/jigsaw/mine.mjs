import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const S=-1764505425291978715n;
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,S);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const rd=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
// world minecart chests
const W=[];
for(const f of fs.readdirSync('/tmp/ent/entities')){const b=fs.readFileSync('/tmp/ent/entities/'+f);if(b.length<8192)continue;const dv=new DataView(b.buffer,b.byteOffset);
 for(let i=0;i<1024;i++){const off=(dv.getUint32(i*4)>>>8)*4096;if(!off)continue;const len=dv.getUint32(off);let r;try{const raw=zlib.inflateSync(b.subarray(off+5,off+4+len));r=parseNBT(new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength));}catch(x){continue;}
 for(const en of (r.Entities||[])) if(String(en.id).includes('chest_minecart')){const P=Array.from(en.Pos).map(Number);W.push({x:P[0],y:P[1],z:P[2],seed:en.LootTableSeed!==undefined?BigInt.asIntN(64,BigInt(en.LootTableSeed)).toString():null,lt:String(en.LootTable||'')});}}}
console.log('world chest minecarts',W.length,'with seed',W.filter(w=>w.seed).length);
// predicted
const n=e.structs_rect(15,-3000,-3000,3000,3000,4096);const a=new Int32Array(e.memory.buffer,e.rect_ptr(),n*4).slice();
const P=[];for(let i=0;i<n;i++){const t=rd(e.loot_struct(15,a[i*4],a[i*4+2],60));for(const l of t.split('\n')){const f=l.split('|');if(f[0]==='C')P.push({x:+f[2],z:+f[3],seed:BigInt.asIntN(64,BigInt(f[4])).toString()});}}
console.log('predicted mineshaft chests',P.length);
const ps=new Set(P.map(q=>q.seed));let ok=0,bad=[];
for(const w of W.filter(w=>w.seed)){if(ps.has(w.seed))ok++;else{const near=P.filter(q=>Math.abs(q.x-w.x)<3&&Math.abs(q.z-w.z)<3);bad.push([Math.floor(w.x),Math.floor(w.y),Math.floor(w.z),near.length?'pred-at-pos seed differs':'no pred near']);}}
console.log('seed match',ok,'/',W.filter(w=>w.seed).length);console.log(bad.slice(0,15));
const ws=new Set(W.map(w=>Math.floor(w.x)+','+Math.floor(w.z)));
let stat={};
for(const w of W.filter(w=>w.seed&&!ps.has(w.seed))){const X=Math.floor(w.x),Z=Math.floor(w.z);let f='none';
 for(const salt of [30001,30002,30000]){const l=rd(e.salt_longs(X,Z,salt,40)).trim().split(' ');const i=l.indexOf(w.seed);if(i>=0){f='salt'+salt+' idx'+i;break;}}
 const nearShaft=P.some(q=>Math.abs(q.x-X)<200&&Math.abs(q.z-Z)<200);
 const nearCnt=P.filter(q=>(q.x>>4)===(X>>4)&&(q.z>>4)===(Z>>4)).length;
 const k=f.split(' ')[0]+(nearShaft?' shaftNear':' noShaft')+' predInChunk'+nearCnt;stat[k]=(stat[k]||0)+1;}
console.log(stat);
