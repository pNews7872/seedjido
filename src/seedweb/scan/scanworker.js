// 월드 region(.mca) 파일 읽기: 생성기(몹 종류), 하늘에 드러난 용암 원천, 땅속 용암 원천을 뽑음
const td = new TextDecoder();
async function inflate(bytes, kind) {
  const fmt = kind === 1 ? "gzip" : "deflate";
  const ds = new DecompressionStream(fmt);
  const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
  return new Uint8Array(await out.arrayBuffer());
}
// 최소 NBT 파서: 긴 배열은 복사하지 않고 위치만 기억
function parseNBT(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let p = 0;
  const str = () => { const n = dv.getUint16(p); p += 2; const s = td.decode(u8.subarray(p, p + n)); p += n; return s; };
  function payload(t) {
    switch (t) {
      case 1: return dv.getInt8(p++);
      case 2: { const v = dv.getInt16(p); p += 2; return v; }
      case 3: { const v = dv.getInt32(p); p += 4; return v; }
      case 4: { p += 8; return 0; }
      case 5: { const v = dv.getFloat32(p); p += 4; return v; }
      case 6: { const v = dv.getFloat64(p); p += 8; return v; }
      case 7: { const n = dv.getInt32(p); p += 4; p += n; return null; }
      case 8: return str();
      case 9: { const et = dv.getUint8(p++); const n = dv.getInt32(p); p += 4; const a = new Array(Math.max(0, n)); for (let i = 0; i < n; i++) a[i] = payload(et); return a; }
      case 10: { const o = {}; for (;;) { const tt = dv.getUint8(p++); if (tt === 0) break; const k = str(); o[k] = payload(tt); } return o; }
      case 11: { const n = dv.getInt32(p); p += 4; const a = new Int32Array(n); for (let i = 0; i < n; i++) a[i] = dv.getInt32(p + i * 4); p += n * 4; return a; }
      case 12: { const n = dv.getInt32(p); p += 4; const r = { dv, off: p, n }; p += n * 8; return r; }
    }
    throw new Error("bad tag " + t);
  }
  const t = dv.getUint8(p++); str(); return payload(t);
}
// 묶인 정수 배열(long 배열, 칸이 long 경계를 넘지 않는 1.16+ 방식)에서 i번째 값
function packed(la, bits, i) {
  const vpl = Math.floor(64 / bits), li = Math.floor(i / vpl), off = (i % vpl) * bits;
  const hi = la.dv.getUint32(la.off + li * 8), lo = la.dv.getUint32(la.off + li * 8 + 4), mask = bits >= 32 ? 0xffffffff : (1 << bits) - 1;
  if (off + bits <= 32) return (lo >>> off) & mask;
  if (off >= 32) return (hi >>> (off - 32)) & mask;
  return ((lo >>> off) | (hi << (32 - off))) & mask;
}
function scanChunk(root, dim, out) {
  const lvl = root.Level || root; // 옛 형식 대비
  const cx = lvl.xPos, cz = lvl.zPos; if (cx === undefined) return;
  const status = lvl.Status || ""; if (status && !/full|features|light|spawn|heightmaps/.test(status)) return;
  out.chunks++; out.cl.push(cx, cz);
  const minX = cx * 16, minZ = cz * 16;
  for (const be of (lvl.block_entities || [])) {
    if (be.id === "minecraft:mob_spawner") {
      const sd = be.SpawnData && (be.SpawnData.entity || be.SpawnData); const mob = sd && sd.id ? String(sd.id).replace("minecraft:", "") : "?";
      out.spawners.push([be.x, be.y, be.z, mob]);
    }
  }
  // 하늘에 드러났는지: MOTION_BLOCKING 높이맵 (용암도 막는 블록이라 맨 위가 용암이면 높이 = 용암y+1)
  const hm = lvl.Heightmaps && (lvl.Heightmaps.MOTION_BLOCKING || lvl.Heightmaps.WORLD_SURFACE);
  const minY = dim === 0 ? -64 : 0, hbits = dim === 0 ? 9 : 8;
  for (const sec of (lvl.sections || [])) {
    const bs = sec.block_states; if (!bs || !bs.palette) continue;
    const pal = bs.palette, lavaIdx = [];
    // 26.x 팔레트는 문자열 "minecraft:stone"(기본 상태), {"": …}, {id, properties} 가 섞일 수 있음. 예전은 {Name, Properties}
    pal.forEach((e, i) => { const nm = typeof e === "string" ? e : (e.Name || e.id || e[""]), pr = typeof e === "string" ? null : (e.Properties || e.properties); if (nm === "minecraft:lava" && (!pr || String(pr.level) === "0")) lavaIdx.push(i); });
    if (!lavaIdx.length) continue;
    const sy = sec.Y * 16;
    if (pal.length === 1 || !bs.data) { // 섹션 전체가 용암
      for (let k = 0; k < 4096; k++) add(k);
      continue;
    }
    const bits = Math.max(4, Math.ceil(Math.log2(pal.length))), set = new Set(lavaIdx);
    for (let k = 0; k < 4096; k++) if (set.has(packed(bs.data, bits, k))) add(k);
    function add(k) {
      const x = k & 15, z = (k >> 4) & 15, y = sy + (k >> 8);
      let top = null; if (hm) top = packed(hm, hbits, z * 16 + x) + minY - 1;
      const exposed = top !== null && top === y;
      if (y <= (dim === 0 ? -54 : 32)) return; // 깊은 곳 용암 바다(대수층)·네더 용암 바다는 제외
      (exposed ? out.lavaSky : out.lavaIn).push(minX + x, y, minZ + z);
    }
  }
}
// 이어진 용암 원천끼리 묶어서 덩어리 하나로
function cluster(flat, minN) {
  const n = flat.length / 3, key = new Map(), par = new Int32Array(n);
  for (let i = 0; i < n; i++) { par[i] = i; key.set(flat[i*3] + "," + flat[i*3+1] + "," + flat[i*3+2], i); }
  const f = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  for (let i = 0; i < n; i++) {
    const x = flat[i*3], y = flat[i*3+1], z = flat[i*3+2];
    for (const [dx, dy, dz] of [[1,0,0],[0,0,1],[0,1,0],[1,0,1],[1,0,-1]]) {
      const j = key.get((x+dx) + "," + (y+dy) + "," + (z+dz)); if (j !== undefined) { const a = f(i), b = f(j); if (a !== b) par[a] = b; }
    }
  }
  const g = new Map();
  for (let i = 0; i < n; i++) { const r = f(i); let c = g.get(r); if (!c) g.set(r, c = { n: 0, sx: 0, sz: 0, top: -999 }); c.n++; c.sx += flat[i*3]; c.sz += flat[i*3+2]; c.top = Math.max(c.top, flat[i*3+1]); }
  const res = []; for (const c of g.values()) if (c.n >= minN) res.push([Math.round(c.sx / c.n), c.top, Math.round(c.sz / c.n), c.n]);
  return res;
}
onmessage = async (ev) => {
  const { files, dim } = ev.data;
  const out = { chunks: 0, cl: [], spawners: [], lavaSky: [], lavaIn: [], regions: [], errors: 0 };
  let done = 0;
  for (const file of files) {
    const m = /r\.(-?\d+)\.(-?\d+)\.mca$/.exec(file.name); if (!m) { done++; continue; }
    out.regions.push([+m[1], +m[2]]);
    const buf = new Uint8Array(await file.arrayBuffer()); if (buf.length < 8192) { done++; continue; }
    const dv = new DataView(buf.buffer);
    for (let i = 0; i < 1024; i++) {
      const loc = dv.getUint32(i * 4), off = (loc >>> 8) * 4096; if (!off) continue;
      try {
        const len = dv.getUint32(off), kind = buf[off + 4];
        if (kind !== 1 && kind !== 2) { out.errors++; continue; } // LZ4·외부 파일은 건너뜀
        const raw = await inflate(buf.subarray(off + 5, off + 4 + len), kind);
        scanChunk(parseNBT(raw), dim, out);
      } catch (e) { out.errors++; }
    }
    done++; postMessage({ type: "progress", done, total: files.length, chunks: out.chunks });
  }
  const sky = cluster(out.lavaSky, 1), under = cluster(out.lavaIn, 1);
  postMessage({ type: "done", dim, chunks: out.chunks, cl: out.cl, regions: out.regions, errors: out.errors, spawners: out.spawners,
    lavaSky: sky, lavaIn: under.filter(c => c[3] >= 12) });
};
