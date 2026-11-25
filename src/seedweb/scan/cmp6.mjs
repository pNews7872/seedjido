import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const s=BigInt.asUintN(64,-1764505425291978715n); e.set_seed(Number(s&0xffffffffn),Number(s>>32n),e.mc_wd());
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json')); const C=JSON.parse(fs.readFileSync('/tmp/reg/cand.json'));
const loaded=new Set();for(let i=0;i<sc.cl.length;i+=2)loaded.add(sc.cl[i]+','+sc.cl[i+1]);
const all=sc.lavaIn.concat(sc.lavaSky);
const cs=C.filter(c=>c[0]===0&&loaded.has((c[1]>>4)+','+(c[3]>>4))&&c[4]&&c[6]);
const hit=(q)=>all.some(c=>c[0]>=q[1]-9&&c[0]<=q[1]+8&&c[2]>=q[3]-9&&c[2]<=q[3]+8&&c[1]>=q[2]-6&&c[1]<=q[2]+1);
const tab={};for(const c of cs){const b=e.biome_at(c[1],c[3],c[2]);const k=b+':'+(hit(c)?'Y':'N');tab[k]=(tab[k]||0)+1}
console.log(Object.entries(tab).sort());
