import fs from 'fs';
const W=JSON.parse(fs.readFileSync('/tmp/tvw.json'));
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const rd=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
for(const key of ['trial','village']){const ws=W.filter(w=>w[4].includes(key)).slice(0,5);const hits={};
for(const w of ws)for(let st=0;st<11;st++)for(let di=0;di<40;di++){const l=rd(e.salt_longs(w[0],w[2],di+10000*st,40)).trim().split(' ');if(l.includes(w[3])){const k=di+10000*st;hits[k]=(hits[k]||0)+1;}}
console.log(key,hits);}
