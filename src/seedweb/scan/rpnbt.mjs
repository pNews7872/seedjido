import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from './lib.mjs';
const res={};
for(const n of [...Array(10)].map((_,i)=>'portal_'+(i+1)).concat([1,2,3].map(i=>'giant_portal_'+i))){
 const r=parseNBT(new Uint8Array(zlib.gunzipSync(fs.readFileSync('/tmp/rpnbt/'+n+'.nbt'))));
 const pal=r.palette.map(p=>String(p.Name||p.id||p['']).replace('minecraft:',''));
 const size=Array.from(r.size);
 const pts=[];for(const b of r.blocks){const nm=pal[b.state];const pos=Array.from(b.pos);
   if(nm==='obsidian'||nm==='crying_obsidian'||nm==='gold_block'||nm==='nether_portal')pts.push([...pos,nm]);}
 const proj={x:[2,1],z:[0,1],y:[0,2]};let best=null;
 const ob=pts.filter(p=>p[3]!=='gold_block'&&p[3]!=='nether_portal');
 for(const ax of ['x','z','y']){const [a,b]=proj[ax];const set=new Set(ob.map(p=>p[a]+','+p[b]));if(!best||set.size>best.n)best={ax,n:set.size};}
 const [a,b]=proj[best.ax]; const all=pts; const xs=all.map(p=>p[a]),ys=all.map(p=>p[b]);
 const minA=Math.min(...xs),maxA=Math.max(...xs),minB=Math.min(...ys),maxB=Math.max(...ys);
 const W=maxA-minA+1,H=maxB-minB+1;const g=Array.from({length:H},()=>Array(W).fill('.'));
 const rank={'nether_portal':1,'gold_block':2,'obsidian':3,'crying_obsidian':4};const ch={'nether_portal':'P','gold_block':'G','obsidian':'O','crying_obsidian':'C'};
 // 앞쪽(가까운) 블록 우선: 투영축 값이 작은 쪽을 앞으로
 for(const p of all){const r=best.ax==='y'?p[b]-minB:maxB-p[b], c=p[a]-minA; const cur=g[r][c]; if(cur==='.'||rank[p[3]]>rank[{P:'nether_portal',G:'gold_block',O:'obsidian',C:'crying_obsidian'}[cur]])g[r][c]=ch[p[3]];}
 res[n]={ax:best.ax,g:g.map(r=>r.join('')),size};
 console.log(n,'size',size.join('x'),'view',best.ax);console.log(res[n].g.join('\n'));
}
fs.writeFileSync('/tmp/pshapes3.json',JSON.stringify(res));
