import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const dir='/tmp/rp/m1.16.1/data/minecraft/structures/ruined_portal', F={portal_1:3,portal_2:5,portal_3:4,portal_4:4,portal_5:2,portal_6:2,portal_7:3,portal_8:5,portal_9:4,giant_portal_1:5,giant_portal_2:5,giant_portal_3:5};
const out={};
for(const k in F){const r=parseNBT(new Uint8Array(zlib.gunzipSync(fs.readFileSync(`${dir}/${k}.nbt`))));const pal=r.palette.map(e=>String(e.Name).replace('minecraft:',''));
 const top={};for(const b of r.blocks){const n=pal[b.state];if(n==='air'||n==='structure_void'||n==='jigsaw')continue;const [x,y,z]=Array.from(b.pos);if(x!==F[k])continue;if(!(z in top)||y>top[z][0])top[z]=[y,n];}
 out[k]=top; const low=Object.entries(top).filter(([z,[y]])=>y<=3); console.log(k, JSON.stringify(low));}
fs.writeFileSync('tops116.json',JSON.stringify(out));
