// 템플릿마다 위에서 보이는 면(위가 비어 있는 블록)만: 열마다 [y, 블록] 목록
import fs from 'fs'; import zlib from 'zlib'; import path from 'path'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const ROOT='/tmp/mcm/mcmeta/data/minecraft/structure';
const [out,...dirs]=process.argv.slice(2);
const SKIP=/^(air|cave_air|void_air|structure_void|jigsaw|light|barrier)$/;
const B={},Bn=[];const bid=n=>{if(B[n]===undefined){B[n]=Bn.length;Bn.push(n);}return B[n];};
const R={};let cells=0;
function walk(d){for(const x of fs.readdirSync(d)){const p=path.join(d,x);if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('.nbt'))load(p);}}
function load(p){
 const name=p.slice(ROOT.length+1).replace('.nbt','');
 const r=parseNBT(new Uint8Array(zlib.gunzipSync(fs.readFileSync(p))));
 const pal=(r.palette||r.palettes[0]).map(e=>String(e.Name||e.id).replace('minecraft:',''));
 const [sx,sy,sz]=Array.from(r.size);
 const occ=new Map();
 for(const b of r.blocks){const n=pal[b.state];if(SKIP.test(n))continue;const [x,y,z]=Array.from(b.pos);occ.set((x*sz+z)*sy+y,n);}
 const cols={};
 for(const [k,n] of occ){const y=k%sy,xz=(k-y)/sy;if(occ.has(xz*sy+y+1))continue;let len=1;while(occ.has(xz*sy+y-len))len++;(cols[xz]||(cols[xz]=[])).push(y,bid(n),len);cells++;}
 // 압축: "xz:y,b,y,b;..."
 R[name]=Object.entries(cols).map(([k,v])=>k+':'+v.join(',')).join(';');
}
for(const d of dirs)walk(`${ROOT}/${d}`);
fs.writeFileSync(`/home/claude/seedweb/jigsaw/${out}_tops.json`,JSON.stringify({B:Bn,R}));
console.log(out,'cells',cells,'blocks',Bn.length,'bytes',fs.statSync(`/home/claude/seedweb/jigsaw/${out}_tops.json`).size,'gz',zlib.gzipSync(fs.readFileSync(`/home/claude/seedweb/jigsaw/${out}_tops.json`)).length);
