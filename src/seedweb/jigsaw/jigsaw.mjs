// 조각 조립식(지그소) 구조물 조립기 — 자바 에디션 JigsawPlacement를 그대로 따라 함.
// 지금은 고대 도시(모든 조각 rigid, 높이 고정)에 필요한 부분만 구현.
// data = { T: {템플릿 이름: {s:[크기], j:[[x,y,z,front,top,name,target,pool,joint,selPri,placePri]], c:[[x,y,z,lootTable,block]]}},
//          P: {풀 이름: {fb: 대체 풀, el: [[가중치, 요소]]}} }

// ---------- 자바 Random (LegacyRandomSource) ----------
const M48 = (1n << 48n) - 1n, MUL = 0x5DEECE66Dn;
export class JRandom {
  constructor(seed) { this.setSeed(seed); }
  setSeed(seed) { this.s = (BigInt.asUintN(64, BigInt(seed)) ^ MUL) & M48; }
  next(bits) { this.s = (this.s * MUL + 0xBn) & M48; return Number(BigInt.asIntN(32, this.s >> BigInt(48 - bits))); }
  nextInt(bound) {
    if ((bound & (bound - 1)) === 0) return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
    let i, j;
    do { i = this.next(31); j = i % bound; } while (((i - j + (bound - 1)) | 0) < 0);
    return j;
  }
  nextLong() { return BigInt.asIntN(64, (BigInt(this.next(32)) << 32n) + BigInt(this.next(32))); }
  // WorldgenRandom.setLargeFeatureSeed
  setLargeFeatureSeed(worldSeed, cx, cz) {
    this.setSeed(worldSeed);
    const a = this.nextLong(), b = this.nextLong();
    this.setSeed(BigInt.asIntN(64, BigInt(cx) * a) ^ BigInt.asIntN(64, BigInt(cz) * b) ^ BigInt.asIntN(64, BigInt(worldSeed)));
  }
}
// Mth.getSeed(x, y, z)
function mthSeed(x, y, z) {
  let l = BigInt.asIntN(64, BigInt(Math.imul(x, 3129871)) ^ (BigInt(z) * 116129781n) ^ BigInt(y));
  l = BigInt.asIntN(64, l * l * 42317861n + l * 11n);
  return l >> 16n;
}
// 풀 별칭 (시련의 방 생성기 몹 종류): RandomSource.create(seed).forkPositional().at(pos)
function aliasLookup(aliases, worldSeed, pos) {
  const map = {};
  if (!aliases || !aliases.length) return map;
  const r0 = new JRandom(worldSeed), fs = r0.nextLong();
  const r = new JRandom(BigInt.asIntN(64, mthSeed(pos[0], pos[1], pos[2]) ^ fs));
  const pick = list => { const tot = list.reduce((a, b) => a + b.weight, 0); let i = r.nextInt(tot); for (const e of list) { i -= e.weight; if (i < 0) return e.data; } };
  const res = b => {
    const t = b.type.replace('minecraft:', '');
    if (t === 'direct') map[b.alias.replace('minecraft:', '')] = b.target.replace('minecraft:', '');
    else if (t === 'random') map[b.alias.replace('minecraft:', '')] = pick(b.targets).replace('minecraft:', '');
    else if (t === 'random_group') pick(b.groups).forEach(res);
  };
  aliases.forEach(res);
  return map;
}
function shuffle(list, rnd) { for (let i = list.length; i > 1; i--) { const k = rnd.nextInt(i); const t = list[i - 1]; list[i - 1] = list[k]; list[k] = t; } return list; }

// ---------- 방향·회전 ----------
const ROTS = [0, 1, 2, 3];   // NONE, CLOCKWISE_90, CLOCKWISE_180, COUNTERCLOCKWISE_90
const HORIZ = ['north', 'east', 'south', 'west'];
const OPP = { north: 'south', south: 'north', east: 'west', west: 'east', up: 'down', down: 'up' };
const STEP = { north: [0, 0, -1], south: [0, 0, 1], east: [1, 0, 0], west: [-1, 0, 0], up: [0, 1, 0], down: [0, -1, 0] };
function rotDir(d, r) { const i = HORIZ.indexOf(d); return i < 0 ? d : HORIZ[(i + r) % 4]; }
function rotPos(x, y, z, r) { return r === 0 ? [x, y, z] : r === 1 ? [-z, y, x] : r === 2 ? [-x, y, -z] : [z, y, -x]; }

// ---------- 풀 요소 ----------
export function makeAssembler(data) {
  const T = data.T, P = data.P;
  const pools = {};
  for (const [k, p] of Object.entries(P)) { const list = []; for (const [w, e] of p.el) for (let i = 0; i < w; i++) list.push(e); pools[k] = { list, fb: p.fb }; }
  if (!pools.empty) pools.empty = { list: [], fb: 'empty' };
  const getPool = (name) => pools[name.replace('minecraft:', '')] || null;
  const ySpan = e => e.t === 's' ? T[e.l].s[1] : e.t === 'l' ? Math.max(...e.e.map(ySpan)) : 1;
  const maxSize = p => { if (p.max === undefined) p.max = Math.max(0, ...p.list.filter(e => e.t !== 'e').map(ySpan)); return p.max; };

  function tmplBox(name, pos, r) {
    const s = T[name].s, a = rotPos(0, 0, 0, r), b = rotPos(s[0] - 1, s[1] - 1, s[2] - 1, r);
    return [Math.min(a[0], b[0]) + pos[0], Math.min(a[1], b[1]) + pos[1], Math.min(a[2], b[2]) + pos[2], Math.max(a[0], b[0]) + pos[0], Math.max(a[1], b[1]) + pos[1], Math.max(a[2], b[2]) + pos[2]];
  }
  function elBox(el, pos, r) {
    if (el.t === 's') return tmplBox(el.l, pos, r);
    if (el.t === 'l') { let bb = null; for (const e of el.e) { const b = elBox(e, pos, r); bb = bb ? [Math.min(bb[0], b[0]), Math.min(bb[1], b[1]), Math.min(bb[2], b[2]), Math.max(bb[3], b[3]), Math.max(bb[4], b[4]), Math.max(bb[5], b[5])] : b; } return bb; }
    if (el.t === 'f') return [pos[0], pos[1], pos[2], pos[0], pos[1], pos[2]];
    return [pos[0], pos[1], pos[2], pos[0], pos[1], pos[2]];
  }
  // 회전·이동한 지그소 목록을 섞어서 돌려줌 (자바와 같은 난수 소비)
  function shuffledJigsaws(el, pos, r, rnd) {
    if (el.t === 'l') return shuffledJigsaws(el.e[0], pos, r, rnd);
    if (el.t === 'f') return [{ p: [...pos], front: 'down', top: 'south', name: 'minecraft:bottom', target: 'minecraft:empty', pool: 'empty', joint: 'rollable', sel: 0, place: 0 }];
    if (el.t !== 's') return [];
    const list = T[el.l].j.map(j => {
      const q = rotPos(j[0], j[1], j[2], r);
      const front = rotDir(j[3], r), top = rotDir(j[4], r);
      const joint = j[8] || (front === 'up' || front === 'down' ? 'rollable' : 'aligned');
      return { p: [q[0] + pos[0], q[1] + pos[1], q[2] + pos[2]], front, top, name: j[5], target: j[6], pool: j[7], joint, sel: j[9], place: j[10] };
    });
    shuffle(list, rnd);
    return list.map((v, i) => [v, i]).sort((a, b) => (b[0].sel - a[0].sel) || (a[1] - b[1])).map(v => v[0]);   // 선택 우선순위 내림차순(안정 정렬)
  }
  const canAttach = (a, b) => a.front === OPP[b.front] && (a.joint === 'rollable' || a.top === b.top) && a.target === b.name;
  const inside = (bb, p) => p[0] >= bb[0] && p[0] <= bb[3] && p[1] >= bb[1] && p[1] <= bb[4] && p[2] >= bb[2] && p[2] <= bb[5];
  // 빈 공간 모양: 바깥 상자에서 놓인 조각 상자들을 뺀 것
  const fits = (shape, bb) => {
    const c = shape.c;
    if (bb[0] < c[0] || bb[1] < c[1] || bb[2] < c[2] || bb[3] > c[3] || bb[4] > c[4] || bb[5] > c[5]) return false;
    for (const r of shape.r) if (bb[3] >= r[0] && bb[0] <= r[3] && bb[4] >= r[1] && bb[1] <= r[4] && bb[5] >= r[2] && bb[2] <= r[5]) return false;
    return true;
  };

  // worldSeed: BigInt, (cx, cz) 시작 청크, opts: {startPool, startJigsaw, y, maxDepth, maxDist}
  // opts: {startPool, startJigsaw?, y | yMin..yMax, heightFn?(x,z) 지면 높이(첫 빈칸), maxDepth, maxDist, pad:[아래,위], hack, aliases}
  return function assemble(worldSeed, cx, cz, opts) {
    const rnd = new JRandom(0n); rnd.setLargeFeatureSeed(worldSeed, cx, cz);
    const y0 = opts.yMin !== undefined ? rnd.nextInt(opts.yMax - opts.yMin + 1) + opts.yMin : (opts.y || 0);
    const pos0 = [cx * 16, y0, cz * 16];
    const alias = aliasLookup(opts.aliases, worldSeed, pos0);
    const poolOf = n => { n = n.replace('minecraft:', ''); return getPool(alias[n] || n); };
    const rot = rnd.nextInt(4);
    const sp = poolOf(opts.startPool);
    const el0 = sp.list[rnd.nextInt(sp.list.length)];
    let bp1 = [...pos0], v = [0, 0, 0];
    if (opts.startJigsaw) {
      let jp = null;
      for (const j of shuffledJigsaws(el0, pos0, rot, rnd)) if (j.name === opts.startJigsaw) { jp = j.p; break; }
      if (!jp) return null;
      v = [jp[0] - pos0[0], jp[1] - pos0[1], jp[2] - pos0[2]];
      bp1 = [pos0[0] - v[0], pos0[1] - v[1], pos0[2] - v[2]];
    }
    let bb = elBox(el0, bp1, rot);
    const ci = Math.floor((bb[3] + bb[0]) / 2), cj = Math.floor((bb[5] + bb[2]) / 2);
    const k = opts.heightFn && opts.projectStart ? pos0[1] + opts.heightFn(ci, cj) : bp1[1];
    const dy = k - (bb[1] + 1);
    bp1[1] += dy; bb = [bb[0], bb[1] + dy, bb[2], bb[3], bb[4] + dy, bb[5]];
    const cy = k + v[1];
    const D = opts.maxDist, pad = opts.pad || [0, 0];
    const pieces = [{ el: el0, pos: bp1, rot, bb, depth: 0, gld: 1, jn: [] }];
    const outer = { c: [ci - D, Math.max(cy - D, (opts.minY ?? -64) + pad[0]), cj - D, ci + D, Math.min(cy + D, (opts.maxY ?? 319) - pad[1]), cj + D], r: [bb] };
    const queue = [{ pc: pieces[0], free: outer, depth: 0, pri: 0, seq: 0 }];
    let seq = 1;
    while (queue.length) {
      // 우선순위가 높은 것부터, 같으면 먼저 들어온 것부터
      let bi = 0; for (let i = 1; i < queue.length; i++) if (queue[i].pri > queue[bi].pri) bi = i;
      const st = queue.splice(bi, 1)[0];
      const pc = st.pc, pbb = pc.bb, i0 = pbb[1], pRigid = pc.el.pr !== 't';
      let own = null;
      for (const jg of shuffledJigsaws(pc.el, pc.pos, pc.rot, rnd)) {
        const fs = STEP[jg.front], bp2 = [jg.p[0] + fs[0], jg.p[1] + fs[1], jg.p[2] + fs[2]];
        const j = jg.p[1] - i0;
        const pn = jg.pool.replace('minecraft:', '');
        const pool = poolOf(pn);
        if (!pool) continue;
        if (pool.list.length === 0 && (alias[pn] || pn) !== 'empty') continue;
        const fb = getPool(pool.fb);
        if (!fb || (fb.list.length === 0 && pool.fb !== 'empty')) continue;
        const inParent = inside(pbb, bp2);
        let shape;
        if (inParent) { if (!own) own = { c: [...pbb], r: [] }; shape = own; } else shape = st.free;
        let kh = null;
        const cands = [];
        if (st.depth !== opts.maxDepth) cands.push(...shuffle([...pool.list], rnd));
        cands.push(...shuffle([...fb.list], rnd));
        let placed = false;
        for (const el1 of cands) {
          if (el1.t === 'e') break;
          const cRigid = el1.pr !== 't';
          for (const r1 of shuffle([...ROTS], rnd)) {
            const js1 = shuffledJigsaws(el1, [0, 0, 0], r1, rnd);
            let hack = 0;
            if (opts.hack) {
              const b0 = elBox(el1, [0, 0, 0], r1);
              if (b0[4] - b0[1] + 1 <= 16) for (const q of js1) {
                const st2 = STEP[q.front], nq = [q.p[0] + st2[0], q.p[1] + st2[1], q.p[2] + st2[2]];
                if (!inside(b0, nq)) continue;
                const qp = poolOf(q.pool); if (!qp) continue;
                const qf = getPool(qp.fb);
                hack = Math.max(hack, maxSize(qp), qf ? maxSize(qf) : 0);
              }
            }
            for (const j1 of js1) {
              if (!canAttach(jg, j1)) continue;
              const bp4 = [bp2[0] - j1.p[0], bp2[1] - j1.p[1], bp2[2] - j1.p[2]];
              let bb3 = elBox(el1, bp4, r1);
              const i1 = j1.p[1];
              let k1;
              if (pRigid && cRigid) k1 = i0 + (j - i1 + fs[1]);
              else { if (kh === null) kh = opts.heightFn(jg.p[0], jg.p[2]); k1 = kh - i1; }
              const l1 = k1 - bb3[1];
              bb3 = [bb3[0], bb3[1] + l1, bb3[2], bb3[3], bb3[4] + l1, bb3[5]];
              const pos5 = [bp4[0], bp4[1] + l1, bp4[2]];
              if (hack > 0) { const i2 = Math.max(hack + 1, bb3[4] - bb3[1]); bb3[4] = Math.max(bb3[4], bb3[1] + i2); }
              if (!fits(shape, bb3)) continue;
              shape.r.push(bb3);
              // 땅 다듬기(비어디파이어)용: 바닥 높이 보정값과 연결 지점
              const j1v = j - i1 + fs[1];
              const gld = cRigid ? pc.gld - j1v : 1;
              let l2;
              if (pRigid) l2 = i0 + j;
              else if (cRigid) l2 = k1 + i1;
              else { if (kh === null) kh = opts.heightFn(jg.p[0], jg.p[2]); l2 = kh + Math.trunc(j1v / 2); }
              pc.jn.push([bp2[0], l2 - j + pc.gld, bp2[2]]);
              const np = { el: el1, pos: pos5, rot: r1, bb: bb3, depth: st.depth + 1, gld, jn: [[jg.p[0], l2 - i1 + gld, jg.p[2]]] };
              pieces.push(np);
              if (st.depth + 1 <= opts.maxDepth) queue.push({ pc: np, free: shape, depth: st.depth + 1, pri: jg.place, seq: seq++ });
              placed = true; break;
            }
            if (placed) break;
          }
          if (placed) break;
        }
      }
    }
    return pieces;
  };
}

// 조각 목록 → 상자 목록 (조각 순서, 조각 안에서는 템플릿 블록 순서). 상자 위치는 월드 좌표
export function piecesChests(data, pieces) {
  const out = [];
  const add = (el, pos, r, pi) => {
    if (el.t === 'l') { for (const e of el.e) add(e, pos, r, pi); return; }
    if (el.t !== 's') return;
    for (const c of data.T[el.l].c) { const q = rotPos(c[0], c[1], c[2], r); out.push({ x: q[0] + pos[0], y: q[1] + pos[1], z: q[2] + pos[2], table: c[3], block: c[4], piece: pi }); }
  };
  pieces.forEach((p, i) => add(p.el, p.pos, p.rot, i));
  return out;
}
