import fs from 'fs'; import zlib from 'zlib';
import { parseNBT } from './lib.mjs';
const out = { starts: [], gates: [], land: [], chunks: 0 };
for (const f of process.argv.slice(2)) {
  const b = fs.readFileSync(f); const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 0; i < 1024; i++) {
    const off = (dv.getUint32(i * 4) >>> 8) * 4096; if (!off) continue;
    const len = dv.getUint32(off), kind = b[off + 4];
    let raw; try { raw = kind === 1 ? zlib.gunzipSync(b.subarray(off + 5, off + 4 + len)) : zlib.inflateSync(b.subarray(off + 5, off + 4 + len)); } catch (e) { continue; }
    const root = parseNBT(new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength));
    if (root.Status && !/full/.test(root.Status)) continue;
    out.chunks++;
    const S = root.structures && root.structures.starts;
    if (S) for (const k in S) { const s = S[k]; if (!s || s.id === 'INVALID') continue;
      out.starts.push({ id: s.id, cx: s.ChunkX, cz: s.ChunkZ, ch: (s.Children || []).map(c => ({ t: c.Template || null, bb: c.BB ? Array.from(c.BB) : null })) }); }
    for (const be of (root.block_entities || [])) if (be.id === 'minecraft:end_gateway') out.gates.push([be.x, be.y, be.z]);
    let land = 0; for (const sec of (root.sections || [])) { const pal = sec.block_states && sec.block_states.palette; if (pal && pal.some(e => (typeof e === 'string' ? e : (e.Name || e.id || e[''])) === 'minecraft:end_stone')) { land = 1; break; } }
    out.land.push(root.xPos, root.zPos, land);
  }
}
process.stdout.write(JSON.stringify(out));
