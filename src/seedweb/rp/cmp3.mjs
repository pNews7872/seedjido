import fs from 'fs'; import {block} from './cmp.mjs';
const T=JSON.parse(fs.readFileSync('/home/claude/seedweb/rp/t116.json')); const W=JSON.parse(fs.readFileSync('/tmp/rp_world.json'));
const R={NONE:0,CLOCKWISE_90:1,CLOCKWISE_180:2,COUNTERCLOCKWISE_90:3};
const F={portal_1:[3,1,4,2,6],portal_2:[5,2,5,4,8],portal_3:[4,2,5,3,7],portal_4:[4,2,5,3,7],portal_5:[2,1,4,3,8],portal_6:[2,0,4,1,5],portal_7:[3,2,5,0,4],portal_8:[5,2,6,3,8],portal_9:[4,3,6,1,5],giant_portal_1:[5,4,11,3,12],giant_portal_2:[5,4,11,3,12],giant_portal_3:[5,4,11,3,12]};
function tr(x,z,mir,rot,px,pz){if(mir)x=-x;switch(rot){case 2:return[2*px-x,2*pz-z];case 3:return[px-pz+z,px+pz-x];case 1:return[px+pz-z,pz-px+x];default:return[x,z];}}
for(const p of W){const t=T[p.tmpl],f=F[p.tmpl];if(!f)continue;const rot=R[p.rot],mir=p.mir==='FRONT_BACK',px=t.s[0]>>1,pz=t.s[2]>>1;
 const ok=(ty,tz)=>{const [a,b]=tr(f[0],tz,mir,rot,px,pz);return block(p.x+a,p.y+ty,p.z+b)==='obsidian';};
 let best=99;for(let a0=f[1];a0<=f[2];a0++)for(let a1=a0+3;a1<=f[2];a1++)for(let c0=f[3];c0<=f[4];c0++)for(let c1=c0+4;c1<=f[4];c1++){let n=0;
  for(let z=a0;z<=a1;z++)for(let y=c0;y<=c1;y++){const ez=z===a0||z===a1,ey=y===c0||y===c1;if(!(ez||ey)||(ez&&ey))continue;if(!ok(y,z))n++;}best=Math.min(best,n);}
 console.log(p.tmpl,p.x,p.z,'실제 필요',best);}
