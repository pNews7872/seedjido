import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const DIR=process.env.WD||'/tmp/w263', out=[], chunks=new Map();
for(const f of fs.readdirSync(DIR)){const b=fs.readFileSync(DIR+'/'+f);
 for(let i=0;i<1024;i++){const o=b.readUInt32BE(i*4),off=(o>>>8)*4096;if(!off)continue;const len=b.readUInt32BE(off),kind=b[off+4];const raw=b.subarray(off+5,off+4+len);
  const r=parseNBT(new Uint8Array(kind===1?zlib.gunzipSync(raw):zlib.inflateSync(raw)));chunks.set(r.xPos+','+r.zPos,r);
  const S=r.structures&&r.structures.starts;if(!S)continue;for(const k in S){if(!k.includes('ruined_portal')||S[k].id==='INVALID')continue;
   for(const c of S[k].Children||[])out.push({k,cx:S[k].ChunkX,cz:S[k].ChunkZ,tmpl:String(c.Template).replace('minecraft:ruined_portal/',''),rot:c.Rotation,mir:c.Mirror,x:c.TPX,y:c.TPY,z:c.TPZ,vp:c.VerticalPlacement});}}}
fs.writeFileSync('/tmp/rp_w263.json',JSON.stringify(out));
function block(x,y,z){const r=chunks.get((x>>4)+','+(z>>4));if(!r)return '?';const sec=r.sections.find(s=>Number(s.Y)===(y>>4));if(!sec)return '?';const pal=sec.block_states.palette.map(p=>String(typeof p==="string"?p:(p.Name||p.name||p[""])).replace('minecraft:',''));const dat=sec.block_states.data;if(!dat)return pal[0];const bits=Math.max(4,Math.ceil(Math.log2(pal.length)));const per=Math.floor(64/bits);const idx=(y&15)*256+(z&15)*16+(x&15);const L=dat.dv.getBigUint64(dat.off+Math.floor(idx/per)*8);return pal[Number((L>>BigInt((idx%per)*bits))&((1n<<BigInt(bits))-1n))];}
export {block, out};
