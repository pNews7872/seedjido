import fs from 'fs'; import {block} from './nblk.mjs';
const o=JSON.parse(fs.readFileSync('/tmp/nscan2.json'));
const by={};
for(const s of o.starts){ if(s.id!=='minecraft:ruined_portal_nether')continue; const c=s.ch[0]; const t=c.t.split('/').pop(); (by[t]=by[t]||[]).push(c); }
const OBS=new Set(['obsidian','crying_obsidian']);
const res={};
for(const t of Object.keys(by).sort()){
  let best=null;
  for(const c of by[t]){
    const [x0,y0,z0,x1,y1,z1]=c.bb; const W=x1-x0+1,H=y1-y0+1,D=z1-z0+1;
    // 두께가 얇은 축으로 투영
    const axis = W<=D ? 'x':'z';
    const cols = axis==='x' ? D : W, rows=H;
    const grid=Array.from({length:rows},()=>Array(cols).fill('.'));
    let n=0, gold=0;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){
      const b=block(x,y,z); const u = axis==='x' ? z-z0 : x-x0; const r=y1-y;
      if(b==='obsidian'){ if(grid[r][u]!=='C')grid[r][u]='O'; n++; }
      else if(b==='crying_obsidian'){ grid[r][u]='C'; n++; }
      else if(b==='gold_block' && grid[r][u]==='.'){ grid[r][u]='G'; gold++; }
      else if(b==='nether_portal' && grid[r][u]==='.'){ grid[r][u]='P'; }
    }
    if(!best||n>best.n) best={n,grid:grid.map(r=>r.join('')),rot:c.rot,bb:c.bb,count:by[t].length};
  }
  res[t]=best; console.log(t,'samples',best.count,'blocks',best.n,'rot',best.rot); console.log(best.grid.join('\n'));
}
fs.writeFileSync('/tmp/pshapes.json',JSON.stringify(res));
