// 1.16.1 월드 파일의 폐허가 된 차원문 시작 정보·틀 블록을 계산값과 대조
import fs from 'fs'; import zlib from 'zlib'; import {parseNBT, packed} from '/home/claude/seedweb/scan/lib.mjs';
const DIR='/tmp/w116', chunks=new Map();
function loadRegion(rx,rz){const f=`${DIR}/r.${rx}.${rz}.mca`; if(!fs.existsSync(f))return; const b=fs.readFileSync(f);
 for(let i=0;i<1024;i++){const o=b.readUInt32BE(i*4),off=(o>>>8)*4096; if(!off)continue; const len=b.readUInt32BE(off),kind=b[off+4];
  const raw=b.subarray(off+5,off+4+len); const d=kind===1?zlib.gunzipSync(raw):zlib.inflateSync(raw); const r=parseNBT(new Uint8Array(d)); const L=r.Level; chunks.set(L.xPos+','+L.zPos,L);}}
for(const f of fs.readdirSync(DIR)){const m=/r\.(-?\d+)\.(-?\d+)\.mca/.exec(f); loadRegion(+m[1],+m[2]);}
function block(x,y,z){const L=chunks.get((x>>4)+','+(z>>4)); if(!L)return '?'; const s=(L.Sections||[]).find(s=>s.Y===(y>>4)); if(!s||!s.Palette)return 'air';
 const pal=s.Palette, bits=Math.max(4,Math.ceil(Math.log2(pal.length))); const idx=((y&15)*256+(z&15)*16+(x&15)); return String(pal[packed(s.BlockStates,bits,idx)].Name).replace('minecraft:','');}
const out=[];
for(const [k,L] of chunks){const st=L.Structures&&L.Structures.Starts&&L.Structures.Starts.ruined_portal; if(!st||st.id==='INVALID')continue;
 for(const c of st.Children||[]) out.push({cx:st.ChunkX,cz:st.ChunkZ,tmpl:String(c.Template).replace('minecraft:ruined_portal/',''),rot:c.Rotation,mir:c.Mirror,x:c.TPX,y:c.TPY,z:c.TPZ,vp:c.VerticalPlacement,pivot:[c.PX,c.PY,c.PZ]});}
fs.writeFileSync('/tmp/rp_world.json',JSON.stringify(out));
console.log(out.length,'portals'); for(const o of out) console.log(JSON.stringify(o));
export {block};
