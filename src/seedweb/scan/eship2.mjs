import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const S=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(S&0xffffffffn),Number(S>>32n),e.mc_wd(),1);
const A=JSON.parse(fs.readFileSync('/tmp/escan.json')).starts.filter(s=>s.id==='minecraft:end_city');
const modes=[];for(const oi of [5,-5])for(const oj of [5,-5])for(const off of [7,8])modes.push([oi,oj,off]);
for(const md of modes){let err=[];for(const s of A){const h=e.ec_dbg(s.cx*16,s.cz*16,...md);err.push(h-s.ch[0].bb[1]);}
 console.log(md.join(','),err.filter(x=>x===0).length+'/'+err.length,err.join(' '));}
