import fs from 'fs'; import {out, block} from './cmp263.mjs';
const T=JSON.parse(fs.readFileSync('t116.json'));const R={NONE:0,CLOCKWISE_90:1,CLOCKWISE_180:2,COUNTERCLOCKWISE_90:3};
function tr(x,z,mir,rot,px,pz){if(mir)x=-x;switch(rot){case 2:return[2*px-x,2*pz-z];case 3:return[px-pz+z,px+pz-x];case 1:return[px+pz-z,pz-px+x];default:return[x,z];}}
const M=(1n<<48n)-1n;function getSeed(x,y,z){let l=BigInt.asIntN(64,BigInt(Math.imul(x,3129871))^(BigInt(z)*116129781n)^BigInt(y));l=BigInt.asIntN(64,l*l*42317861n+l*11n);return l>>16n;}
function cryF(x,y,z){let s=(BigInt.asUintN(64,getSeed(x,y,z))^0x5DEECE66Dn)&M;s=(s*0x5DEECE66Dn+0xBn)&M;return Number(s>>24n)/(1<<24)<0.15;}
const want=(process.env.P||'').split(';').map(s=>s.split(',').map(Number));
for(const p of out){if(!want.some(([x,z])=>x===p.x&&z===p.z))continue;const t=T[p.tmpl],rot=R[p.rot],mir=p.mir==='FRONT_BACK',px=t.s[0]>>1,pz=t.s[2]>>1;const L=[];
 for(const [x,y,z] of t.o){const [a,b]=tr(x,z,mir,rot,px,pz);const wx=p.x+a,wy=p.y+y,wz=p.z+b;const act=block(wx,wy,wz),pr=cryF(wx,wy,wz)?'crying_obsidian':'obsidian';if(act!==pr)L.push(`t(${x},${y},${z}) ${pr}→${act}`);}
 console.log(p.tmpl,p.x,p.y,p.z,p.vp,'다른 칸',L.length,'/',t.o.length);for(const l of L)console.log('   ',l);}
