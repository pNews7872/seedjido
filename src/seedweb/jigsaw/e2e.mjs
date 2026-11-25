import fs from 'fs'; import vm from 'vm';
const src=fs.readFileSync('/home/claude/seedjido-repo/public/app.js','utf8');
const fn=src.slice(src.indexOf('function ancientCityLoot'),src.indexOf('const LOOT_ST'));
const jg=src.slice(src.indexOf('// 조각 조립식'));
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,-1764505425291978715n);const lo=Number(SU&0xffffffffn)|0,hi=Number(SU>>32n)|0;e.set_seed_dim(lo,hi,e.mc_wd(),0);
const ctx={hoverEx:e,mapState:{lo,hi},BigInt,Number,console};vm.createContext(ctx);vm.runInContext(jg+fn+';this.f=ancientCityLoot;',ctx);
const rdq=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
const t=ctx.f(112,-1440,rdq);console.log(t.split('\n').length);console.log(t.split('\n').slice(0,14).join('\n'));
