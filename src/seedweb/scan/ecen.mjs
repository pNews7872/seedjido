import fs from 'fs'; import {block} from './eblk.mjs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const S=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(S&0xffffffffn),Number(S>>32n),e.mc_wd(),1);
const a=new Int32Array(e.memory.buffer,e.end_center(),131);
for(let i=0;i<10;i++){const [x,z,r,h,g]=a.slice(i*5,i*5+5);let top=-1,bars=false;for(let y=40;y<200;y++){const b=block(x,y,z);if(b==='obsidian')top=y;}
 for(let y=h;y<h+5;y++)for(let dx=-r;dx<=r;dx++){if(block(x+dx,y,z+r)==='iron_bars'||block(x+dx,y,z-r)==='iron_bars')bars=true;}
 console.log('spike',x,z,'r',r,'pred top',h,'real obsidian top',top,'cage pred',g,'real',bars);}
console.log('exit portal pred y',a[50],'bedrock at 0,?,0:',[...Array(40)].map((_,i)=>40+i).filter(y=>block(0,y,0)==='bedrock').join(','));
for(let i=0;i<20;i++)console.log('gw',i+1,a.slice(51+i*4,55+i*4).join(','));
