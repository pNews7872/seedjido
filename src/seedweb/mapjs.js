/* ---------------- map ---------------- */
// 구조물 아이콘: 직접 그린 단순한 그림(흰 선/면)을 색 배경 위에 올림
const GLYPH = {
  5:  '<path d="M5 12 12 6l7 6"/><path d="M7 11v7h10v-7"/><rect x="10.5" y="13.5" width="3" height="4.5" fill="#fff" stroke="none"/>',
  13: '<path d="M6 19V10a6 6 0 0 1 12 0v9"/><path d="M9.5 19v-7a2.5 2.5 0 0 1 5 0v7"/><path d="M4 19h16"/>',
  25: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M6 10h12M6 14h12M10 6v12M14 6v12"/>',
  27: '<path d="M3.5 12s3.5-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3.5 5.5-8.5 5.5S3.5 12 3.5 12z"/><circle cx="12" cy="12" r="2.6" fill="#fff" stroke="none"/>',
  9:  '<path d="M3.5 11 12 5.5l8.5 5.5"/><path d="M5 10.5V19h14v-8.5"/><path d="M8 13h2M14 13h2M8 16h2M14 16h2"/>',
  8:  '<path d="M5 9h14L12 5z"/><path d="M5 19h14"/><path d="M7 10v8M10.3 10v8M13.7 10v8M17 10v8"/>',
  7:  '<path d="M4 14h16l-2.5 4h-11z"/><path d="M11 14V5l5 6h-5"/>',
  6:  '<path d="M7 19h10"/><path d="M9 19V9l1-2 2 1 2-2v13"/><path d="M9 12h5"/>',
  14: '<rect x="5" y="9" width="14" height="9" rx="1.5"/><path d="M5 12.5h14"/><rect x="10.8" y="11.2" width="2.4" height="3" fill="#fff" stroke="none"/>',
  2:  '<path d="M4 19h16"/><path d="M6 19v-3h12v3M8 16v-3h8v3M10 13v-3h4v3"/><path d="M12 10V6"/><path d="M12 7c2-2 4-1.5 4-1.5"/>',
  1:  '<path d="M3.5 18.5 12 6l8.5 12.5z"/><path d="M12 6v12.5"/>',
  3:  '<path d="M5 17h14"/><path d="M8.5 17 12 5l3.5 12"/><path d="M12 5l3-1.5"/>',
  4:  '<path d="M4.5 18a7.5 7.5 0 0 1 15 0z"/><path d="M10 18v-3a2 2 0 0 1 4 0v3"/>',
  10: '<path d="M8 19V8h8v11"/><path d="M7 8h10V6H7z"/><path d="M12 6V3l4 1.5L12 6"/><path d="M6 19h12"/>',
  11: '<rect x="7" y="4.5" width="10" height="15" rx="1"/><rect x="9.3" y="7" width="5.4" height="10" fill="#fff" stroke="none" opacity=".55"/>',
  24: '<path d="M5 18l3-4M10 18l2-5M15 18l1-4M19 18l-1-6"/><circle cx="8" cy="7" r="1.6" fill="#fff" stroke="none"/><circle cx="14" cy="6" r="1.2" fill="#fff" stroke="none"/>',
  26: '<path d="M4 18 12 6l8 12z"/><path d="M12 6v12M9 18l3-4 3 4"/>',
};
const ICONS = {};
function iconSVG(st, size) {
  const s = SBY[st];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="5" fill="${s.c}" stroke="#111" stroke-opacity=".75" stroke-width="1.5"/><g fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${GLYPH[st] || ""}</g></svg>`;
}
for (const s of STRUCTS) { const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(iconSVG(s.id, 48)); ICONS[s.id] = img; img.onload = () => scheduleDraw(); }
const iconTag = (st, px) => `<img alt="" width="${px}" height="${px}" style="display:block;flex:none" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSVG(st, px))}">`;
// 축소했을 때 계산량이 큰(흔한) 구조물은 숨김: 블록/픽셀이 이 값보다 크면 표시 안 함
const MAXBPP = { 6: 12, 7: 12, 14: 6, 11: 12, 24: 24, 26: 24, 3: 32, 4: 32, 1: 32, 2: 32, 10: 32, 5: 48, 25: 48, 13: 64, 8: 128, 9: 256, 27: 1e9 };
const STILE = 2048;

const mapState = { loaded: false, lo: 0, hi: 0, seed: "", cx: 0, cz: 0, bpp: 4, spawn: [0, 0], show: new Set([5, 13, 25, 27, 9, 8, 7, 2, 1, 10]), req: 0, tiles: new Map(), queue: [], inflight: 0, gen: 0, sc: new Map(), squeue: [], sinflight: 0, strongholds: null };
const big = $("bigmap"), bctx = big.getContext("2d");
let mapWorkers = [], mapReady, hoverEx = null;
function ensureMapWorkers() {
  if (mapReady) return mapReady;
  mapReady = ready.then(async () => {
    hoverEx = (await WebAssembly.instantiate(wasmModule, imports)).exports;
    await Promise.all(Array.from({ length: Math.max(2, Math.min(6, (navigator.hardwareConcurrency || 4) - 1)) }, () => new Promise(res => {
      const w = new Worker(workerURL); w.busy = 0;
      w.onmessage = (ev) => onMapMsg(w, ev.data, res);
      w.postMessage({ type: "init", module: wasmModule }); mapWorkers.push(w);
    })));
  });
  return mapReady;
}
function onMapMsg(w, d, res) {
  if (d.type === "ready") { res(); return; }
  if (d.type === "tile") {
    w.busy--; mapState.inflight--;
    const t = mapState.tiles.get(d.key); if (!t) { pump(); return; }
    const cv = document.createElement("canvas"); cv.width = 64; cv.height = 64;
    const c2 = cv.getContext("2d"); const img = c2.createImageData(64, 64);
    for (let i = 0; i < 4096; i++) { const hex = COLORS[d.ids[i]] || "222222"; img.data[i*4] = parseInt(hex.slice(0,2),16); img.data[i*4+1] = parseInt(hex.slice(2,4),16); img.data[i*4+2] = parseInt(hex.slice(4,6),16); img.data[i*4+3] = 255; }
    c2.putImageData(img, 0, 0); t.canvas = cv; t.state = 2;
    scheduleDraw(); pump();
  } else if (d.type === "structs") {
    w.busy--; mapState.sinflight--;
    if (d.req === mapState.req) {
      for (const st in d.out) {
        if (+st === 27) { mapState.strongholds = d.out[st] || []; continue; }
        mapState.sc.set(`${st}:${d.tx}:${d.tz}`, d.out[st] || []);
      }
      scheduleDraw();
    }
    pump();
  } else if (d.type === "near") {
    if (d.req !== mapState.req) return;
    renderNear(d);
  }
}
function scaleFor(bpp) { return bpp <= 4 ? 4 : bpp <= 16 ? 16 : bpp <= 64 ? 64 : 256; }
function tileKey(s, tx, tz) { return `${mapState.gen}:${s}:${tx}:${tz}`; }
function pump() {
  const cap = mapWorkers.length * 2;
  while (mapState.squeue.length && mapState.inflight + mapState.sinflight < cap) {
    const job = mapState.squeue.shift();
    const types = job.types.filter(st => !mapState.sc.has(`${st}:${job.tx}:${job.tz}`) || st === 27);
    if (!types.length) continue;
    types.forEach(st => { if (st !== 27) mapState.sc.set(`${st}:${job.tx}:${job.tz}`, null); });
    const w = mapWorkers.reduce((a, b) => (a.busy <= b.busy ? a : b)); w.busy++; mapState.sinflight++;
    const big27 = types.includes(27);
    w.postMessage({ type: "structs", req: mapState.req, lo: mapState.lo, hi: mapState.hi, types, tx: job.tx, tz: job.tz,
      x0: big27 ? -1e8 : job.tx * STILE, z0: big27 ? -1e8 : job.tz * STILE, x1: big27 ? 1e8 : job.tx * STILE + STILE - 1, z1: big27 ? 1e8 : job.tz * STILE + STILE - 1 });
  }
  while (mapState.queue.length && mapState.inflight + mapState.sinflight < cap) {
    const job = mapState.queue.shift(); const t = mapState.tiles.get(job.key);
    if (!t || t.state !== 0) continue;
    const w = mapWorkers.reduce((a, b) => (a.busy <= b.busy ? a : b));
    t.state = 1; w.busy++; mapState.inflight++;
    w.postMessage({ type: "tile", key: job.key, s: job.s, tx: job.tx, tz: job.tz, lo: mapState.lo, hi: mapState.hi });
  }
}
function resizeMap() {
  const r = $("stage").getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
  big.width = Math.max(1, Math.round(r.width * dpr)); big.height = Math.max(1, Math.round(r.height * dpr)); big.dpr = dpr;
  scheduleDraw();
}
window.addEventListener("resize", () => { if (!$("viewMap").hidden) resizeMap(); });
let drawPending = false;
function scheduleDraw() { if (drawPending) return; drawPending = true; requestAnimationFrame(() => { drawPending = false; drawMap(); }); }
function viewRect() { const W = big.width / (big.dpr || 1), H = big.height / (big.dpr || 1); const b = mapState.bpp; return { x0: mapState.cx - W / 2 * b, z0: mapState.cz - H / 2 * b, x1: mapState.cx + W / 2 * b, z1: mapState.cz + H / 2 * b, W, H }; }
function wantStructs(v) {
  const visibleTypes = [...mapState.show].filter(st => st !== 27 && mapState.bpp <= (MAXBPP[st] || 64));
  if (mapState.strongholds === null && !mapState.sc.has("27")) { mapState.sc.set("27", 1); mapState.squeue.unshift({ types: [27], tx: 0, tz: 0 }); }
  if (!visibleTypes.length) return;
  const tx0 = Math.floor(v.x0 / STILE), tx1 = Math.floor(v.x1 / STILE), tz0 = Math.floor(v.z0 / STILE), tz1 = Math.floor(v.z1 / STILE);
  if ((tx1 - tx0 + 1) * (tz1 - tz0 + 1) > 600) return;
  const jobs = [];
  for (let tz = tz0 - 1; tz <= tz1 + 1; tz++) for (let tx = tx0 - 1; tx <= tx1 + 1; tx++) {
    const types = visibleTypes.filter(st => !mapState.sc.has(`${st}:${tx}:${tz}`));
    if (types.length) jobs.push({ types, tx, tz, d: Math.hypot((tx + .5) * STILE - mapState.cx, (tz + .5) * STILE - mapState.cz) });
  }
  if (jobs.length) { jobs.sort((a, b) => a.d - b.d); mapState.squeue = jobs.concat(mapState.squeue.filter(j => j.types.includes(27))); }
}
function drawMap() {
  if (!mapState.loaded) return;
  const dpr = big.dpr || 1; bctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.imageSmoothingEnabled = false;
  const v = viewRect(); const b = mapState.bpp; const s = scaleFor(b); const tb = 64 * s;
  bctx.fillStyle = "#0b0f0d"; bctx.fillRect(0, 0, v.W, v.H);
  const tx0 = Math.floor(v.x0 / tb), tx1 = Math.floor(v.x1 / tb), tz0 = Math.floor(v.z0 / tb), tz1 = Math.floor(v.z1 / tb);
  const want = [];
  for (let tz = tz0; tz <= tz1; tz++) for (let tx = tx0; tx <= tx1; tx++) {
    const key = tileKey(s, tx, tz); let t = mapState.tiles.get(key);
    const sx = (tx * tb - v.x0) / b, sy = (tz * tb - v.z0) / b, sw = tb / b;
    if (!t) { t = { state: 0 }; mapState.tiles.set(key, t); want.push({ key, s, tx, tz, d: Math.hypot((tx + .5) * tb - mapState.cx, (tz + .5) * tb - mapState.cz) }); }
    if (t.state === 2) bctx.drawImage(t.canvas, sx, sy, sw + 0.5, sw + 0.5);
    else drawFallback(tx * tb, tz * tb, tb, v, b, s);
  }
  if (want.length) { want.sort((a, c) => a.d - c.d); const keys = new Set(want.map(w => w.key)); mapState.queue = want.concat(mapState.queue.filter(j => !keys.has(j.key))); }
  wantStructs(v); pump();
  if (mapState.tiles.size > 3000) { for (const [k, t] of mapState.tiles) { if (t.state === 2 && mapState.tiles.size > 2000) mapState.tiles.delete(k); } }
  bctx.strokeStyle = "rgba(255,255,255,.18)"; bctx.lineWidth = 1;
  const ox = (0 - v.x0) / b, oz = (0 - v.z0) / b;
  bctx.beginPath(); bctx.moveTo(ox, 0); bctx.lineTo(ox, v.H); bctx.moveTo(0, oz); bctx.lineTo(v.W, oz); bctx.stroke();
  // structures (cached per 2048-block tile, so panning never makes them blink)
  mapState.hits = [];
  const size = b <= 8 ? 22 : b <= 32 ? 18 : 14;
  const sx0 = Math.floor(v.x0 / STILE) - 1, sx1 = Math.floor(v.x1 / STILE) + 1, sz0 = Math.floor(v.z0 / STILE) - 1, sz1 = Math.floor(v.z1 / STILE) + 1;
  const hidden = [];
  for (const st of mapState.show) {
    const img = ICONS[st]; const name = SNAME[st];
    const put = (x, z) => {
      const px = (x - v.x0) / b, py = (z - v.z0) / b;
      if (px < -20 || py < -20 || px > v.W + 20 || py > v.H + 20) return;
      if (img.complete) bctx.drawImage(img, px - size / 2, py - size / 2, size, size);
      mapState.hits.push({ px, py, r: size / 2 + 2, label: `${name} (${x}, ${z})` });
    };
    if (st === 27) { (mapState.strongholds || []).forEach((x, i, a) => { if (i % 2 === 0) put(a[i], a[i + 1]); }); continue; }
    if (b > (MAXBPP[st] || 64)) { hidden.push(name); continue; }
    for (let tz = sz0; tz <= sz1; tz++) for (let tx = sx0; tx <= sx1; tx++) {
      const arr = mapState.sc.get(`${st}:${tx}:${tz}`); if (!arr) continue;
      for (let i = 0; i < arr.length; i += 2) put(arr[i], arr[i + 1]);
    }
  }
  $("hiddenNote").textContent = hidden.length ? `더 확대하면 보여요: ${hidden.join(", ")}` : "";
  // spawn
  const spx = (mapState.spawn[0] - v.x0) / b, spy = (mapState.spawn[1] - v.z0) / b;
  bctx.fillStyle = "#ffffff"; bctx.strokeStyle = "#111"; bctx.lineWidth = 2;
  bctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 4.5 : 10; bctx.lineTo(spx + Math.cos(a) * rr, spy + Math.sin(a) * rr); } bctx.closePath(); bctx.fill(); bctx.stroke();
  mapState.hits.push({ px: spx, py: spy, r: 11, label: `스폰 (${mapState.spawn[0]}, ${mapState.spawn[1]})` });
  const nice = [16, 32, 64, 128, 256, 512, 1000, 2000, 5000, 10000, 20000, 50000]; let len = nice[0];
  for (const n of nice) if (n / b <= 140) len = n;
  bctx.fillStyle = "rgba(12,16,14,.78)"; bctx.fillRect(v.W - len / b - 22, v.H - 30, len / b + 12, 20);
  bctx.fillStyle = "#e8eee9"; bctx.fillRect(v.W - len / b - 16, v.H - 16, len / b, 3);
  bctx.font = "11px " + getComputedStyle(document.body).fontFamily; bctx.textAlign = "right"; bctx.fillText(`${fmt(len)}칸`, v.W - 16, v.H - 21);
}
function drawFallback(wx, wz, tb, v, b, s) {
  for (const cs of [16, 64, 256]) {
    if (cs <= s) continue; const ctb = 64 * cs;
    const t = mapState.tiles.get(tileKey(cs, Math.floor(wx / ctb), Math.floor(wz / ctb)));
    if (t && t.state === 2) {
      const ox = (wx - Math.floor(wx / ctb) * ctb) / cs, oz = (wz - Math.floor(wz / ctb) * ctb) / cs, w = tb / cs;
      bctx.drawImage(t.canvas, ox, oz, w, w, (wx - v.x0) / b, (wz - v.z0) / b, tb / b + 0.5, tb / b + 0.5); return;
    }
  }
}
async function openMapSeed(text) {
  await ensureMapWorkers();
  const u = parseSeed(text); const [lo, hi] = split(u);
  mapState.lo = lo; mapState.hi = hi; mapState.seed = seedStr(lo, hi); mapState.gen++; mapState.req++;
  mapState.tiles.clear(); mapState.queue = []; mapState.sc.clear(); mapState.squeue = []; mapState.strongholds = null;
  hoverEx.set_seed(lo, hi, hoverEx.mc_wd()); hoverEx.spawn_xz();
  const o = hoverEx.out_ptr() >> 2; const m = new Int32Array(hoverEx.memory.buffer);
  mapState.spawn = [m[o + 80], m[o + 81]]; mapState.cx = mapState.spawn[0]; mapState.cz = mapState.spawn[1]; mapState.bpp = 4; mapState.loaded = true;
  const isNum = /^-?\d+$/.test(String(text).trim());
  $("mapMsg").textContent = isNum ? "끌어서 이동하고, 휠이나 두 손가락, +/− 버튼으로 확대·축소하세요. 구조물 위에 마우스를 올리거나 누르면 이름과 좌표가 보여요." : `글자 시드 "${String(text).trim()}"을(를) 숫자 시드 ${mapState.seed}로 바꿨어요.`;
  $("mapInfo").innerHTML = `<dt>시드</dt><dd>${mapState.seed}</dd><dt>스폰</dt><dd>${mapState.spawn[0]}, ${mapState.spawn[1]} (근사)</dd>`;
  $("nearList").innerHTML = `<span class="hint">계산 중…</span>`;
  mapWorkers[mapWorkers.length - 1].postMessage({ type: "near", req: mapState.req, lo, hi, R: 6000, types: STRUCTS.map(s => s.id) });
  resizeMap();
}
function renderNear(d) {
  const ids = STRUCTS.map(s => s.id);
  const rows = ids.map((id, k) => ({ id, x: d.out[k*3], z: d.out[k*3+1], dist: d.out[k*3+2] })).filter(r => r.dist >= 0).sort((a, b) => a.dist - b.dist);
  $("nearList").innerHTML = rows.length ? rows.map(r => `<button type="button" data-x="${r.x}" data-z="${r.z}">${iconTag(r.id, 18)}<span>${SBY[r.id].name} <span class="d">(${r.x}, ${r.z})</span></span><span class="d">${fmt(r.dist)}칸</span></button>`).join("") : `<span class="hint">스폰 6,000칸 안에 없어요.</span>`;
}
$("nearList").addEventListener("click", (e) => { const bt = e.target.closest("button[data-x]"); if (!bt) return; mapState.cx = +bt.dataset.x; mapState.cz = +bt.dataset.z; mapState.bpp = Math.min(mapState.bpp, 2); scheduleDraw(); });
function renderMapChips() {
  const el = $("mchips"); el.innerHTML = "";
  for (const st of STRUCTS) {
    const c = document.createElement("button"); c.type = "button"; c.className = "chip";
    c.setAttribute("aria-pressed", mapState.show.has(st.id) ? "true" : "false");
    c.innerHTML = `${iconTag(st.id, 16)}${st.name}`;
    c.addEventListener("click", () => { if (mapState.show.has(st.id)) mapState.show.delete(st.id); else mapState.show.add(st.id); renderMapChips(); scheduleDraw(); });
    el.appendChild(c);
  }
}
renderMapChips();
$("mapGo").addEventListener("click", () => openMapSeed($("mapSeed").value));
$("mapSeed").addEventListener("keydown", (e) => { if (e.key === "Enter") openMapSeed($("mapSeed").value); });
const clampB = x => Math.max(0.25, Math.min(512, x));
function zoomAt(f, px, py) {
  const v = viewRect(); const wx = v.x0 + px * mapState.bpp, wz = v.z0 + py * mapState.bpp;
  const nb = clampB(mapState.bpp * f);
  mapState.cx = wx - (px - v.W / 2) * nb; mapState.cz = wz - (py - v.H / 2) * nb; mapState.bpp = nb;
  scheduleDraw();
}
big.addEventListener("wheel", (e) => { e.preventDefault(); const r = big.getBoundingClientRect(); zoomAt(e.deltaY > 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
$("zin").addEventListener("click", () => { const v = viewRect(); zoomAt(0.5, v.W / 2, v.H / 2); });
$("zout").addEventListener("click", () => { const v = viewRect(); zoomAt(2, v.W / 2, v.H / 2); });
$("zhome").addEventListener("click", () => { mapState.cx = mapState.spawn[0]; mapState.cz = mapState.spawn[1]; mapState.bpp = 4; scheduleDraw(); });

// 손가락/마우스 조작: 손가락 수가 바뀔 때마다 기준점을 다시 잡아서, 확대 뒤 손을 떼도 지도가 튀지 않게 함
const pointers = new Map(); let gesture = null;
function reanchor() {
  const pts = [...pointers.values()]; const r = big.getBoundingClientRect();
  if (pts.length === 1) gesture = { type: "pan", x: pts[0].x, y: pts[0].y, cx: mapState.cx, cz: mapState.cz, moved: 0 };
  else if (pts.length >= 2) {
    const [a, c] = pts; const mx = (a.x + c.x) / 2 - r.left, my = (a.y + c.y) / 2 - r.top; const v = viewRect();
    gesture = { type: "pinch", d0: Math.max(1, Math.hypot(a.x - c.x, a.y - c.y)), bpp: mapState.bpp, wx: v.x0 + mx * mapState.bpp, wz: v.z0 + my * mapState.bpp };
  } else gesture = null;
}
big.addEventListener("pointerdown", (e) => { big.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); reanchor(); big.classList.add("drag"); });
big.addEventListener("pointermove", (e) => {
  const r = big.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top;
  if (pointers.has(e.pointerId)) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.values()];
    if (gesture && gesture.type === "pinch" && pts.length >= 2) {
      const [a, c] = pts; const d = Math.max(1, Math.hypot(a.x - c.x, a.y - c.y));
      const mx = (a.x + c.x) / 2 - r.left, my = (a.y + c.y) / 2 - r.top; const v = viewRect();
      const nb = clampB(gesture.bpp * gesture.d0 / d); mapState.bpp = nb;
      mapState.cx = gesture.wx - (mx - v.W / 2) * nb; mapState.cz = gesture.wz - (my - v.H / 2) * nb; scheduleDraw();
    } else if (gesture && gesture.type === "pan") {
      gesture.moved = Math.max(gesture.moved, Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y));
      mapState.cx = gesture.cx - (e.clientX - gesture.x) * mapState.bpp; mapState.cz = gesture.cz - (e.clientY - gesture.y) * mapState.bpp; scheduleDraw();
    }
  }
  if (e.pointerType === "mouse") showInfoAt(px, py, !pointers.size);
});
function showInfoAt(px, py, withTip) {
  if (!mapState.loaded || !hoverEx) return;
  const v = viewRect(); const wx = Math.floor(v.x0 + px * mapState.bpp), wz = Math.floor(v.z0 + py * mapState.bpp);
  const id = hoverEx.biome_at(wx, wz, 256); const bname = NAME[id] || "";
  $("cursorInfo").textContent = `X ${fmt(wx)}, Z ${fmt(wz)}${bname ? " · " + bname : ""}`;
  const tip = $("tip"); const hit = withTip && (mapState.hits || []).find(h => Math.hypot(h.px - px, h.py - py) <= h.r);
  if (hit) { tip.style.display = "block"; tip.style.left = px + "px"; tip.style.top = py + "px"; tip.textContent = hit.label; } else tip.style.display = "none";
}
const endPointer = (e) => {
  const wasTap = gesture && gesture.type === "pan" && gesture.moved < 6 && pointers.size === 1 && e.pointerType !== "mouse";
  pointers.delete(e.pointerId); reanchor();
  if (!pointers.size) big.classList.remove("drag");
  if (wasTap) { const r = big.getBoundingClientRect(); showInfoAt(e.clientX - r.left, e.clientY - r.top, true); }
};
big.addEventListener("pointerup", endPointer); big.addEventListener("pointercancel", endPointer);
big.addEventListener("keydown", (e) => {
  const step = 60 * mapState.bpp; let used = true;
  if (e.key === "ArrowLeft") mapState.cx -= step; else if (e.key === "ArrowRight") mapState.cx += step;
  else if (e.key === "ArrowUp") mapState.cz -= step; else if (e.key === "ArrowDown") mapState.cz += step;
  else if (e.key === "+" || e.key === "=") { const v = viewRect(); zoomAt(0.5, v.W / 2, v.H / 2); }
  else if (e.key === "-") { const v = viewRect(); zoomAt(2, v.W / 2, v.H / 2); } else used = false;
  if (used) { e.preventDefault(); scheduleDraw(); }
});

