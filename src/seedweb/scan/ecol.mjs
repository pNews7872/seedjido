import fs from 'fs'; import {block} from './eblk.mjs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const S=BigInt.asUintN(64,-1764505425291978715n);e.set_seed_dim(Number(S&0xffffffffn),Number(S>>32n),e.mc_wd(),1);
let a=0,b=0,c=0,d=0; let seed=1; const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
for(let n=0;n<3000;n++){const cx=Math.floor(rnd()*480)-240,cz=Math.floor(rnd()*480)-240;
 const q=e.gen_area(16,cx,cz,1,1,64);const pl=new Int32Array(e.memory.buffer,q,1)[0]!==-2;
 const bx=cx*16+8,bz=cz*16+8;let al=false,known=true;for(let y=0;y<128;y+=1){const bl=block(bx,y,bz);if(bl==='?'){known=false;break;}if(bl==='end_stone'){al=true;break;}}
 if(!known)continue; if(pl&&al)a++;else if(!pl&&!al)b++;else if(pl)c++;else d++;}
console.log('column test land/land',a,'void/void',b,'pred land, real void',c,'pred void, real land',d,'agree',((a+b)/(a+b+c+d)*100).toFixed(2)+'%');
