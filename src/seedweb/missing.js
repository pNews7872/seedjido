
/* ---------------- wasm + workers ---------------- */
function b64ToBytes(s) { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
const anyStub = new Proxy({}, { get: () => () => 0 });
const imports = { wasi_snapshot_preview1: anyStub, env: anyStub };
let wasmModule, mainEx;
const ready = WebAssembly.compile(b64ToBytes(WASM_B64)).then(async m => {
  wasmModule = m; mainEx = (await WebAssembly.instantiate(m, imports)).exports;
});

const workerSrc = `
let ex, MC, running = false, cfg, cursor = 0n;
const anyStub = new Proxy({}, { get: () => () => 0 });
const I32 = () => new Int32Array(ex.memory.buffer);
onmessage = async (ev) => {
  const d = ev.data;
  if (d.type === "init") {
    ex = (await WebAssembly.instantiate(d.module, { wasi_snapshot_preview1: anyStub, env: anyStub })).exports;
    MC = ex.mc_wd(); postMessage({ type: "ready" });
  } else if (d.type === "run") {
    cfg = d.cfg; cursor = BigInt(cfg.start) + BigInt(d.index);
    const m = I32(); const ip = ex.ids_ptr() >> 2, yp = ex.ys_ptr() >> 2, sp = ex.sids_ptr() >> 2;
    cfg.ids.forEach((v, i) => { m[ip + i] = v; m[yp + i] = cfg.ys[i]; });
    cfg.sids.forEach((v, i) => { m[sp + i] = v; });
    running = true; loop();
  } else if (d.type === "stop") { running = false; }
  else if (d.type === "tile") {
    ex.set_seed(d.lo, d.hi, MC);
    const p = ex.gen_area(d.s, d.tx * 64, d.tz * 64, 64, 64, 64);
    const ids = p ? new Int32Array(ex.memory.buffer, p, 64 * 64).slice() : new Int32Array(64 * 64).fill(-1);
    postMessage({ type: "tile", key: d.key, ids }, [ids.buffer]);
  } else if (d.type === "structs") {
    ex.set_seed(d.lo, d.hi, MC);
    const out = {};
    for (const st of d.types) {
      const n = ex.structs_rect(st, d.x0, d.z0, d.x1, d.z1, 2000);
      if (n < 0) { out[st] = null; continue; }
      const r = ex.rect_ptr() >> 2; out[st] = Array.from(I32().slice(r, r + n * 2));
    }
    postMessage({ type: "structs", req: d.req, tx: d.tx, tz: d.tz, out });
  } else if (d.type === "near") {
    ex.set_seed(d.lo, d.hi, MC); ex.spawn_xz();
    let o = ex.out_ptr() >> 2; const sx = I32()[o + 80], sz = I32()[o + 81];
    const sp = ex.sids_ptr() >> 2; const m = I32(); d.types.forEach((v, i) => m[sp + i] = v);
    ex.nearest(0, d.R, 32, sx, sz, 0, d.types.length);
    o = ex.out_ptr() >> 2; const mm = I32();
    postMessage({ type: "near", req: d.req, spawn: [sx, sz], out: Array.from(mm.slice(o, o + d.types.length * 3)) });
  }
};
const rnd = new Uint32Array(2);
function loop() {
  if (!running) return;
  const n = cfg.ids.length, ns = cfg.sids.length; let checked = 0;
  const t0 = performance.now();
  while (performance.now() - t0 < 120) {
    let lo, hi;
    if (cfg.mode === "random") { crypto.getRandomValues(rnd); lo = rnd[0]; hi = rnd[1]; }
    else { const s = BigInt.asUintN(64, cursor); lo = Number(s & 0xffffffffn); hi = Number(s >> 32n); cursor += BigInt(cfg.stride); }
    checked++;
    if (ex.test_seed(lo, hi, MC, n, cfg.R, cfg.step, cfg.cx, cfg.cz, cfg.spawn, cfg.fast, ns)) {
      ex.nearest(n, cfg.R, Math.max(8, cfg.step >> 1), cfg.cx, cfg.cz, cfg.spawn, ns);
      const o = ex.out_ptr() >> 2; const m = I32();
      postMessage({ type: "hit", lo, hi, out: Array.from(m.slice(o, o + (n + ns) * 3)), center: [m[o + 80], m[o + 81]] });
    }
  }
  postMessage({ type: "progress", checked });
  setTimeout(loop, 0);
}`;
const workerURL = URL.createObjectURL(new Blob([workerSrc], { type: "text/javascript" }));

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString("ko-KR");
const seedStr = (lo, hi) => BigInt.asIntN(64, (BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0)).toString();
function parseSeed(text) {
  const t = String(text).trim();
  if (/^-?\d+$/.test(t)) { try { const b = BigInt(t); if (b >= -(2n ** 63n) && b < 2n ** 63n) return BigInt.asUintN(64, b); } catch (e) {} }
  if (!t) return 0n;
  let h = 0; for (let i = 0; i < t.length; i++) h = (Math.imul(31, h) + t.charCodeAt(i)) | 0; // Java String.hashCode
  return BigInt.asUintN(64, BigInt(h));
}
const split = u => [Number(u & 0xffffffffn), Number(u >> 32n)];

/* ---------------- tabs ---------------- */
function showTab(which) {
  const map = which === "map";
  $("tabSearch").setAttribute("aria-selected", map ? "false" : "true");
  $("tabMap").setAttribute("aria-selected", map ? "true" : "false");
  $("viewSearch").hidden = map; $("viewMap").hidden = !map;
  if (map) { if (!mapState.loaded) openMapSeed($("mapSeed").value); else resizeMap(); }
}
$("tabSearch").addEventListener("click", () => showTab("search"));
$("tabMap").addEventListener("click", () => showTab("map"));

/* ---------------- search: chips ---------------- */
let selected = [186, 184], selS = [];
function renderChips() {
  const el = $("chips"); el.innerHTML = ""; let lastG = "";
  for (const b of BIOMES) {
    if (b.g !== lastG) { lastG = b.g; const h = document.createElement("div"); h.className = "grp"; h.textContent = b.g; el.appendChild(h); }
    const c = document.createElement("button"); c.type = "button"; c.className = "chip"; c.title = b.en || "";
    c.setAttribute("aria-pressed", selected.includes(b.id) ? "true" : "false");
    c.innerHTML = `<span class="sw" style="background:${colorOf(b)}"></span>${b.name}`;
    c.addEventListener("click", () => { if (running) return; if (selected.includes(b.id)) selected = selected.filter(x => x !== b.id); else if (selected.length < 8) selected.push(b.id); renderChips(); });
    el.appendChild(c);
  }
  const s = $("schips"); s.innerHTML = "";
  for (const st of STRUCTS) {
    const c = document.createElement("button"); c.type = "button"; c.className = "chip";
    c.setAttribute("aria-pressed", selS.includes(st.id) ? "true" : "false");
    c.innerHTML = `${iconTag(st.id, 16)}${st.name}`;
    c.addEventListener("click", () => { if (running) return; if (selS.includes(st.id)) selS = selS.filter(x => x !== st.id); else if (selS.length < 8) selS.push(st.id); renderChips(); });
    s.appendChild(c);
  }
  $("bCount").textContent = `${selected.length}/8`; $("sCount").textContent = `${selS.length}/8`;
}
renderChips();

/* ---------------- search: run ---------------- */
let running = false, workers = [], results = [], cols = [], checkedTotal = 0, t0 = 0, target = 10, selIndex = -1;
function setState(on, text) { $("state").classList.toggle("on", on); $("stateText").textContent = text; }
function colDefs(bids, sids) { return [...bids.map(id => ({ kind: "b", ...BIOMES.find(b => b.id === id) })), ...sids.map(id => ({ kind: "s", ...SBY[id] }))]; }
function colSwatch(c) { return c.kind === "s" ? iconTag(c.id, 16) : `<span class="sw" style="background:${colorOf(c)}"></span>`; }

function renderTable() {
  const t = $("results");
  if (!results.length) { t.innerHTML = `<tr><td class="empty">아직 찾은 시드가 없어요. 조건을 고르고 검색을 시작하세요.</td></tr>`; return; }
  const sorted = results.map((r, i) => ({ r, i })).sort((a, b) => a.r.worst - b.r.worst);
  const hc = results[results.length - 1].cols;
  let h = `<thead><tr><th>시드</th><th>기준점</th>${hc.map(c => `<th>${c.name}</th>`).join("")}<th>가장 먼 거리</th><th></th></tr></thead><tbody>`;
  for (const { r, i } of sorted) {
    h += `<tr class="row${i === selIndex ? " sel" : ""}" data-i="${i}"><td><span class="seed">${r.seed}</span>${r.example ? '<span class="tag">예시</span>' : ""}</td><td class="num">${r.spawn ? "스폰 " : ""}(${r.center[0]}, ${r.center[1]})</td>`;
    r.pts.forEach(p => { h += `<td class="num">${p.d < 0 ? "-" : `${fmt(p.d)}칸 <span class="sub">(${p.x}, ${p.z})</span>`}</td>`; });
    h += `<td class="num">${fmt(r.worst)}칸</td><td><button class="mini" type="button" data-copy="${r.seed}">복사</button> <button class="mini" type="button" data-map="${i}">지도</button></td></tr>`;
  }
  t.innerHTML = h + "</tbody>";
}
$("results").addEventListener("click", (e) => {
  const c = e.target.closest("[data-copy]");
  if (c) { e.stopPropagation(); navigator.clipboard.writeText(c.dataset.copy).then(() => { c.textContent = "복사됨"; setTimeout(() => c.textContent = "복사", 1200); }).catch(() => { c.textContent = "직접 복사"; }); return; }
  const mp = e.target.closest("[data-map]");
  if (mp) { e.stopPropagation(); const r = results[+mp.dataset.map]; $("mapSeed").value = r.seed; showTab("map"); openMapSeed(r.seed); return; }
  const row = e.target.closest("tr.row");
  if (row) { selIndex = +row.dataset.i; renderTable(); drawPreview(results[selIndex]); }
});
$("pvOpen").addEventListener("click", () => { const r = results[selIndex]; if (!r) return; $("mapSeed").value = r.seed; showTab("map"); openMapSeed(r.seed); });

function addResult(lo, hi, out, cfg, example, center, cdefs) {
  const pts = cdefs.map((c, k) => ({ x: out[k*3], z: out[k*3+1], d: out[k*3+2] }));
  const r = { lo, hi, seed: seedStr(lo, hi), pts, worst: Math.max(0, ...pts.map(p => p.d)), cfg, cols: cdefs, example: !!example, center: center || [cfg.cx, cfg.cz], spawn: !!cfg.spawn };
  results.push(r);
  $("found").textContent = fmt(results.filter(x => !x.example).length);
  if (selIndex < 0 || results[selIndex].example) { selIndex = results.length - 1; drawPreview(r); }
  renderTable();
}

function drawPreview(r) {
  if (!r || !mainEx) return;
  const cv = $("preview"), ctx = cv.getContext("2d"), N = cv.width;
  const R = r.cfg.R; const [cx, cz] = r.center; const span = R * 2.3; const per = span / N;
  mainEx.set_seed(r.lo, r.hi, mainEx.mc_wd());
  const img = ctx.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const b = mainEx.biome_at(Math.round(cx - span / 2 + i * per), Math.round(cz - span / 2 + j * per), 256);
    const hex = COLORS[b] || "888888"; const k = (j * N + i) * 4;
    img.data[k] = parseInt(hex.slice(0, 2), 16); img.data[k+1] = parseInt(hex.slice(2, 4), 16); img.data[k+2] = parseInt(hex.slice(4, 6), 16); img.data[k+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const toPx = (x, z) => [(x - (cx - span / 2)) / per, (z - (cz - span / 2)) / per];
  ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.arc(N / 2, N / 2, R / per, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(N/2 - 6, N/2); ctx.lineTo(N/2 + 6, N/2); ctx.moveTo(N/2, N/2 - 6); ctx.lineTo(N/2, N/2 + 6); ctx.stroke();
  r.pts.forEach((p, k) => {
    if (p.d < 0) return; const [px, py] = toPx(p.x, p.z); const c = r.cols[k];
    ctx.lineWidth = 2; ctx.strokeStyle = "#111";
    if (c.kind === "s") { ctx.imageSmoothingEnabled = false; ctx.drawImage(ICONS[c.id], Math.round(px - 8), Math.round(py - 8), 16, 16); }
    else { ctx.fillStyle = colorOf(c); ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  });
  $("pvTitle").textContent = `미리보기 · 시드 ${r.seed}`;
  $("cbLink").href = `https://www.chunkbase.com/apps/seed-map#seed=${r.seed}`;
  $("legend").innerHTML = r.cols.map((c, k) => `<div>${colSwatch(c)}${c.name}: ${r.pts[k].d < 0 ? "-" : `${fmt(r.pts[k].d)}칸, (${r.pts[k].x}, ${r.pts[k].z})`}</div>`).join("")
    + `<div style="color:var(--muted)">범위: 가로세로 약 ${fmt(Math.round(span))}칸</div>`;
}

async function start() {
  if (!selected.length && !selS.length) { setState(false, "바이옴이나 구조물을 하나 이상 골라 주세요."); return; }
  await ready;
  const cdefs = colDefs(selected, selS);
  const bcols = cdefs.filter(c => c.kind === "b");
  const cfg = {
    ids: bcols.map(c => c.id), ys: bcols.map(c => c.y), sids: selS.slice(),
    R: Math.max(64, Math.min(5000, +$("radius").value || 500)), step: +$("step").value,
    cx: Math.round(+$("cx").value || 0), cz: Math.round(+$("cz").value || 0),
    spawn: $("center").value === "spawn" ? 1 : 0, fast: $("fast").checked ? 1500 : 0,
    mode: $("mode").value, start: Math.max(0, Math.floor(+$("start").value || 0)),
  };
  target = Math.max(1, Math.min(200, +$("target").value || 10));
  const nW = Math.max(1, Math.min(32, +$("threads").value || 4)); cfg.stride = nW;
  results = []; selIndex = -1; checkedTotal = 0; t0 = performance.now();
  $("checked").textContent = "0"; $("found").textContent = "0"; $("rate").textContent = "0"; renderTable();
  running = true; $("go").disabled = true; $("stop").disabled = false;
  setState(true, "검색 중…");
  workers = [];
  for (let i = 0; i < nW; i++) {
    const w = new Worker(workerURL); workers.push(w);
    w.onmessage = (ev) => {
      const d = ev.data;
      if (d.type === "ready") w.postMessage({ type: "run", cfg, index: i });
      else if (d.type === "progress") {
        checkedTotal += d.checked; $("checked").textContent = fmt(checkedTotal);
        $("rate").textContent = fmt(Math.round(checkedTotal / Math.max((performance.now() - t0) / 1000, .001)));
      } else if (d.type === "hit" && running) {
        addResult(d.lo, d.hi, d.out, cfg, false, d.center, cdefs);
        if (results.length >= target) stop("찾을 개수를 채워서 멈췄어요.");
      }
    };
    w.postMessage({ type: "init", module: wasmModule });
  }
}
function stop(msg) {
  running = false; workers.forEach(w => { w.postMessage({ type: "stop" }); w.terminate(); }); workers = [];
  $("go").disabled = false; $("stop").disabled = true;
  setState(false, msg || "멈췄어요.");
  if (results.length && $("mode").value === "small") {
    const last = results.reduce((m, r) => { const s = BigInt(r.seed); return s > m ? s : m; }, 0n);
    if (last >= 0n) $("start").value = (last + 1n).toString();
  }
}
$("center").addEventListener("change", () => { const on = $("center").value === "coord"; $("cx").disabled = !on; $("cz").disabled = !on; });
$("go").addEventListener("click", start);
$("stop").addEventListener("click", () => stop());

/* ---------------- map ---------------- */
