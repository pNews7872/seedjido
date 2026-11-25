import fs from 'fs';
const W=JSON.parse(fs.readFileSync('/tmp/tvw.json')).filter(w=>w[4].includes('village'));
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const rd=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
for(const w of W){let f='';for(let st=4;st<5;st++)for(let di=0;di<120;di++){const l=rd(e.salt_longs(w[0],w[2],di+10000*st,150)).trim().split(' ');const i=l.indexOf(w[3]);if(i>=0)f+=` salt ${di+10000*st} idx ${i}`;}console.log(w.slice(0,3).join(','),w[4],w[5],f||'none');}
