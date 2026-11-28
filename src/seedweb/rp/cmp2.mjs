import fs from 'fs'; import {block} from './cmp.mjs';
const T=JSON.parse(fs.readFileSync('/home/claude/seedweb/rp/t116.json')); const W=JSON.parse(fs.readFileSync('/tmp/rp_world.json'));
const R={NONE:0,CLOCKWISE_90:1,CLOCKWISE_180:2,COUNTERCLOCKWISE_90:3};
function tr(x,z,mir,rot,px,pz){if(mir)x=-x;switch(rot){case 2:return[2*px-x,2*pz-z];case 3:return[px-pz+z,px+pz-x];case 1:return[px+pz-z,pz-px+x];default:return[x,z];}}
const M=(1n<<48n)-1n;
function getSeed(x,y,z){let l=BigInt.asIntN(64,BigInt(Math.imul(x,3129871))^(BigInt(z)*116129781n)^BigInt(y));l=BigInt.asIntN(64,l*l*42317861n+l*11n);return l>>16n;}
function cryF(x,y,z){let s=(BigInt.asUintN(64,getSeed(x,y,z))^0x5DEECE66Dn)&M;s=(s*0x5DEECE66Dn+0xBn)&M;return Number(s>>24n)/(1<<24)<0.15;}
let ok=0,bad=0;
for(const p of W){const t=T[p.tmpl],rot=R[p.rot],mir=p.mir==='FRONT_BACK';const px=t.s[0]>>1,pz=t.s[2]>>1;let line=[];
 for(const [x,y,z] of t.o){const [a,b]=tr(x,z,mir,rot,px,pz);const wx=p.x+a,wy=p.y+y,wz=p.z+b;const act=block(wx,wy,wz),pr=cryF(wx,wy,wz)?'crying_obsidian':'obsidian';
  if(act===pr)ok++;else{bad++;line.push(`${wx},${wy},${wz} 계산 ${pr} 실제 ${act}`);}}
 console.log(p.tmpl,p.x,p.y,p.z,'틀 흑요석',t.o.length,'틀림',line.length,line.slice(0,4).join(' | '));}
console.log('맞음',ok,'틀림',bad);
