import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const dir=process.argv[2], out={};
for (const f of fs.readdirSync(dir).filter(f=>f.endsWith('.nbt')).sort()) {
  const r=parseNBT(new Uint8Array(zlib.gunzipSync(fs.readFileSync(dir+'/'+f))));
  const pal=(r.palette||r.palettes[0]).map(e=>String(e.Name||e.name||e.id).replace('minecraft:',''));
  const obs=[], other={};
  for (const b of r.blocks){ const n=pal[b.state]; const p=Array.from(b.pos); if(n==='obsidian'||n==='crying_obsidian') obs.push([...p,n==='obsidian'?0:1]); other[n]=(other[n]||0)+1; }
  out[f.replace('.nbt','')]={s:Array.from(r.size),o:obs,cnt:other};
}
console.log(JSON.stringify(out));
