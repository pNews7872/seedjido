import fs from 'fs'; import * as N from './nblk.mjs'; import * as O from './oblk.mjs';
const samples=[];
for(const [f,mod] of [['/tmp/nscan2.json',N],['/tmp/oscan.json',O]]){const o=JSON.parse(fs.readFileSync(f));
 for(const s of o.starts){ if(!s.id.includes('ruined_portal'))continue; const c=s.ch[0]; samples.push({c,mod}); }}
const out={};
for(const {c,mod} of samples){
  const t=c.t.split('/').pop(); const [x0,y0,z0,x1,y1,z1]=c.bb; const W=x1-x0+1,H=y1-y0+1,D=z1-z0+1;
  const rot=c.rot||'NONE', mir=c.mir||'NONE';
  const swap = rot==='CLOCKWISE_90'||rot==='COUNTERCLOCKWISE_90';
  const SX = swap?D:W, SZ = swap?W:D; // 템플릿 원래 크기
  const o=out[t]||(out[t]={SX,SY:H,SZ,cnt:{},n:0,gold:{}}); o.n++;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){
    const b=mod.block(x,y,z); const isO=b==='obsidian'||b==='crying_obsidian'; const isG=b==='gold_block'; if(!isO&&!isG)continue;
    const u=x-x0,v=z-z0; let lx,lz;
    if(rot==='NONE'){lx=u;lz=v;} else if(rot==='CLOCKWISE_90'){lx=v;lz=(W-1)-u;} else if(rot==='COUNTERCLOCKWISE_90'){lx=(D-1)-v;lz=u;} else {lx=(W-1)-u;lz=(D-1)-v;}
    if(mir==='LEFT_RIGHT') lz=(SZ-1)-lz; else if(mir==='FRONT_BACK') lx=(SX-1)-lx;
    const k=lx+','+(y-y0)+','+lz; if(isO)o.cnt[k]=(o.cnt[k]||0)+1; else o.gold[k]=(o.gold[k]||0)+1;
  }
}
for(const t of Object.keys(out).sort()){const o=out[t];
  // 정면: 얇은 축 방향으로 투영 (x가 얇으면 z-y 평면)
  const thinX = o.SX<=o.SZ; const cols=thinX?o.SZ:o.SX, rows=o.SY;
  const g=Array.from({length:rows},()=>Array(cols).fill('.'));
  for(const k in o.cnt){const [x,y,z]=k.split(',').map(Number); if(o.cnt[k]<1)continue; g[rows-1-y][thinX?z:x]='O';}
  for(const k in o.gold){const [x,y,z]=k.split(',').map(Number); const r=rows-1-y,c=thinX?z:x; if(g[r][c]==='.')g[r][c]='G';}
  o.front=g.map(r=>r.join(''));
  console.log(t,'n',o.n,'size',o.SX,o.SY,o.SZ); console.log(o.front.join('\n'));
}
fs.writeFileSync('/tmp/pshapes2.json',JSON.stringify(out));
