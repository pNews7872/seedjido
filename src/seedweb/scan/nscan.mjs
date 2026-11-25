// 네더 region 전체 훑기: 구조물 시작점(종류·조각), 마른 가스트 블록, 스포너
import fs from 'fs'; import zlib from 'zlib';
import { parseNBT, packed } from './lib.mjs';
const files = process.argv.slice(2);
const out = { starts: [], ghasts: [], spawners: [], chunks: 0 };
for (const f of files) {
  const b = fs.readFileSync(f); const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 0; i < 1024; i++) {
    const loc = dv.getUint32(i * 4), off = (loc >>> 8) * 4096; if (!off) continue;
    const len = dv.getUint32(off), kind = b[off + 4];
    let raw; try { raw = kind === 1 ? zlib.gunzipSync(b.subarray(off + 5, off + 4 + len)) : kind === 3 ? b.subarray(off+5, off+4+len) : zlib.inflateSync(b.subarray(off + 5, off + 4 + len)); } catch (e) { continue; }
    const root = parseNBT(new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength));
    const st = root.Status || ''; if (st && !/full/.test(st)) continue;
    out.chunks++;
    const cx = root.xPos, cz = root.zPos;
    const S = root.structures && root.structures.starts;
    if (S) for (const k in S) { const s = S[k]; if (!s || s.id === 'INVALID') continue;
      const ch = (s.Children || []).map(c => ({ id: c.id, t: c.Template || c.TemplateName || (c.pool_element && (c.pool_element.location || c.pool_element.location)) || null, bb: c.BB ? Array.from(c.BB) : null, pe: c.pool_element ? JSON.stringify(c.pool_element).slice(0, 160) : null, rot: c.Rot || c.Rotation, mir: c.Mirror, vp: c.VerticalPlacement || null }));
      out.starts.push({ id: s.id, cx: s.ChunkX, cz: s.ChunkZ, ch }); }
    for (const be of (root.block_entities || [])) if (be.id === 'minecraft:mob_spawner') {
      const sd = be.SpawnData && (be.SpawnData.entity || be.SpawnData); out.spawners.push([be.x, be.y, be.z, sd && sd.id]); }
    for (const sec of (root.sections || [])) {
      const bs = sec.block_states; if (!bs || !bs.palette) continue;
      const pal = bs.palette.map(e => typeof e === 'string' ? e : (e.Name || e.id || e['']));
      const gi = pal.indexOf('minecraft:dried_ghast'); if (gi < 0) continue;
      const bits = Math.max(4, Math.ceil(Math.log2(pal.length)));
      for (let j = 0; j < 4096; j++) if (packed(bs.data, bits, j) === gi) out.ghasts.push([cx * 16 + (j & 15), sec.Y * 16 + (j >> 8), cz * 16 + ((j >> 4) & 15)]);
    }
  }
}
process.stdout.write(JSON.stringify(out));
