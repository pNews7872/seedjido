import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs'; import {makeAssembler} from './jigsaw.mjs';
const S=-1764505425291978715n, Y=+(process.argv[2]||-49);
const data=JSON.parse(fs.readFileSync('ancient_city.json'));
const pcs=makeAssembler(data)(S,7,-90,{startPool:'ancient_city/city_center',startJigsaw:'minecraft:city_anchor',y:-27,maxDepth:7,maxDist:116});
let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of pcs){x0=Math.min(x0,p.bb[0]);x1=Math.max(x1,p.bb[3]);z0=Math.min(z0,p.bb[2]);z1=Math.max(z1,p.bb[5]);}
x0-=32;z0-=32;x1+=32;z1+=32;const W=x1-x0+1,H=z1-z0+1;
// world
const world=new Int8Array(W*H).fill(-1);const regs={};
for(let cz=z0>>4;cz<=z1>>4;cz++)for(let cx=x0>>4;cx<=x1>>4;cx++){const rf=`/tmp/reg/x/region/r.${cx>>5}.${cz>>5}.mca`;if(!fs.existsSync(rf))continue;const b=regs[rf]||(regs[rf]=fs.readFileSync(rf));const dv=new DataView(b.buffer,b.byteOffset);const i=(cx&31)+(cz&31)*32;const off=(dv.getUint32(i*4)>>>8)*4096;if(!off)continue;const len=dv.getUint32(off);const raw=zlib.inflateSync(b.subarray(off+5,off+4+len));const r=parseNBT(new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength));
 const sec=(r.sections||[]).find(s=>Number(s.Y)===(Y>>4));if(!sec)continue;const pal=sec.block_states.palette.map(p=>String(p.Name||Object.values(p)[0]));const dat=sec.block_states.data;const bits=Math.max(4,Math.ceil(Math.log2(pal.length)));const per=Math.floor(64/bits);
 for(let lz=0;lz<16;lz++)for(let lx=0;lx<16;lx++){const X=cx*16+lx,Z=cz*16+lz;if(X<x0||X>x1||Z<z0||Z>z1)continue;let id=0;if(dat){const idx=(Y&15)*256+lz*16+lx;const L=dat.dv.getBigUint64(dat.off+Math.floor(idx/per)*8);id=Number((L>>BigInt((idx%per)*bits))&((1n<<BigInt(bits))-1n));}
  const n=pal[id]||'';world[(Z-z0)*W+(X-x0)]=/air$/.test(n)?1:/water/.test(n)?2:/lava/.test(n)?3:0;}}
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,S);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const inP=(X,Z)=>pcs.some(p=>p.el.t!=='f'&&X>=p.bb[0]&&X<=p.bb[3]&&Z>=p.bb[2]&&Z<=p.bb[5]&&Y>=p.bb[1]&&Y<=p.bb[4]);
const mask=new Uint8Array(W*H);for(let z=0;z<H;z++)for(let x=0;x<W;x++)mask[z*W+x]=inP(x+x0,z+z0);
function run(beard){
 if(beard){const rig=[],jn=[];for(const q of pcs){if(q.el.pr!=='t')rig.push(...q.bb,q.gld||1,3);for(const j of q.jn||[])jn.push(...j);}
  const a=e.malloc(rig.length*4+4),b=e.malloc(jn.length*4+4);new Int32Array(e.memory.buffer,a,rig.length).set(rig);new Int32Array(e.memory.buffer,b,jn.length).set(jn);e.beard_set(a,rig.length/8,b,jn.length/3,0);}
 else e.beard_set(0,0,0,0,0);
 const bp=e.malloc(W*H);e.slice_area(x0,z0,W,H,Y,bp);const u=new Uint8Array(e.memory.buffer,bp,W*H).slice();
 let ok=0,n=0,airW=0,airO=0;for(let k=0;k<W*H;k++){if(world[k]<0||mask[k])continue;n++;const a=world[k]===0?0:1,b=u[k]===0?0:1;if(a===b)ok++;airW+=a;airO+=b;}
 console.log(beard?'beard ON ':'beard OFF','match',(100*ok/n).toFixed(1)+'%','cells',n,'world open',airW,'ours open',airO);}
run(false);run(true);
