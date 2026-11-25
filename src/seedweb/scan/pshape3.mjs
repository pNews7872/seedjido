import fs from 'fs';
const out=JSON.parse(fs.readFileSync('/tmp/pshapes2.json'));const res={};
for(const t of Object.keys(out).sort()){const o=out[t];
 const pts=Object.keys(o.cnt).map(k=>k.split(',').map(Number)), gold=Object.keys(o.gold).map(k=>k.split(',').map(Number));
 const proj={x:[2,1],z:[0,1],y:[0,2]};let best=null;
 for(const ax of ['x','z','y']){const [a,b]=proj[ax];const set=new Set(pts.map(p=>p[a]+','+p[b]));if(!best||set.size>best.n)best={ax,n:set.size};}
 const [a,b]=proj[best.ax]; const xs=pts.map(p=>p[a]),ys=pts.map(p=>p[b]);
 const minA=Math.min(...xs),maxA=Math.max(...xs),minB=Math.min(...ys),maxB=Math.max(...ys);
 const W=maxA-minA+1,H=maxB-minB+1;const g=Array.from({length:H},()=>Array(W).fill('.'));
 for(const p of pts){const r=best.ax==='y'?p[b]-minB:maxB-p[b];g[r][p[a]-minA]='O';}
 for(const p of gold){const c=p[a]-minA, r=best.ax==='y'?p[b]-minB:maxB-p[b]; if(r>=0&&r<H&&c>=0&&c<W&&g[r][c]==='.')g[r][c]='G';}
 res[t]={ax:best.ax,g:g.map(r=>r.join(''))};
 console.log(t,'view',best.ax==='y'?'위에서(누운 차원문)':'정면');console.log(res[t].g.join('\n'));}
fs.writeFileSync('/tmp/pshapes3.json',JSON.stringify(res));
