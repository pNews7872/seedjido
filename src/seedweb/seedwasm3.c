#include "../xcub/generator.h"
#include "../xcub/biomes.h"
#include "../xcub/finders.h"
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "../xcub/features/mineshaft.h"
#include "../xcub/features/stronghold.h"
#include "../xcub/features/fortress.h"
#include "../xcub/features/end_city.h"
#include "../xcub/features/piece.h"

static Generator G;
static void ensureAQ(void); static void aqReset(void); static int aquiferSubstance(int x, int y, int z, double density);
static int curMc = -1;
static int idsBuf[16];
static int ysBuf[16];
static int outBuf[128];
int *ids_ptr(void) { return idsBuf; }
int *ys_ptr(void) { return ysBuf; }
int *out_ptr(void) { return outBuf; }

static int matchB(int want, int b) {
    if (want == -1) return isOceanic(b);
    if (want == -2) return b == badlands || b == eroded_badlands || b == wooded_badlands;
    return b == want;
}

static int nY; static int yList[4]; static int yIdx[16];
static void prepY(int n) {
    nY = 0;
    for (int i = 0; i < n; i++) {
        int k; for (k = 0; k < nY; k++) if (yList[k] == ysBuf[i]) break;
        if (k == nY && nY < 4) yList[nY++] = ysBuf[i];
        yIdx[i] = k < 4 ? k : 0;
    }
}

static int curDim = 0;
void set_seed(uint32_t lo, uint32_t hi, int mc) {
    if (mc != curMc) { setupGenerator(&G, mc, 0); curMc = mc; }
    applySeed(&G, DIM_OVERWORLD, ((uint64_t)hi << 32) | lo); curDim = 0;
}
void set_seed_dim(uint32_t lo, uint32_t hi, int mc, int dim) {
    if (mc != curMc) { setupGenerator(&G, mc, 0); curMc = mc; }
    applySeed(&G, dim, ((uint64_t)hi << 32) | lo); curDim = dim;
}


#include "../xcub/biomenoise.h"
#include <limits.h>
const int *getBiomeParaLimits(int mc, int id);
static BiomeNoise PB;
static int grpOcean[] = {0,24,10,50,44,45,48,46,49,-99};
static int grpBad[] = {37,38,165,-99};
// fill lim[12] with union of limits for a requested id; returns 0 if unknown
static int limitsFor(int mc, int want, int lim[12]) {
    int *grp = want == -1 ? grpOcean : want == -2 ? grpBad : 0;
    int single[2] = {want, -99};
    if (!grp) grp = single;
    int first = 1;
    for (int k = 0; grp[k] != -99; k++) {
        const int *l = getBiomeParaLimits(mc, grp[k]);
        if (!l) return 0;
        for (int j = 0; j < 12; j += 2) {
            if (first) { lim[j] = l[j]; lim[j+1] = l[j+1]; }
            else { if (l[j] < lim[j]) lim[j] = l[j]; if (l[j+1] > lim[j+1]) lim[j+1] = l[j+1]; }
        }
        first = 0;
    }
    return !first;
}
int g_lastCx, g_lastCz;
// conservative climate pre-check. returns 0 when some requested biome surely cannot appear.
int prefilter(int mc, int n, int R, int step, int cx, int cz, int margin) {
    static const int order[5] = {NP_CONTINENTALNESS, NP_TEMPERATURE, NP_HUMIDITY, NP_EROSION, NP_WEIRDNESS};
    int lims[16][12]; int has[16];
    for (int i = 0; i < n; i++) has[i] = limitsFor(mc, idsBuf[i], lims[i]);
    long long R2 = (long long)R * R;
    for (int oi = 0; oi < 5; oi++) {
        int p = order[oi];
        int need = 0, okMask = 0;
        for (int i = 0; i < n; i++)
            if (has[i] && (lims[i][2*p] != INT_MIN || lims[i][2*p+1] != INT_MAX)) need |= 1 << i;
        if (!need) continue;
        setClimateParaSeed(&PB, G.seed, 0, p, -1);
        for (int x = -R; x <= R && okMask != need; x += step)
            for (int z = -R; z <= R; z += step) {
                if ((long long)x*x + (long long)z*z > R2) continue;
                double v = sampleClimatePara(&PB, 0, (cx + x) / 4.0, (cz + z) / 4.0) * 10000.0;
                for (int i = 0; i < n; i++) {
                    if (!(need >> i & 1) || (okMask >> i & 1)) continue;
                    double lo = lims[i][2*p] == INT_MIN ? -1e18 : lims[i][2*p] - margin;
                    double hi = lims[i][2*p+1] == INT_MAX ? 1e18 : lims[i][2*p+1] + margin;
                    if (v >= lo && v <= hi) okMask |= 1 << i;
                }
                if (okMask == need) break;
            }
        if (okMask != need) return 0;
    }
    return 1;
}

/* ---------- structures ---------- */
static int sidsBuf[16];
int *sids_ptr(void) { return sidsBuf; }
static int floorDiv(int a, int b) { return a >= 0 ? a / b : -((-a + b - 1) / b); }
static int viableAt(int st, int x, int z) {
    if (st == Trail_Ruins || st == Abandoned_Camp) {
        /* 바이옴 검사 지점 보정 (월드 파일 대조): 길의 잔해는 청크 시작 지점,
           버려진 캠프는 회전에 따라 시작 지점 또는 한 칸(4블록) 서쪽/북쪽 */
        if (G.mc < (st == Trail_Ruins ? MC_1_20 : MC_26_3)) return 0;
        int qx = x >> 2, qz = z >> 2;
        if (st == Abandoned_Camp) {
            StructureVariant sv; memset(&sv, 0, sizeof sv); getVariant(&sv, st, G.mc, G.seed, x, z, -1);
            if (sv.rotation == 1) qx -= 1; else if (sv.rotation == 3) qz -= 1;
        }
        int id = getBiomeAt(&G, 4, qx, 320 >> 2, qz);
        if (id < 0 || !isViableFeatureBiome(G.mc, st, id)) return 0;
        return isViableStructureTerrain(st, &G, x, z);
    }
    if (!isViableStructurePos(st, &G, x, z, 0)) return 0;
    if (!isViableStructureTerrain(st, &G, x, z)) return 0;
    return 1;
}
/* nearest viable instance of structure st within R of (cx,cz). returns squared distance or -1 */
static long long nearestStruct(int st, int R, int cx, int cz, int *ox, int *oz, int anyOk) {
    long long R2 = (long long)R * R, best = -1;
    if (st == Stronghold) {
        StrongholdIter sh; initFirstStronghold(&sh, G.mc, G.seed);
        for (int i = 0; i < 128; i++) {
            int more = nextStronghold(&sh, &G);
            long long dx = sh.pos.x - cx, dz = sh.pos.z - cz, d2 = dx*dx + dz*dz;
            if (d2 <= R2 && (best < 0 || d2 < best)) { best = d2; *ox = sh.pos.x; *oz = sh.pos.z; if (anyOk) return best; }
            if (!more) break;
            long long ax = sh.nextapprox.x, az = sh.nextapprox.z;
            double od = sqrt((double)(ax*ax + az*az)), cd = sqrt((double)cx*cx + (double)cz*cz);
            if (od - 200 > cd + R) break; // later rings are only further away
        }
        return best;
    }
    StructureConfig sc;
    if (!getStructureConfig(st, G.mc, &sc)) return -1;
    int rs = sc.regionSize * 16;
    int rx0 = floorDiv(cx - R, rs), rx1 = floorDiv(cx + R, rs);
    int rz0 = floorDiv(cz - R, rs), rz1 = floorDiv(cz + R, rs);
    for (int rx = rx0; rx <= rx1; rx++)
        for (int rz = rz0; rz <= rz1; rz++) {
            Pos p;
            if (!getStructurePos(st, G.mc, G.seed, rx, rz, &p)) continue;
            long long dx = p.x - cx, dz = p.z - cz, d2 = dx*dx + dz*dz;
            if (d2 > R2 || (best >= 0 && d2 >= best)) continue;
            if (!viableAt(st, p.x, p.z)) continue;
            best = d2; *ox = p.x; *oz = p.z;
            if (anyOk) return best;
        }
    return best;
}
static int isqrtll(long long d) { int r = (int)sqrt((double)d); while ((long long)r*r > d) r--; while ((long long)(r+1)*(r+1) <= d) r++; return r; }

#define NOY (-32768)
static int rectBuf[4 * 4096];
int *rect_ptr(void) { return rectBuf; }
static int rcnt, rmax, rx0_, rz0_, rx1_, rz1_;
static void emit(int x, int y, int z, int flag) {
    if (rcnt >= rmax) return;
    if (x < rx0_ || x > rx1_ || z < rz0_ || z > rz1_) return;
    rectBuf[rcnt*4] = x; rectBuf[rcnt*4+1] = y; rectBuf[rcnt*4+2] = z; rectBuf[rcnt*4+3] = flag; rcnt++;
}
static Piece pieces[1024];
extern uint64_t g_mineshaftRng, g_fortressRng, g_strongholdRng;
extern int g_spiderN, g_spiderX[64], g_spiderY[64], g_spiderZ[64];

/* 1.18+ mineshaft: biome at (chunk middle x, y50, chunk min z); returns 0 if not generated, else 1 (+mesa flag in *mesa) */
static int mineshaftBiome(int cx, int cz, int *mesa) {
    int b = getBiomeAt(&G, 4, (cx * 16 + 8) >> 2, 50 >> 2, (cz * 16) >> 2);
    if (b == deep_dark || !isOverworld(G.mc, b)) return 0;
    *mesa = (b == badlands || b == eroded_badlands || b == wooded_badlands);
    return 1;
}
static int surfaceY(int x, int z) {
    if (curDim == DIM_END) return getEndSurfaceHeight(G.mc, G.seed, x, z);
    if (G.mc < MC_1_18) return 64;   /* 1.18 전 지형은 계산하지 않음 (바이옴 확인용 높이만) */
    float y = 0; mapApproxHeight(&y, NULL, &G, NULL, x >> 2, z >> 2, 1, 1); return (int)y;
}
/* y offset applied by the game after the pieces are laid out */
static int mineshaftYOffset(int n, int mesa) {
    int minY = 1 << 30, maxY = -(1 << 30), minX = 1 << 30, maxX = -(1 << 30), minZ = 1 << 30, maxZ = -(1 << 30);
    for (int i = 0; i < n; i++) {
        Piece *p = &pieces[i];
        if (p->bb0.y < minY) minY = p->bb0.y; if (p->bb1.y > maxY) maxY = p->bb1.y;
        if (p->bb0.x < minX) minX = p->bb0.x; if (p->bb1.x > maxX) maxX = p->bb1.x;
        if (p->bb0.z < minZ) minZ = p->bb0.z; if (p->bb1.z > maxZ) maxZ = p->bb1.z;
    }
    uint64_t rng = g_mineshaftRng;
    if (G.mc < MC_1_18) {   /* 1.18 전: 바닥이 0, 메사는 해수면 기준 고정 이동 (MineshaftFeature 1.16) */
        if (mesa) return 63 - maxY + (maxY - minY + 1) / 2 + 5;
        int i = 63 - 10, j = (maxY - minY + 1) + 1;
        if (j < i) j += nextInt(&rng, i - j);
        return j - maxY;
    }
    if (mesa) {
        int cy = (minY + maxY) / 2, h = surfaceY((minX + maxX) / 2, (minZ + maxZ) / 2);
        int l = h <= 63 ? 63 : 63 + nextInt(&rng, h - 63 + 1);
        return l - cy;
    }
    int i = 63 - 10, j = (maxY - minY + 1) + (-64) + 1;
    if (j < i) j += nextInt(&rng, i - j);
    return j - maxY;
}
static void doMineshafts(int spiders) {
    int pad = spiders ? 112 : 0;
    int cx0 = floorDiv(rx0_ - pad, 16), cx1 = floorDiv(rx1_ + pad, 16), cz0 = floorDiv(rz0_ - pad, 16), cz1 = floorDiv(rz1_ + pad, 16);
    static Pos ms[2048];
    int n = getMineshafts(G.mc, G.seed, cx0, cz0, cx1, cz1, ms, 2048); if (n > 2048) n = 2048;
    for (int k = 0; k < n && rcnt < rmax; k++) {
        int cx = ms[k].x >> 4, cz = ms[k].z >> 4, mesa = 0;
        if (!mineshaftBiome(cx, cz, &mesa)) continue;
        if (!spiders) {
            int np = getMineshaftPieces(pieces, 1024, G.mc, G.seed, cx, cz);
            int dy = mineshaftYOffset(np, mesa);
            emit(pieces[0].bb0.x + (pieces[0].bb1.x - pieces[0].bb0.x) / 2, pieces[0].bb0.y + dy, pieces[0].bb0.z + (pieces[0].bb1.z - pieces[0].bb0.z) / 2, mesa);
        } else {
            StructureSaltConfig ss; int b = getBiomeAt(&G, 4, (cx * 16 + 8) >> 2, 50 >> 2, (cz * 16) >> 2);
            if (!getStructureSaltConfig(Mineshaft, G.mc, b, &ss)) continue;
            g_spiderN = 0;
            int np = getMineshaftLoot(pieces, 1024, ss, G.mc, G.seed, cx, cz);
            int dy = mineshaftYOffset(np, mesa);
            for (int i = 0; i < g_spiderN; i++) emit(g_spiderX[i], g_spiderY[i] + dy, g_spiderZ[i], 0);
        }
    }
}
static void doStrongholdSpawners(void) {
    StrongholdIter sh; initFirstStronghold(&sh, G.mc, G.seed);
    for (int i = 0; i < 128 && rcnt < rmax; i++) {
        int more = nextStronghold(&sh, &G);
        if (sh.pos.x >= rx0_ - 160 && sh.pos.x <= rx1_ + 160 && sh.pos.z >= rz0_ - 160 && sh.pos.z <= rz1_ + 160) {
            int np = getStrongholdPieces(pieces, 1024, G.mc, G.seed, sh.pos.x >> 4, sh.pos.z >> 4);
            for (int k = 0; k < np; k++) if (pieces[k].type == SH_PORTAL_ROOM) {
                int x = 5, z = 6; rotPos(pieces[k].bb0, pieces[k].bb1, &x, &z, pieces[k].rot);
                emit(x, NOY, z, 0); break;
            }
        }
        if (!more) break;
    }
}
static void doFortress(int spawners) {
    StructureConfig sc;
    if (!getStructureConfig(Fortress, G.mc, &sc)) return;
    int rs = sc.regionSize * 16, pad = spawners ? 128 : 0;
    int a0 = floorDiv(rx0_ - pad, rs), a1 = floorDiv(rx1_ + pad, rs), b0 = floorDiv(rz0_ - pad, rs), b1 = floorDiv(rz1_ + pad, rs);
    for (int rx = a0; rx <= a1; rx++) for (int rz = b0; rz <= b1 && rcnt < rmax; rz++) {
        Pos p; if (!getStructurePos(Fortress, G.mc, G.seed, rx, rz, &p)) continue;
        if (!isViableStructurePos(Fortress, &G, p.x, p.z, 0)) continue;
        int np = getFortressPieces(pieces, 1024, G.mc, G.seed, p.x >> 4, p.z >> 4);
        int minY = 1 << 30, maxY = -(1 << 30);
        for (int i = 0; i < np; i++) { if (pieces[i].bb0.y < minY) minY = pieces[i].bb0.y; if (pieces[i].bb1.y > maxY) maxY = pieces[i].bb1.y; }
        uint64_t rng = g_fortressRng;
        int span = maxY - minY + 1, room = 70 - 48 + 1 - span;
        int j = room > 1 ? 48 + nextInt(&rng, room) : 48, dy = j - minY;
        if (!spawners) { emit(p.x, 64 + dy, p.z, 0); continue; }
        for (int i = 0; i < np; i++) if (pieces[i].type == BRIDGE_SPAWNER) {
            int x = 3, z = 5; rotPos(pieces[i].bb0, pieces[i].bb1, &x, &z, pieces[i].rot);
            emit(x, pieces[i].bb0.y + 5 + dy, z, 0);
        }
    }
}
static void doEndCity(int wantShip) {
    StructureConfig sc;
    if (!getStructureConfig(End_City, G.mc, &sc)) return;
    int rs = sc.regionSize * 16;
    int a0 = floorDiv(rx0_, rs), a1 = floorDiv(rx1_, rs), b0 = floorDiv(rz0_, rs), b1 = floorDiv(rz1_, rs);
    static Piece ec[END_CITY_PIECES_MAX];
    for (int rx = a0; rx <= a1; rx++) for (int rz = b0; rz <= b1 && rcnt < rmax; rz++) {
        Pos p; if (!getStructurePos(End_City, G.mc, G.seed, rx, rz, &p)) continue;
        if (p.x < rx0_ || p.x > rx1_ || p.z < rz0_ || p.z > rz1_) continue;
        if (!viableAt(End_City, p.x, p.z)) continue;
        int baseY = 0;
        {   /* game check: lowest of 4 surface samples (rotation dependent) must be >= 60 */
            uint64_t rr = chunkGenerateRnd(G.seed, p.x >> 4, p.z >> 4); int rot = nextInt(&rr, 4);
            int oi = (rot == 1 || rot == 2) ? -5 : 5, oj = (rot == 2 || rot == 3) ? -5 : 5;
            int k = (p.x & ~15) + 7, l = (p.z & ~15) + 7, h = surfaceY(k, l), t;
            t = surfaceY(k, l + oj); if (t < h) h = t; t = surfaceY(k + oi, l); if (t < h) h = t; t = surfaceY(k + oi, l + oj); if (t < h) h = t;
            if (h < 60) continue;
            baseY = h;
        }
        int np = getEndCityPieces(ec, G.seed, p.x >> 4, p.z >> 4), ship = 0, sx = p.x, sy = NOY, sz = p.z;
        for (int i = 0; i < np; i++) if (ec[i].type == END_SHIP) { ship = 1; sx = (ec[i].bb0.x + ec[i].bb1.x) / 2; sz = (ec[i].bb0.z + ec[i].bb1.z) / 2; sy = ec[i].bb0.y < ec[i].bb1.y ? ec[i].bb0.y : ec[i].bb1.y; break; }
        if (ship != wantShip) continue;
        int y = surfaceY(p.x + 7, p.z + 7);
        int cls = np <= 15 ? 0 : np <= 45 ? 1 : np <= 80 ? 2 : 3;   /* 크기: 건물 하나 / 중간 / 큼 / 아주 큼 */
        /* ship: dz 9b | dx 9b | (ship bottom Y - city base Y)/2 6b ; city base = lowest sample (game start Y) */
        int ry = ship ? (baseY + sy - y + 8) >> 1 : 0; if (ry < 0) ry = 0; if (ry > 63) ry = 63;
        emit(p.x, y, p.z, (ship ? ((sz - p.z + 256) | ((sx - p.x + 256) << 9) | (ry << 18)) : 0) | (cls << 24) | ((np > 252 ? 63 : np / 4) << 26));
    }
}
/* all instances of st inside rectangle; returns count of (x,y,z,flag) quads in rectBuf, -1 if too many regions */
int canyon_trace(uint64_t seed, int mc, int cx, int cz, int out[6][3], int *ymin, int *ymax);
/* 협곡: 시작 청크가 범위 안에 있는 것. 협곡마다 6개 점 (flag 하위 4비트 = 0 표시점(가운데), 1~6 경로 점; 표시점 flag>>4 = 길이, y = 가장 낮은 바닥) */
static void doCanyons(void) {
    int c0 = rx0_ >> 4, c1 = rx1_ >> 4, d0 = rz0_ >> 4, d1 = rz1_ >> 4;
    for (int cx = c0; cx <= c1; cx++) for (int cz = d0; cz <= d1; cz++) {
        if (rcnt + 7 > rmax) return;
        int p[6][3], lo, hi;
        int bc = canyon_trace(G.seed, G.mc, cx, cz, p, &lo, &hi);
        if (!bc) continue;
        int mx = (p[2][0] + p[3][0]) / 2, mz = (p[2][2] + p[3][2]) / 2;
        int q[7][4] = {{mx, lo < -64 ? -64 : lo, mz, (bc << 4) | ((hi > 255 ? 255 : hi < -64 ? -64 : hi) + 64) << 16}};
        for (int k = 0; k < 6; k++) { q[k+1][0] = p[k][0]; q[k+1][1] = p[k][1]; q[k+1][2] = p[k][2]; q[k+1][3] = k + 1; }
        for (int k = 0; k < 7; k++) { rectBuf[rcnt*4] = q[k][0]; rectBuf[rcnt*4+1] = q[k][1]; rectBuf[rcnt*4+2] = q[k][2]; rectBuf[rcnt*4+3] = q[k][3]; rcnt++; }
    }
}
/* 네더 화석의 마른 가스트 (실제 월드 2,296개와 비교해 맞춘 규칙)
   - 난수 위치는 구조물 상자의 가운데(BoundingBox.getCenter: 최소 + 크기/2)
   - 0.5 미만이면 바닥 높이의 무작위 칸에 놓는데, 그 칸이 화석 뼈 블록이면 못 놓음
   - 뼈 위치표는 화석 종류(14)×회전(4)별 바닥층, 상자 최소 모서리 기준 */
static const char *FOSSIL_BONES[14][4] = {
  {"0,0;0,2;0,4;3,0;3,2","0,0;2,0;2,3;4,0;4,3","0,2;0,4;3,0;3,2;3,4","0,0;0,3;2,0;2,3;4,3"},
  {"0,4;1,2;1,4;2,0;2,1;2,2;2,3;2,4;3,4;4,4","0,0;0,1;0,2;0,3;0,4;1,2;2,1;2,2;3,2;4,2","0,0;1,0;2,0;2,1;2,2;2,3;2,4;3,0;3,2;4,0","0,2;1,2;2,2;2,3;3,2;4,0;4,1;4,2;4,3;4,4"},
  {"0,0;0,1","0,0;1,0","2,0;2,1","0,2;1,2"},
  {"0,0;2,0","0,0;0,2","0,0;2,0","0,0;0,2"},
  {"0,0","0,0","1,0","0,1"},
  {"0,2;0,4;2,0;4,0;6,2;6,4","0,0;0,6;2,0;2,6;4,2;4,4","0,0;0,2;2,4;4,4;6,0;6,2","0,2;0,4;2,0;2,6;4,0;4,6"},
  {"0,2;0,4;1,0","0,0;2,0;4,1","2,4;3,0;3,2","0,2;2,3;4,3"},
  {"2,0","0,2","0,0","0,0"},
  {"0,0;0,2;0,4","0,0;2,0;4,0","2,0;2,2;2,4","0,2;2,2;4,2"},
  {"2,0","0,2","0,0","0,0"},
  {"0,0;0,3;0,6;4,0;4,3;4,6","0,0;0,4;3,0;3,4;6,0;6,4","0,0;0,3;0,6;4,0;4,3;4,6","0,0;0,4;3,0;3,4;6,0;6,4"},
  {"0,0;0,2;3,0;3,2","0,0;0,3;2,0;2,3","0,0;0,2;3,0;3,2","0,0;0,3;2,0;2,3"},
  {"0,0;1,3;2,5","0,2;2,1;5,0","1,0;2,2;3,5","0,3;3,2;5,1"},
  {"0,0;0,3;1,5;5,5;6,0;6,3","0,1;0,5;2,0;2,6;5,0;5,6","0,2;0,5;1,0;5,0;6,2;6,5","0,0;0,6;3,0;3,6;5,1;5,5"}
};
static int fossilGhast(const StructureVariant *sv, int x, int y, int z, int *gx, int *gz, int *mnx, int *mnz) {
    int cx_, cz_, w, d;
    switch (sv->rotation) {
    case 0: cx_ = x + sv->sx - 1; cz_ = z + sv->sz - 1; break;
    case 1: cx_ = x - (sv->sz - 1); cz_ = z + sv->sx - 1; break;
    case 2: cx_ = x - (sv->sx - 1); cz_ = z - (sv->sz - 1); break;
    default: cx_ = x + sv->sz - 1; cz_ = z - (sv->sx - 1); break;
    }
    *mnx = x < cx_ ? x : cx_; *mnz = z < cz_ ? z : cz_;
    w = (sv->rotation & 1) ? sv->sz : sv->sx; d = (sv->rotation & 1) ? sv->sx : sv->sz;
    int c0 = *mnx + w / 2, c1 = y + sv->sy / 2, c2 = *mnz + d / 2;
    uint64_t rnd; setSeed(&rnd, G.seed); rnd = nextLong(&rnd); rnd = jAtPos(rnd, c0, c1, c2);
    if (nextFloat(&rnd) >= 0.5F) return 0;
    *gx = *mnx + nextInt(&rnd, w); *gz = *mnz + nextInt(&rnd, d);
    if (sv->start < 0 || sv->start > 13) return 1;
    const char *b = FOSSIL_BONES[sv->start][sv->rotation & 3];
    int rx = *gx - *mnx, rz = *gz - *mnz;
    while (*b) {
        int bx = 0, bz = 0;
        while (*b >= '0' && *b <= '9') bx = bx * 10 + (*b++ - '0');
        if (*b == ',') b++;
        while (*b >= '0' && *b <= '9') bz = bz * 10 + (*b++ - '0');
        if (bx == rx && bz == rz) return 0;
        if (*b == ';') b++; else break;
    }
    return 1;
}
int subtypeFlag(int st, int x, int z);
int structs_rect(int st, int x0, int z0, int x1, int z1, int max) {
    rcnt = 0; rmax = max > 4096 ? 4096 : max; rx0_ = x0; rz0_ = z0; rx1_ = x1; rz1_ = z1;
    switch (st) {
    case Mineshaft: doMineshafts(0); return rcnt;
    case 100: doMineshafts(1); return rcnt;        /* cave spider spawners */
    case 101: doStrongholdSpawners(); return rcnt; /* silverfish spawner (portal room) */
    case 102: doFortress(1); return rcnt;          /* blaze spawners */
    case Fortress: doFortress(0); return rcnt;
    case End_City: doEndCity(0); return rcnt;
    case 121: doEndCity(1); return rcnt;           /* end city with ship */
    case 204: doCanyons(); return rcnt;            /* canyons */
    }
    if (st == Stronghold) {
        StrongholdIter sh; initFirstStronghold(&sh, G.mc, G.seed);
        for (int i = 0; i < 128 && rcnt < rmax; i++) {
            int more = nextStronghold(&sh, &G);
            emit(sh.pos.x, NOY, sh.pos.z, 0);
            if (!more) break;
        }
        return rcnt;
    }
    StructureConfig sc;
    if (!getStructureConfig(st, G.mc, &sc)) return 0;
    int rs = sc.regionSize * 16;
    int a0 = floorDiv(x0, rs), a1 = floorDiv(x1, rs), b0 = floorDiv(z0, rs), b1 = floorDiv(z1, rs);
    if ((long long)(a1 - a0 + 1) * (b1 - b0 + 1) > 40000) return -1;
    for (int rx = a0; rx <= a1; rx++)
        for (int rz = b0; rz <= b1 && rcnt < rmax; rz++) {
            Pos p;
            if (!getStructurePos(st, G.mc, G.seed, rx, rz, &p)) continue;
            if (p.x < x0 || p.x > x1 || p.z < z0 || p.z > z1) continue;
            if (!viableAt(st, p.x, p.z)) continue;
            int y = NOY, flag = 0;
            if (st == End_Gateway) y = surfaceY(p.x, p.z);
            if (st == Bastion) { StructureVariant sv; getVariant(&sv, Bastion, G.mc, G.seed, p.x, p.z, -1); flag = sv.start; } /* 0 주거 1 호글린 2 보물 3 다리 */
            if (st == Village || st == Igloo || st == Shipwreck) flag = subtypeFlag(st, p.x, p.z);
            if (st == Ruined_Portal || st == Ruined_Portal_N) {
                /* 종류: 하위 4비트 환경(0 보통 1 사막 2 정글 3 늪 4 산 5 바다 6 네더), 16 땅속, 32 거대, 8비트부터 모양 번호 */
                int bid = st == Ruined_Portal_N ? nether_wastes : getBiomeAt(&G, 4, p.x >> 2, surfaceY(p.x, p.z) >> 2, p.z >> 2);
                StructureVariant sv; getVariant(&sv, st, G.mc, G.seed, p.x, p.z, bid);
                int env = sv.biome == desert ? 1 : sv.biome == jungle ? 2 : sv.biome == swamp ? 3 : sv.biome == mountains ? 4 : sv.biome == ocean ? 5 : st == Ruined_Portal_N ? 6 : 0;
                flag = env | (sv.underground ? 16 : 0) | (sv.giant ? 32 : 0) | (sv.start << 8);
            }
            if (st == Nether_Fossil) {
                /* 놓을 자리(빈 공간 위 바닥)가 실제로 있는지 지형으로 확인하고, 마른 가스트가 붙는지도 계산 */
                static BlendedNoise nbn; static uint64_t nbnSeed = 0; static int nbnInit = 0;
                if (!nbnInit || nbnSeed != G.seed) { initBlendedNoise(&nbn, G.seed, DIM_NETHER); nbnSeed = G.seed; nbnInit = 1; }
                StructureVariant sv; getVariant(&sv, Nether_Fossil, G.mc, G.seed, p.x, p.z, -1);
                if (!isViableNetherFossilTerrain(p.x >> 4, p.z >> 4, &sv, &nbn, G.mc)) continue;
                int gx, gz, mnx, mnz;
                flag = fossilGhast(&sv, p.x + sv.x, sv.y, p.z + sv.z, &gx, &gz, &mnx, &mnz);
                if (flag) flag |= ((gx - mnx) << 4) | ((gz - mnz) << 8);
                emit(mnx, sv.y, mnz, flag);
                continue;
            }
            emit(p.x, y, p.z, flag);
        }
    return rcnt;
}

/* biome area for the map */
static int *areaCache = 0; static long areaCap = 0;
static int *endBuf = 0;
static int *gen_end(int scale, int x, int z, int sx, int sz) {
    /* 엔드: 칸마다 지형 밀도를 직접 봐서 섬이 있는 곳만 바이옴 색, 나머지는 허공(-2) */
    static SurfaceNoise esn; static uint64_t esnSeed = 0; static int esnInit = 0;
    if (!esnInit || esnSeed != G.seed) { initSurfaceNoise(&esn, DIM_END, G.seed); esnSeed = G.seed; esnInit = 1; }
    if (!endBuf) endBuf = (int*)malloc(64 * 64 * sizeof(int));
    double col[17];
    for (int j = 0; j < sz && j < 64; j++) for (int i = 0; i < sx && i < 64; i++) {
        int bx = (x + i) * scale + scale / 2, bz = (z + j) * scale + scale / 2;
        sampleNoiseColumnEnd(col, &esn, &G.en, bx >> 3, bz >> 3, 2, 18);
        int land = 0; for (int k = 0; k < 17; k++) if (col[k] > 0) { land = 1; break; }
        endBuf[j * sx + i] = land ? getBiomeAt(&G, 16, bx >> 4, 0, bz >> 4) : -2;
    }
    return endBuf;
}
int *gen_area(int scale, int x, int z, int sx, int sz, int y) {
    if (curDim == DIM_END) return gen_end(scale, x, z, sx, sz);
    Range r = {scale, x, z, sx, sz, y, 1};
    size_t need = getMinCacheSize(&G, scale, sx, 1, sz);
    if ((long)need > areaCap) { free(areaCache); areaCache = (int*)malloc(need * sizeof(int)); areaCap = (long)need; }
    if (!areaCache) return 0;
    if (genBiomes(&G, areaCache, r)) return 0;
    return areaCache;
}
int spawn_xz(void) { Pos p = getSpawn(&G); outBuf[80] = p.x; outBuf[81] = p.z; return 1; }

int test_seed(uint32_t lo, uint32_t hi, int mc, int n, int R, int step, int cx, int cz, int useSpawn, int fast, int ns) {
    set_seed(lo, hi, mc);
    if (useSpawn) { Pos sp = estimateSpawn(&G, 0); cx = sp.x; cz = sp.z; }
    for (int k = 0; k < ns; k++) { int ox, oz; if (nearestStruct(sidsBuf[k], R, cx, cz, &ox, &oz, 1) < 0) return 0; }
    if (n == 0) return 1;
    if (fast && !prefilter(mc, n, R, step * 2, cx, cz, fast)) return 0;
    prepY(n);
    int found = 0, all = (1 << n) - 1;
    long long R2 = (long long)R * R;
    for (int pass = 0; pass < 2 && found != all; pass++) {
        int st = pass == 0 ? step * 2 : step;
        for (int x = -R; x <= R && found != all; x += st)
            for (int z = -R; z <= R; z += st) {
                if (pass == 1 && ((x + R) % (2*step) == 0) && ((z + R) % (2*step) == 0)) continue;
                if ((long long)x*x + (long long)z*z > R2) continue;
                int bs[4] = {-9,-9,-9,-9};
                for (int i = 0; i < n; i++) {
                    if (found >> i & 1) continue;
                    int k = yIdx[i];
                    if (bs[k] == -9) bs[k] = getBiomeAt(&G, 4, (cx + x) >> 2, yList[k] >> 2, (cz + z) >> 2);
                    if (matchB(idsBuf[i], bs[k])) found |= 1 << i;
                }
                if (found == all) break;
            }
    }
    return found == all;
}

void nearest(int n, int R, int step, int cx, int cz, int useSpawn, int ns) {
    prepY(n);
    if (useSpawn) { Pos sp = getSpawn(&G); cx = sp.x; cz = sp.z; }
    outBuf[80] = cx; outBuf[81] = cz;
    long long best[16];
    for (int i = 0; i < n; i++) { best[i] = -1; outBuf[i*3] = outBuf[i*3+1] = 0; outBuf[i*3+2] = -1; }
    long long R2 = (long long)R * R;
    for (int x = -R; x <= R; x += step)
        for (int z = -R; z <= R; z += step) {
            long long d2 = (long long)x*x + (long long)z*z;
            if (d2 > R2) continue;
            int bs[4] = {-9,-9,-9,-9};
            for (int i = 0; i < n; i++) {
                if (best[i] >= 0 && d2 >= best[i]) continue;
                int k = yIdx[i];
                if (bs[k] == -9) bs[k] = getBiomeAt(&G, 4, (cx + x) >> 2, yList[k] >> 2, (cz + z) >> 2);
                if (matchB(idsBuf[i], bs[k])) { best[i] = d2; outBuf[i*3] = cx + x; outBuf[i*3+1] = cz + z; }
            }
        }
    for (int i = 0; i < n; i++) {
        long long d = best[i]; int r = 0;
        if (d >= 0) { while ((long long)(r+1)*(r+1) <= d) r++; }
        outBuf[i*3+2] = d < 0 ? -1 : r;
    }
    for (int k = 0; k < ns; k++) {
        int ox = 0, oz = 0; long long d2 = nearestStruct(sidsBuf[k], R, cx, cz, &ox, &oz, 0);
        outBuf[(n+k)*3] = ox; outBuf[(n+k)*3+1] = oz; outBuf[(n+k)*3+2] = d2 < 0 ? -1 : isqrtll(d2);
    }
}
int biome_at(int x, int z, int y) { return getBiomeAt(&G, 4, x >> 2, y >> 2, z >> 2); }
static int G_MCV = MC_26_3;
int mc_wd(void) { return G_MCV; }
void set_mcv(int v) { G_MCV = v; }
/* 사이트에서 고르는 버전과 기능별 최소 버전 (enum 값을 JS로 넘김) */
int mc_const(int i) {
    static const int T[] = { MC_26_3, MC_1_21_11, MC_1_21_1, MC_1_20_6, MC_1_18_2, MC_1_16_1, MC_1_12_2, MC_1_8_9,   /* 0~7 고를 수 있는 버전 */
        MC_1_18, MC_1_19, MC_1_21_1, MC_1_20, MC_1_16_1, MC_1_17, MC_1_14, MC_1_11 };   /* 8 지형, 9 고대 도시, 10 시련의 방, 11 길의 잔해, 12 보루 잔해, 13 자수정 정동, 14 약탈자 전초기지, 15 삼림 대저택 */
    return i >= 0 && i < (int)(sizeof T / sizeof T[0]) ? T[i] : -1;
}
int height_at(int x, int z) { return surfaceY(x, z); }
/* 엔드 중앙 섬: 흑요석 기둥 10개 (x,z,반지름,꼭대기 높이,철창) + 출구 포털 높이 + 드래곤 처치 관문 20개(순서대로 x,z,연결된 바깥 x,z) */
static int endBuf2[10 * 5 + 1 + 20 * 4 + 20];
int *end_center(void) {
    uint64_t r; setSeed(&r, G.seed); long long l = (long long)(nextLong(&r) & 65535LL);
    int list[10]; for (int i = 0; i < 10; i++) list[i] = i;
    uint64_t r2; setSeed(&r2, (uint64_t)l);
    for (int j = 10; j > 1; j--) { int k = nextInt(&r2, j); int t = list[j - 1]; list[j - 1] = list[k]; list[k] = t; }
    for (int i = 0; i < 10; i++) {
        double a = 2.0 * (-3.141592653589793 + (3.141592653589793 / 10.0) * i);
        int x = (int)floor(42.0 * cos(a)), z = (int)floor(42.0 * sin(a)), k = list[i];
        int *o = &endBuf2[i * 5]; o[0] = x; o[1] = z; o[2] = 2 + k / 3; o[3] = 76 + k * 3; o[4] = (k == 1 || k == 2);
    }
    endBuf2[50] = getEndSurfaceHeight(G.mc, G.seed, 0, 0);
    Pos src[20]; getFixedEndGateways(G.mc, G.seed, src);
    static SurfaceNoise sn; initSurfaceNoise(&sn, DIM_END, G.seed);
    for (int i = 0; i < 20; i++) {
        Pos d = getLinkedGatewayPos(&G.en, &sn, G.seed, src[i]);
        int *o = &endBuf2[51 + i * 4]; o[0] = src[i].x; o[1] = src[i].z; o[2] = d.x; o[3] = d.z;
        /* 바깥 관문 높이: 연결 지점 둘레 16칸 안에서 가장 높은 블록 + 10 (게임 규칙) */
        int top = 0;
        for (int dz = -16; dz <= 16; dz += 2) for (int dx = -16; dx <= 16; dx += 2) { int h = getEndSurfaceHeight(G.mc, G.seed, d.x + dx, d.z + dz); if (h > top) top = h; }
        endBuf2[131 + i] = top > 0 ? top + 10 : -9999;
    }
    return endBuf2;
}
/* 지형 음영용 높이: 1:4 좌표 (x4,z4)부터 step 간격으로 w×h 점의 지표 높이(근사) */
static float hbuf[65 * 65];
float *heights_area(int x4, int z4, int w, int h, int step) {
    if (w * h > 65 * 65) return 0;
    for (int j = 0; j < h; j++) for (int i = 0; i < w; i++)
        mapApproxHeight(&hbuf[j * w + i], NULL, &G, NULL, x4 + i * step, z4 + j * step, 1, 1);
    return hbuf;
}

/* ================= 동굴 (1.18+ 노이즈 동굴) ================= */
#include "../xcub/terrainnoise.h"
#include "../xcub/rng.h"
static TerrainNoise TN; static uint64_t tnSeed = 0; static int tnInit = 0;
int rp_height(int x, int z);
static int tnMc = -1;
static int ccx0, ccz0;   /* 지형 모서리 캐시 위치 (아래에서 정의). 시드·버전이 바뀌면 무효로 */
static void ensureTN(void) {
    if (tnInit && tnSeed == G.seed && tnMc == G.mc) return;
    static int tnSetup = 0;   /* 스플라인 설정은 시드와 무관하고, 두 번 부르면 내부 저장소가 넘쳐서 한 번만 */
    if (!tnSetup) { setupTerrainNoise(&TN, G.mc, 0); tnSetup = 1; }
    else if (tnMc != G.mc) setupGenerator(&TN.g, G.mc, 0);   /* 버전을 바꾸면 바이옴 생성기만 다시 */
    tnMc = G.mc;
    initTerrainNoise(&TN, G.seed, DIM_OVERWORLD);
    tnSeed = G.seed; tnInit = 1; ccx0 = ccz0 = -2000000000;
}
static inline double cvPost(double d) { double c = d * 0.64; if (c < -1) c = -1; if (c > 1) c = 1; return c / 2.0 - c * c * c / 24.0; }
static inline double cvSlide(double in, int y) {
    double a = clampedMap(y, -64 + 384 - 80, -64 + 384 - 64, 1.0, 0.0);
    double b = lerp(a, -0.078125, in);
    double c = clampedMap(y, -64 + 0, -64 + 24, 0.0, 1.0);
    return lerp(c, 0.1171875, b);
}
typedef struct { double depth, factor, jagged; } CellP;
static CellP cellParams(int cx, int cz) {
    CellP p; float np[4];
    sampleNoiseParameters(&TN.g.bn, cx, cz, np);
    p.depth = getSpline(TN.g.bn.sp, np) - 0.50375f;
    p.factor = getSpline(TN.factorSpline, np);
    double j = sampleDoublePerlin(&TN.noises[OTP_JAGGED], cx * 4 * 1500.0, 0, cz * 4 * 1500.0);
    j = j >= 0.0 ? j : j / 2.0;
    p.jagged = j * getSpline(TN.jaggednessSpline, np);
    return p;
}
/* density at a cell corner: *fin = final density (with caves), *terr = terrain without caves */
static void cornerDens(int cx, int cz, int cy, const CellP *p, double *fin, double *terr) {
    int x = cx * 4, z = cz * 4, y = -64 + cy * 8;
    double sr = sampleSpaghettiRoughness(&TN, x, y, z);
    double en = sampleEntrances(&TN, x, y, z, sr);
    double sc = sampleSlopedCheese(&TN, x, y, z, p->depth, p->factor, p->jagged);
    *fin = sampleFinalDensity(&TN, x, y, z, sr, en, sc);
    if (terr) *terr = cvPost(cvSlide(sc, y));
}
/* 블록 단위 계산용: 게임처럼 "보간 후 결합"이 되도록 성분을 따로 돌려줌 (주 밀도, 지형만, 국수 동굴 4성분) */
static void cornerDensFull(int cx, int cz, int cy, const CellP *p, float o[6]) {
    int x = cx * 4, z = cz * 4, y = -64 + cy * 8;
    double sr = sampleSpaghettiRoughness(&TN, x, y, z);
    double en = sampleEntrances(&TN, x, y, z, sr);
    double sc = sampleSlopedCheese(&TN, x, y, z, p->depth, p->factor, p->jagged);
    double a = fmin(sc, 5.0 * en);
    double b = (sc >= -1000000.0 && sc < 1.5625) ? a : sampleUnderground(&TN, x, y, z, sr, en, sc);
    o[0] = cvSlide(b, y); o[1] = cvSlide(sc, y);
    int inY = y >= -60 && y < 321;
    o[2] = inY ? sampleDoublePerlin(&TN.noises[OTP_NOODLE], x, y, z) : -1;
    o[3] = inY ? (float)(-0.05 + (sampleDoublePerlin(&TN.noises[OTP_NOODLE_THICKNESS], x, y, z) + 1.0) / 2.0 * (-0.1 - -0.05)) : 0;
    o[4] = inY ? sampleDoublePerlin(&TN.noises[OTP_NOODLE_RIDGE_A], x * 2.6666666666666665, y * 2.6666666666666665, z * 2.6666666666666665) : 0;
    o[5] = inY ? sampleDoublePerlin(&TN.noises[OTP_NOODLE_RIDGE_B], x * 2.6666666666666665, y * 2.6666666666666665, z * 2.6666666666666665) : 0;
}
static int caveBuf[64 * 64];
void carve_tile_into(uint64_t seed, int mc, int x0, int z0, int size, int sliceY, uint8_t *mask);
#define NOSLICE (-99999)
static uint8_t carve2D[(1024 * 1024) / 8];
static uint8_t carve3D[(256 * 256 * 384) / 8];
static int c3x = 1 << 30, c3z = 1 << 30; static uint64_t c3seed = 0;
static inline void c3set(int x0, int z0, int x, int y, int z) {
    if (x < x0 || x >= x0 + 256 || z < z0 || z >= z0 + 256 || y < -64 || y > 319) return;
    long i = ((long)(y + 64) * 256 + (z - z0)) * 256 + (x - x0); carve3D[i >> 3] |= (uint8_t)(1 << (i & 7));
}
/* 폐광 통로·방도 빈 공간으로 (던전보다 먼저 생기는 구조물). 월드 파일 비교에서 던전을 놓친 원인 1위였음 */
static void stampMineshafts(int x0, int z0) {
    static Pos ms[512];
    int n = getMineshafts(G.mc, G.seed, (x0 >> 4) - 7, (z0 >> 4) - 7, ((x0 + 255) >> 4) + 7, ((z0 + 255) >> 4) + 7, ms, 512); if (n > 512) n = 512;
    for (int k = 0; k < n; k++) {
        int cx = ms[k].x >> 4, cz = ms[k].z >> 4, mesa = 0;
        if (!mineshaftBiome(cx, cz, &mesa)) continue;
        int np = getMineshaftPieces(pieces, 1024, G.mc, G.seed, cx, cz);
        int dy = mineshaftYOffset(np, mesa);
        for (int i = 0; i < np; i++) {
            Piece *p = &pieces[i];
            int ya = p->bb0.y + dy, yb = p->bb1.y + dy;
            if (p->type == MS_ROOM) { ya += 1; if (yb > ya + 2) yb = ya + 2; }
            if (p->bb1.x < x0 || p->bb0.x >= x0 + 256 || p->bb1.z < z0 || p->bb0.z >= z0 + 256) continue;
            if (p->type == MS_CORRIDOR) {
                /* 통로: 3×3 빈 공간이지만 5칸마다 울타리 기둥·판자, 레일 통로는 바닥 가운데 레일 */
                int len = (p->rot == 0 || p->rot == 2) ? p->bb1.z - p->bb0.z : p->bb1.x - p->bb0.x;
                int rails = p->additionalData & 1;
                for (int lz = 0; lz <= len; lz++) for (int lx = 0; lx <= 2; lx++) {
                    int sup = (lz % 5) == 2;
                    int wx = lx, wz = lz; rotPos(p->bb0, p->bb1, &wx, &wz, p->rot);
                    for (int ly = 0; ly <= 2; ly++) {
                        if (sup && (lx != 1 || ly == 2) && !(lx == 1 && ly < 2)) continue;   /* 울타리(양옆 y0~1)·판자(y2) */
                        if (rails && lx == 1 && ly == 0) continue;
                        c3set(x0, z0, wx, p->bb0.y + dy + ly, wz);
                    }
                }
                continue;
            }
            for (int x = p->bb0.x; x <= p->bb1.x; x++) for (int z = p->bb0.z; z <= p->bb1.z; z++) for (int y = ya; y <= yb; y++) c3set(x0, z0, x, y, z);
        }
    }
}
static void ensureCarve3D(int x0, int z0) {
    if (c3x == x0 && c3z == z0 && c3seed == G.seed) return;
    carve_tile_into(G.seed, G.mc, x0, z0, 256, NOSLICE, carve3D);
    stampMineshafts(x0, z0);
    c3x = x0; c3z = z0; c3seed = G.seed;
}
static inline int carved3(int x, int y, int z) {
    long i = ((long)(y + 64) * 256 + (z - c3z)) * 256 + (x - c3x);
    return (carve3D[i >> 3] >> (i & 7)) & 1;
}
static inline int carved2(int x, int z, int x0, int z0, int size) {
    long i = (long)(z - z0) * size + (x - x0);
    return (carve2D[i >> 3] >> (i & 7)) & 1;
}
int *cave_ptr(void) { return caveBuf; }
/* 단면: 칸마다 0 = 돌, 1 = 동굴 빈 공간, 2 = 지표 위(하늘/바다). step = 칸 간격(4블록 단위 셀 수) */
int cave_slice(int cx0, int cz0, int w, int h, int step, int y) { if (G.mc < MC_1_18) { return 0; }  /* 1.18 전 지형은 이 계산이 없음 */
    ensureTN();
    if (y < -64) y = -64; if (y > 319) y = 319;
    int x0b = cx0 * 4, z0b = cz0 * 4, size = w * step * 4, carveOn = size <= 1024 && w == h;
    ensureAQ(); aqReset();
    if (carveOn) carve_tile_into(G.seed, G.mc, x0b, z0b, size, y, carve2D);
    int cy = (y + 64) / 8; double t = ((y + 64) - cy * 8) / 8.0;
    for (int j = 0; j < h; j++) for (int i = 0; i < w; i++) {
        int cx = cx0 + i * step, cz = cz0 + j * step;
        CellP p = cellParams(cx, cz);
        double f0, t0, f1 = 0, t1 = 0;
        cornerDens(cx, cz, cy, &p, &f0, &t0);
        if (t > 0) cornerDens(cx, cz, cy + 1, &p, &f1, &t1); else { f1 = f0; t1 = t0; }
        double f = f0 + (f1 - f0) * t, tr = t0 + (t1 - t0) * t;
        int code = f > 0 ? 0 : (tr > 0 ? 1 : 2);
        if (code == 0 && carveOn) {
            /* 카버 동굴·협곡: 칸 안의 몇 지점이 파였는지 */
            int bx = cx * 4, bz = cz * 4, span = step * 4, hit = 0, tot = 0, d = span >= 8 ? span / 4 : 1;
            for (int zz = d / 2; zz < span; zz += d) for (int xx = d / 2; xx < span; xx += d) { tot++; hit += carved2(bx + xx, bz + zz, x0b, z0b, size); }
            if (hit * 4 >= tot) code = 3;
        }
        if (code == 1 || code == 3) {
            /* 대수층: 물이나 용암이 찼는지 */
            int a = y <= -56 && code == 3 ? 2 : aquiferSubstance(cx * 4 + 2, y, cz * 4 + 2, code == 3 ? 0.0 : f);
            code = a < 0 ? 0 : a == 1 ? 5 : a == 2 ? 4 : code;
        }
        caveBuf[j * w + i] = code;
    }
    return 1;
}
/* 동굴 입구: 동굴 없이 계산한 지표와 실제 지표의 차이(블록). 0이면 입구 아님. 결과는 caveBuf에 (깊이<<16)|(실제 지표+64) */
static int topY(int cx, int cz, const CellP *p, int from, int to, int useTerr) {
    double prev = 0; int first = 1; double fin, terr;
    for (int cy = from; cy >= to; cy--) {
        cornerDens(cx, cz, cy, p, &fin, &terr);
        double d = useTerr ? terr : fin;
        if (d > 0) {
            if (first) return -64 + cy * 8;
            double tt = prev / (prev - d); /* 위 코너(prev<=0)에서 아래 코너(d>0) 사이 0이 되는 곳 */
            return -64 + cy * 8 + (int)((1 - tt) * 8);
        }
        prev = d; first = 0;
    }
    return -9999;
}
int cave_entrances(int cx0, int cz0, int w, int h, int step) { if (G.mc < MC_1_18) { return 0; }  /* 1.18 전 지형은 이 계산이 없음 */
    ensureTN();
    int carveOn = step == 1 && w == 64 && h == 64;
    if (carveOn) ensureCarve3D(cx0 * 4, cz0 * 4);
    for (int j = 0; j < h; j++) for (int i = 0; i < w; i++) {
        int cx = cx0 + i * step, cz = cz0 + j * step;
        int pre = samplePreliminarySurfaceLevel(&TN, cx * 4, cz * 4);
        caveBuf[j * w + i] = 0;
        if (pre < 40) continue; /* 깊은 바다 밑은 제외 */
        CellP p = cellParams(cx, cz);
        int from = (pre + 64) / 8 + 5; if (from > 47) from = 47;
        int ter = topY(cx, cz, &p, from, (pre + 64) / 8 - 2, 1);
        if (ter < 63) continue; /* 해수면 아래는 물이 차 있으니 입구로 안 봄 */
        int act = topY(cx, cz, &p, (ter + 64) / 8 + 1, (ter + 64) / 8 - 12, 0);
        if (act == -9999) act = ter - 96;
        if (carveOn) {
            /* 지표에서 아래로 내려가며, 노이즈 동굴이든 카버든 비어 있는 동안 계속 */
            int bx = cx * 4, bz = cz * 4, yy = ter - 1;
            while (yy > ter - 100 && yy > -60) {
                int air = yy > act;
                if (!air) { int c = 0; c += carved3(bx + 1, yy, bz + 1); c += carved3(bx + 2, yy, bz + 2); c += carved3(bx + 3, yy, bz + 1); c += carved3(bx + 1, yy, bz + 3); air = c >= 2; }
                if (!air) break;
                yy--;
            }
            if (ter - yy > ter - act) act = yy;
        }
        int dep = ter - act;
        if (dep >= 8) caveBuf[j * w + i] = (dep << 16) | (act + 64);
    }
    return 1;
}

/* ================= 던전 · 용암 호수 (가능성 판정) =================
 * 타일(256칸) 하나에 대해 지형을 블록 단위로 근사: 노이즈 밀도(셀 꼭짓점 보간) + 카버. 물/용암 대수층은 단순화. */
static int fdiv(int a, int b) { return a >= 0 ? a / b : -((-a + b - 1) / b); }
#define CW 66
#define CH 49
static float cVal[CW * CW * CH][6];
static uint8_t cHas[CW * CW * CH];
static CellP cPar[CW * CW]; static uint8_t cParHas[CW * CW];
static int ccx0, ccz0;
static void cornerReset(int cx0, int cz0) { ensureAQ(); aqReset(); ccx0 = cx0 - 1; ccz0 = cz0 - 1; memset(cHas, 0, sizeof cHas); memset(cParHas, 0, sizeof cParHas); }
static const float *corner(int cx, int cy, int cz) {
    static float tmp[6];
    int i = cx - ccx0, k = cz - ccz0;
    if (cy < 0) cy = 0; if (cy > 48) cy = 48;
    if (i < 0 || k < 0 || i >= CW || k >= CW) { CellP p = cellParams(cx, cz); cornerDensFull(cx, cz, cy, &p, tmp); return tmp; }
    int pi = k * CW + i, idx = pi * CH + cy;
    if (!cHas[idx]) {
        if (!cParHas[pi]) { cPar[pi] = cellParams(cx, cz); cParHas[pi] = 1; }
        cornerDensFull(cx, cz, cy, &cPar[pi], cVal[idx]); cHas[idx] = 1;
    }
    return cVal[idx];
}

/* ================= 대수층 (동굴에 물·용암 채우기, NoiseBasedAquifer) ================= */
static DoublePerlinNoise AQ_barrier, AQ_flood, AQ_spread, AQ_lava;
static PerlinNoise AQ_oct[8];
static uint64_t AQ_posLo, AQ_posHi, aqSeed = 0; static int aqInit = 0;
static void ensureAQ(void) {
    if (aqInit && aqSeed == G.seed) return;
    Xoroshiro wsx; xSetSeed(&wsx, G.seed);
    uint64_t lo = xNextLong(&wsx), hi = xNextLong(&wsx);
    static const double amp1[1] = {1.0};
    Xoroshiro x;
    x = (Xoroshiro){lo ^ 0xe170fda6c51d093fULL, hi ^ 0x134f3e4bc3f40b0cULL}; xDoublePerlinInit(&AQ_barrier, &x, AQ_oct + 0, amp1, -3, 1, -1);
    x = (Xoroshiro){lo ^ 0x1b5d4f85fdc2d89eULL, hi ^ 0x22c7e3e611bf67c6ULL}; xDoublePerlinInit(&AQ_flood, &x, AQ_oct + 2, amp1, -7, 1, -1);
    x = (Xoroshiro){lo ^ 0x08f136f47cd9aaa2ULL, hi ^ 0x3666182f5fa0ac6fULL}; xDoublePerlinInit(&AQ_spread, &x, AQ_oct + 4, amp1, -5, 1, -1);
    x = (Xoroshiro){lo ^ 0x0e5121277ab51b72ULL, hi ^ 0x2724d8c56aa005baULL}; xDoublePerlinInit(&AQ_lava, &x, AQ_oct + 6, amp1, -1, 1, -1);
    x = (Xoroshiro){lo ^ 0x7bb15cc403c6ace6ULL, hi ^ 0x0bdd56bc9d232691ULL};
    AQ_posLo = xNextLong(&x); AQ_posHi = xNextLong(&x);
    aqSeed = G.seed; aqInit = 1;
}
static inline int64_t mthSeed(int x, int y, int z) {
    int64_t l = (int64_t)(x * 3129871) ^ ((int64_t)z * 116129781LL) ^ (int64_t)y;
    l = l * l * 42317861LL + l * 11LL;
    return l >> 16;
}
enum { F_AIR = 0, F_WATER = 1, F_LAVA = 2 };
typedef struct { int level, type; } FStat;
#define WAY_BELOW (-32768)
static inline FStat globalFluid(int y) { FStat f; if (y < -54) { f.level = -54; f.type = F_LAVA; } else { f.level = 63; f.type = F_WATER; } return f; }
static inline int fAt(FStat f, int y) { return y < f.level ? f.type : F_AIR; }
/* 미리 계산한 지표 높이: 4칸 단위로 캐시 */
#define PSN 4096
static int psKey[PSN * 2], psVal[PSN]; static uint8_t psHas[PSN];
static int prelimSurf(int x, int z) {
    int qx = x >> 2, qz = z >> 2; unsigned h = ((unsigned)qx * 73856093u ^ (unsigned)qz * 19349663u) & (PSN - 1);
    for (int t = 0; t < 8; t++) { unsigned k = (h + t) & (PSN - 1);
        if (psHas[k] && psKey[k * 2] == qx && psKey[k * 2 + 1] == qz) return psVal[k];
        if (!psHas[k]) { psHas[k] = 1; psKey[k * 2] = qx; psKey[k * 2 + 1] = qz; return psVal[k] = samplePreliminarySurfaceLevel(&TN, qx << 2, qz << 2); } }
    return samplePreliminarySurfaceLevel(&TN, qx << 2, qz << 2);
}
static int isDeepDark(int x, int y, int z) {
    int64_t np[6]; sampleBiomeNoise(&G.bn, np, x >> 2, y >> 2, z >> 2, NULL, SAMPLE_NO_BIOME);
    return np[3] < -2250 && np[4] > 9000;
}
static FStat computeFluid(int x, int y, int z) {
    static const int OFF[13][2] = {{0,0},{-2,-1},{-1,-1},{0,-1},{1,-1},{-3,0},{-2,0},{-1,0},{1,0},{-2,1},{-1,1},{0,1},{1,1}};
    FStat glob = globalFluid(y);
    int minS = 1 << 30, j = y + 12, k = y - 12, flag = 0;
    for (int o = 0; o < 13; o++) {
        int l = x + OFF[o][0] * 16, i1 = z + OFF[o][1] * 16;
        int j1 = prelimSurf(l, i1), k1 = j1 + 8;
        int center = OFF[o][0] == 0 && OFF[o][1] == 0;
        if (center && k > k1) return glob;
        int above = j > k1;
        if (above || center) {
            FStat fs = globalFluid(k1);
            if (fAt(fs, k1) != F_AIR) { if (center) flag = 1; if (above) return fs; }
        }
        if (j1 < minS) minS = j1;
    }
    /* 지표 높이(유체 면) */
    int level;
    double d0, d1;
    if (isDeepDark(x, y, z)) { d0 = -1; d1 = -1; }
    else {
        int i = minS + 8 - y;
        double d2 = flag ? clampedMap(i, 0.0, 64.0, 1.0, 0.0) : 0.0;
        double d3 = sampleDoublePerlin(&AQ_flood, x, y * 0.67, z); if (d3 < -1) d3 = -1; if (d3 > 1) d3 = 1;
        double d4 = -0.3 + (d2 - 1.0) / (0.0 - 1.0) * (0.8 - -0.3);   /* map(d2, 1,0, -0.3,0.8) */
        double d5 = -0.8 + (d2 - 1.0) / (0.0 - 1.0) * (0.4 - -0.8);   /* map(d2, 1,0, -0.8,0.4) */
        d0 = d3 - d5; d1 = d3 - d4;
    }
    if (d1 > 0) level = glob.level;
    else if (d0 > 0) {
        int kx = fdiv(x, 16), ly = fdiv(y, 40), iz = fdiv(z, 16);
        int j1 = ly * 40 + 20;
        double sp = sampleDoublePerlin(&AQ_spread, kx, ly * 0.7142857142857143, iz) * 10.0;
        int l1 = (int)floor(sp / 3.0) * 3;
        int i2 = j1 + l1; level = minS < i2 ? minS : i2;
    } else level = WAY_BELOW;
    /* 종류: 낮은 곳은 용암일 수도 */
    int type = glob.type;
    if (level <= -10 && level != WAY_BELOW && glob.type != F_LAVA) {
        double lv = sampleDoublePerlin(&AQ_lava, fdiv(x, 64), fdiv(y, 40), fdiv(z, 64));
        if (fabs(lv) > 0.3) type = F_LAVA;
    }
    FStat f = { level, type }; return f;
}
/* 격자 중심 위치·유체 상태 캐시 */
#define AQN 8192
static int aqKey[AQN * 3]; static int aqPos[AQN * 3]; static FStat aqStat[AQN]; static uint8_t aqHas[AQN];
static int aqCell(int gx, int gy, int gz) {
    unsigned h = ((unsigned)gx * 73856093u ^ (unsigned)gy * 19349663u ^ (unsigned)gz * 83492791u) & (AQN - 1);
    for (int t = 0; t < 16; t++) { unsigned k = (h + t) & (AQN - 1);
        if (aqHas[k] && aqKey[k*3] == gx && aqKey[k*3+1] == gy && aqKey[k*3+2] == gz) return (int)k;
        if (!aqHas[k]) {
            Xoroshiro r = { (uint64_t)mthSeed(gx, gy, gz) ^ AQ_posLo, AQ_posHi };
            int px = gx * 16 + xNextInt(&r, 10), py = gy * 12 + xNextInt(&r, 9), pz = gz * 16 + xNextInt(&r, 10);
            aqHas[k] = 1; aqKey[k*3] = gx; aqKey[k*3+1] = gy; aqKey[k*3+2] = gz;
            aqPos[k*3] = px; aqPos[k*3+1] = py; aqPos[k*3+2] = pz;
            aqStat[k] = computeFluid(px, py, pz);
            return (int)k;
        } }
    memset(aqHas, 0, sizeof aqHas); return aqCell(gx, gy, gz);
}
static void aqReset(void) { memset(aqHas, 0, sizeof aqHas); memset(psHas, 0, sizeof psHas); }
static inline double simil(int a, int b) { return 1.0 - (double)abs(b - a) / 25.0; }
static double pressure(int x, int y, int z, double *bar, FStat a, FStat b) {
    int sa = fAt(a, y), sb = fAt(b, y);
    if ((sa == F_LAVA && sb == F_WATER) || (sa == F_WATER && sb == F_LAVA)) return 2.0;
    int j = abs(a.level - b.level);
    if (j == 0) return 0.0;
    double d0 = 0.5 * (a.level + b.level), d1 = y + 0.5 - d0, d2 = j / 2.0, d9 = d2 - fabs(d1), d10;
    if (d1 > 0) { double d11 = d9; d10 = d11 > 0 ? d11 / 1.5 : d11 / 2.5; }
    else { double d15 = 3.0 + d9; d10 = d15 > 0 ? d15 / 3.0 : d15 / 10.0; }
    double d16;
    if (!(d10 < -2.0) && !(d10 > 2.0)) { if (isnan(*bar)) *bar = sampleDoublePerlin(&AQ_barrier, x, y * 0.5, z); d16 = *bar; }
    else d16 = 0.0;
    return 2.0 * (d16 + d10);
}
/* density <= 0 인 칸이 실제로 무엇이 되는지: -1 돌(막힘), 0 공기, 1 물, 2 용암 */
static int aquiferSubstance(int x, int y, int z, double density) {
    if (density > 0) return -1;
    FStat g = globalFluid(y);
    if (fAt(g, y) == F_LAVA) return F_LAVA;
    int l = fdiv(x - 5, 16), i1 = fdiv(y + 1, 12), j1 = fdiv(z - 5, 16);
    int k1 = 1 << 30, l1 = 1 << 30, i2 = 1 << 30, c1 = -1, c2 = -1, c3 = -1;
    for (int a = 0; a <= 1; a++) for (int b = -1; b <= 1; b++) for (int c = 0; c <= 1; c++) {
        int k = aqCell(l + a, i1 + b, j1 + c);
        int dx = aqPos[k*3] - x, dy = aqPos[k*3+1] - y, dz = aqPos[k*3+2] - z, d = dx*dx + dy*dy + dz*dz;
        if (k1 >= d) { c3 = c2; i2 = l1; c2 = c1; l1 = k1; c1 = k; k1 = d; }
        else if (l1 >= d) { c3 = c2; i2 = l1; c2 = k; l1 = d; }
        else if (i2 >= d) { c3 = k; i2 = d; }
    }
    FStat f1 = aqStat[c1];
    double s1 = simil(k1, l1);
    int st = fAt(f1, y);
    if (s1 <= 0) return st;
    if (st == F_WATER && fAt(globalFluid(y - 1), y - 1) == F_LAVA) return st;
    double bar = NAN;
    FStat f2 = aqStat[c2];
    if (density + s1 * pressure(x, y, z, &bar, f1, f2) > 0) return -1;
    FStat f3 = aqStat[c3];
    double s0 = simil(k1, i2);
    if (s0 > 0 && density + s1 * s0 * pressure(x, y, z, &bar, f1, f3) > 0) return -1;
    double s4 = simil(l1, i2);
    if (s4 > 0 && density + s1 * s4 * pressure(x, y, z, &bar, f2, f3) > 0) return -1;
    return st;
}
static int AQUIFER_ON = 1;
void set_aquifer(int v) { AQUIFER_ON = v; }
enum { B_SOLID, B_AIR, B_WATER, B_LAVA };
/* 비어디파이어: 구조물이 주변 땅을 파내거나(beard) 채우는(bury/encapsulate) 밀도 보정. 최종 밀도에 더해짐 */
typedef struct { int x0, y0, z0, x1, y1, z1, gld, type; } BRig;   /* type 1 bury 2 beard_thin 3 beard_box 4 encapsulate */
static BRig BR[4096]; static int BRn = 0, BJ[8192][3], BJn = 0, bActive = 0, bType = 0;
static float BK[24 * 24 * 24]; static int bkInit = 0;
static int bLr[4096], bLrn, bLj[8192], bLjn, bLcx = 1 << 30, bLcz = 1 << 30;
void beard_set(const int *rig, int nr, const int *jn, int nj, int jtype) {
    if (!bkInit) { for (int i = 0; i < 24; i++) for (int j = 0; j < 24; j++) for (int k = 0; k < 24; k++) { double x = j - 12, y = k - 12 + 0.5, z = i - 12; BK[i * 576 + j * 24 + k] = (float)exp(-(x * x + y * y + z * z) / 16.0); } bkInit = 1; }
    BRn = nr > 4096 ? 4096 : nr; for (int i = 0; i < BRn; i++) memcpy(&BR[i], rig + i * 8, sizeof(BRig));
    BJn = nj > 8192 ? 8192 : nj; for (int i = 0; i < BJn; i++) { BJ[i][0] = jn[i * 3]; BJ[i][1] = jn[i * 3 + 1]; BJ[i][2] = jn[i * 3 + 2]; }
    bActive = BRn + BJn > 0; bType = jtype; bLcx = 1 << 30;
}
static double beardK(int x, int y, int z, int yg) {
    int i = x + 12, j = y + 12, k = z + 12;
    if (i < 0 || i >= 24 || j < 0 || j >= 24 || k < 0 || k >= 24) return 0;
    double d0 = yg + 0.5, d1 = (double)x * x + d0 * d0 + (double)z * z;
    double d2 = -d0 / sqrt(d1 / 2.0) / 2.0;
    return d2 * BK[k * 576 + i * 24 + j];
}
static double buryK(double x, double y, double z) { double d = sqrt(x * x + y * y + z * z); return d >= 6 ? 0 : 1 - d / 6.0; }
static double beardAt(int x, int y, int z) {
    int cx = fdiv(x, 16), cz = fdiv(z, 16);
    if (cx != bLcx || cz != bLcz) {   /* 청크마다 가까운 조각·연결점만 추림 */
        bLcx = cx; bLcz = cz; bLrn = bLjn = 0; int ax = cx * 16, az = cz * 16;
        for (int i = 0; i < BRn; i++) if (BR[i].x1 >= ax - 12 && BR[i].x0 <= ax + 15 + 12 && BR[i].z1 >= az - 12 && BR[i].z0 <= az + 15 + 12) bLr[bLrn++] = i;
        for (int i = 0; i < BJn; i++) if (BJ[i][0] > ax - 12 && BJ[i][2] > az - 12 && BJ[i][0] < ax + 15 + 12 && BJ[i][2] < az + 15 + 12) bLj[bLjn++] = i;
    }
    double d = 0;
    for (int n = 0; n < bLrn; n++) {
        const BRig *r = &BR[bLr[n]];
        int i1 = x < r->x0 ? r->x0 - x : x > r->x1 ? x - r->x1 : 0, j1 = z < r->z0 ? r->z0 - z : z > r->z1 ? z - r->z1 : 0;
        int k1 = r->y0 + r->gld, l1 = y - k1, i2;
        switch (r->type) {
        case 1: case 2: i2 = l1; break;
        case 3: i2 = k1 - y > y - r->y1 ? k1 - y : y - r->y1; if (i2 < 0) i2 = 0; break;
        case 4: i2 = r->y0 - y > y - r->y1 ? r->y0 - y : y - r->y1; if (i2 < 0) i2 = 0; break;
        default: i2 = 0;
        }
        if (r->type == 1) d += buryK(i1, i2 / 2.0, j1);
        else if (r->type == 2 || r->type == 3) d += beardK(i1, i2, j1, l1) * 0.8;
        else if (r->type == 4) d += buryK(i1 / 2.0, i2 / 2.0, j1 / 2.0) * 0.8;
    }
    for (int n = 0; n < bLjn; n++) { const int *jj = BJ[bLj[n]]; int a = x - jj[0], b = y - jj[1], c = z - jj[2]; d += beardK(a, b, c, b) * 0.4; }
    return d;
}
static int noCarve = 0; static double lastFin;
static int blockAt(int x, int y, int z) {
    if (y < -64) return B_SOLID; if (y > 319) return B_AIR;
    int cx = fdiv(x, 4), cz = fdiv(z, 4), cy = (y + 64) / 8;
    double fx = (x - cx * 4) / 4.0, fy = ((y + 64) - cy * 8) / 8.0, fz = (z - cz * 4) / 4.0;
    const float *c[8];
    for (int n = 0; n < 8; n++) c[n] = corner(cx + (n & 1), cy + ((n >> 1) & 1), cz + (n >> 2));
    double v[6];
    for (int q = 0; q < 6; q++) v[q] = lerp(fz, lerp(fy, lerp(fx, c[0][q], c[1][q]), lerp(fx, c[2][q], c[3][q])), lerp(fy, lerp(fx, c[4][q], c[5][q]), lerp(fx, c[6][q], c[7][q])));
    /* 게임: min(squeeze(0.64 * 보간(주 밀도)), 국수동굴(성분별 보간 후 결합)) */
    double noodle = (v[2] >= -1000000.0 && v[2] < 0.0) ? 64.0 : v[3] + 1.5 * fmax(fabs(v[4]), fabs(v[5]));
    double fin = fmin(cvPost(v[0]), noodle), ter = cvPost(v[1]);
    if (bActive) fin += beardAt(x, y, z);   /* 게임: final_density = min(...) + beardifier */
    lastFin = fin;
    if (fin > 0) {
        if (!noCarve && x >= c3x && x < c3x + 256 && z >= c3z && z < c3z + 256 && carved3(x, y, z)) {
            if (y <= -56) return B_LAVA;                 /* 카버 용암 높이 */
            if (!AQUIFER_ON) return B_AIR;
            int a = aquiferSubstance(x, y, z, 0.0);     /* 카버도 대수층을 따름: 막히면 안 파임 */
            return a < 0 ? B_SOLID : a == 1 ? B_WATER : a == 2 ? B_LAVA : B_AIR;
        }
        return B_SOLID;
    }
    if (!AQUIFER_ON) { if (ter > 0) return y <= -55 ? B_LAVA : B_AIR; return y < 63 ? B_WATER : B_AIR; }
    { int a = aquiferSubstance(x, y, z, fin);
      return a < 0 ? B_SOLID : a == 1 ? B_WATER : a == 2 ? B_LAVA : B_AIR; }
}
static int featBuf[4 * 2048]; static int featN;
static int LAVA_MIN = 3;
void set_lava_min(int v) { LAVA_MIN = v; }
int *feat_ptr(void) { return featBuf; }
static void femit(int x, int y, int z, int flag) { if (featN < 2048) { featBuf[featN * 4] = x; featBuf[featN * 4 + 1] = y; featBuf[featN * 4 + 2] = z; featBuf[featN * 4 + 3] = flag; featN++; } }

/* MonsterRoomFeature 한 번 시도. 성공하면 게임과 같은 순서로 난수를 소비하고 몹 종류(0 스켈레톤, 1·2 좀비, 3 거미)를 돌려줌 */
static int tryDungeon(Xoroshiro *xr, int x, int y, int z, int *openOut) {
    int j = xNextIntJ(xr, 2) + 2, i1 = xNextIntJ(xr, 2) + 2;
    int k = -j - 1, l = j + 1, j1 = -i1 - 1, k1 = i1 + 1, open = 0;
    for (int dx = k; dx <= l; dx++) for (int dy = -1; dy <= 4; dy++) for (int dz = j1; dz <= k1; dz++) {
        int b = blockAt(x + dx, y + dy, z + dz);
        if (dy == -1 && b != B_SOLID) return -1;
        if (dy == 4 && b != B_SOLID) return -1;
        if ((dx == k || dx == l || dz == j1 || dz == k1) && dy == 0 && b == B_AIR && blockAt(x + dx, y + 1, z + dz) == B_AIR) open++;
    }
    if (open < 1 || open > 5) return -1;
    /* 방 만들기: 바닥 줄(y-1)에서 그 아래가 단단하면 이끼 낀 조약돌 여부로 난수 1개 */
    for (int dx = k; dx <= l; dx++) for (int dz = j1; dz <= k1; dz++)
        if (blockAt(x + dx, y - 2, z + dz) == B_SOLID) xNextIntJ(xr, 4);
    /* 상자 2개 × 3번 시도: 벽 하나에만 붙은 빈칸이면 상자 */
    for (int c = 0; c < 2; c++) for (int t = 0; t < 3; t++) {
        int px = x + xNextIntJ(xr, j * 2 + 1) - j, pz = z + xNextIntJ(xr, i1 * 2 + 1) - i1, n = 0;
        int ddx[4] = {1, -1, 0, 0}, ddz[4] = {0, 0, 1, -1};
        for (int d = 0; d < 4; d++) {
            int nx = px + ddx[d], nz = pz + ddz[d];
            int wall = nx - x == k || nx - x == l || nz - z == j1 || nz - z == k1;
            if (wall && blockAt(nx, y, nz) == B_SOLID) n++;
        }
        if (n == 1) { xNextLongJ(xr); break; }
    }
    *openOut = open;
    return xNextIntJ(xr, 4);
}
static int lakeShapeOK(Xoroshiro *xr, int ox, int oy, int oz, int lava) {
    if (oy <= -64 + 4) return 0;
    oy -= 4;
    static uint8_t a[2048]; memset(a, 0, sizeof a);
    int n = xNextIntJ(xr, 4) + 4;
    for (int q = 0; q < n; q++) {
        double d0 = xNextDoubleJ(xr) * 6.0 + 3.0, d1 = xNextDoubleJ(xr) * 4.0 + 2.0, d2 = xNextDoubleJ(xr) * 6.0 + 3.0;
        double d3 = xNextDoubleJ(xr) * (16.0 - d0 - 2.0) + 1.0 + d0 / 2.0;
        double d4 = xNextDoubleJ(xr) * (8.0 - d1 - 4.0) + 2.0 + d1 / 2.0;
        double d5 = xNextDoubleJ(xr) * (16.0 - d2 - 2.0) + 1.0 + d2 / 2.0;
        for (int l = 1; l < 15; l++) for (int i1 = 1; i1 < 15; i1++) for (int j1 = 1; j1 < 7; j1++) {
            double d6 = (l - d3) / (d0 / 2.0), d7 = (j1 - d4) / (d1 / 2.0), d8 = (i1 - d5) / (d2 / 2.0);
            if (d6 * d6 + d7 * d7 + d8 * d8 < 1.0) a[(l * 16 + i1) * 8 + j1] = 1;
        }
    }
    #define A(x, z, y) a[((x) * 16 + (z)) * 8 + (y)]
    for (int k1 = 0; k1 < 16; k1++) for (int k = 0; k < 16; k++) for (int l2 = 0; l2 < 8; l2++) {
        int flag = !A(k1, k, l2) && ((k1 < 15 && A(k1 + 1, k, l2)) || (k1 > 0 && A(k1 - 1, k, l2)) || (k < 15 && A(k1, k + 1, l2)) || (k > 0 && A(k1, k - 1, l2)) || (l2 < 7 && A(k1, k, l2 + 1)) || (l2 > 0 && A(k1, k, l2 - 1)));
        if (!flag) continue;
        int b = blockAt(ox + k1, oy + l2, oz + k);
        if (l2 >= 4 && (b == B_WATER || b == B_LAVA)) return 0;
        if (l2 < 4 && b != B_SOLID && !(lava && b == B_LAVA)) return 0;
    }
    #undef A
    return 1;
}
static int topSolid(int x, int z, int from) { for (int y = from; y > -64; y--) if (blockAt(x, y, z) == B_SOLID) return y; return -64; }
/* 타일(256칸) 안의 던전·용암 호수 후보. 결과 (x,y,z,flag): flag 하위 4비트 = 종류(1 던전, 2 지하 용암 호수, 3 지표 용암 호수), 던전은 (몹<<4)|(구멍 수<<8) */
int features_tile(int tx, int tz) { if (G.mc < MC_1_18) { return 0; }  /* 1.18 전 지형은 이 계산이 없음 */
    ensureTN();
    int x0 = tx * 256, z0 = tz * 256;
    ensureCarve3D(x0, z0);
    cornerReset(x0 / 4, z0 / 4);
    featN = 0;
    for (int cz = z0 >> 4; cz < (z0 >> 4) + 16; cz++) for (int cx = x0 >> 4; cx < (x0 >> 4) + 16; cx++) {
        uint64_t pop = getPopulationSeed(G.mc, G.seed, cx * 16, cz * 16);
        Xoroshiro xr;
        /* 용암 호수 (LAKES 단계: 지하 0번, 지표 1번) */
        xSetSeed(&xr, pop + 10000 + 0);
        if (xNextFloat(&xr) < 1.0f / 9) {
            int x = cx * 16 + xNextIntJ(&xr, 16), z = cz * 16 + xNextIntJ(&xr, 16), y = xNextIntJ(&xr, 320);
            /* environment_scan(아래로 32칸): 공기가 아닌 블록을 만날 때까지 공기 속을 내려감. 시작이 막혀 있으면 그 자리 그대로 */
            int yy = y, found = 0;
            for (int s = 0; s < 32; s++) {
                if (blockAt(x, yy, z) != B_AIR && yy - 5 >= -64) { found = 1; break; }
                yy--; if (yy < -64) break;
                if (blockAt(x, yy, z) != B_AIR) { found = yy - 5 >= -64; break; }
            }
            if (found) {
                int surf = surfaceY(x, z);
                if (yy <= surf - 5 && lakeShapeOK(&xr, x - 8, yy, z - 8, 1)) femit(x, yy, z, 2); /* 호수 모양은 시작점 기준 -8칸부터 16칸 (월드 파일로 확인) */
            }
        }
        xSetSeed(&xr, pop + 10000 + 1);
        if (xNextFloat(&xr) < 1.0f / 200) {
            int x = cx * 16 + xNextIntJ(&xr, 16), z = cz * 16 + xNextIntJ(&xr, 16);
            int top = topSolid(x, z, surfaceY(x, z) + 24);
            int y = top < 62 ? 63 : top + 1;
            if (lakeShapeOK(&xr, x - 8, y, z - 8, 1)) femit(x, y, z, 3);
        }
        /* 던전 (UNDERGROUND_STRUCTURES 단계: 화석 2개 다음 2번, 3번) */
        for (int deep = 0; deep < 2; deep++) {
            xSetSeed(&xr, pop + 30000 + 2 + deep);
            int cnt = deep ? 4 : 10;
            for (int a = 0; a < cnt; a++) {
                int x = cx * 16 + xNextIntJ(&xr, 16), z = cz * 16 + xNextIntJ(&xr, 16);
                int y = deep ? -58 + xNextIntJ(&xr, 58) : xNextIntJ(&xr, 320);
                int open = 0, mob = tryDungeon(&xr, x, y, z, &open);
                if (mob >= 0) femit(x, y, z, 1 | (mob << 4) | (open << 8));
            }
        }
    }
    /* 용암에 잠긴 동굴: Y -56 높이를 8칸 간격으로 훑어, 이어진 동굴 공간마다 표시 하나 */
    {
        static uint8_t g[32 * 32]; static short st[1024];
        for (int j = 0; j < 32; j++) for (int i = 0; i < 32; i++) g[j * 32 + i] = blockAt(x0 + i * 8, -56, z0 + j * 8) == B_LAVA;
        for (int k = 0; k < 1024; k++) {
            if (g[k] != 1) continue;
            int sp = 0, n = 0; long sx = 0, sz = 0; st[sp++] = k; g[k] = 2;
            int mem[1024], mn = 0;
            while (sp) {
                int q = st[--sp]; n++; mem[mn++] = q; sx += q % 32; sz += q / 32;
                int qi = q % 32, qj = q / 32;
                int nb[4] = { qi > 0 ? q - 1 : -1, qi < 31 ? q + 1 : -1, qj > 0 ? q - 32 : -1, qj < 31 ? q + 32 : -1 };
                for (int d = 0; d < 4; d++) if (nb[d] >= 0 && g[nb[d]] == 1) { g[nb[d]] = 2; st[sp++] = nb[d]; }
            }
            if (n < LAVA_MIN) continue;
            double mx = (double)sx / n, mz = (double)sz / n; int best = mem[0]; double bd = 1e9;
            for (int t = 0; t < mn; t++) { double dx = mem[t] % 32 - mx, dz = mem[t] / 32 - mz; if (dx * dx + dz * dz < bd) { bd = dx * dx + dz * dz; best = mem[t]; } }
            femit(x0 + (best % 32) * 8, -56, z0 + (best / 32) * 8, 4 | ((n > 255 ? 255 : n) << 8));
        }
    }
    return featN;
}
/* 디버그: 특정 위치 던전 판정 정보 */
int dbg_dungeon(int x, int y, int z, int j, int i1) {
    ensureTN(); ensureCarve3D(fdiv(x, 256) * 256, fdiv(z, 256) * 256); cornerReset(fdiv(x, 256) * 64, fdiv(z, 256) * 64);
    int k = -j - 1, l = j + 1, j1 = -i1 - 1, k1 = i1 + 1, open = 0, floorBad = 0, ceilBad = 0;
    for (int dx = k; dx <= l; dx++) for (int dy = -1; dy <= 4; dy++) for (int dz = j1; dz <= k1; dz++) {
        int b = blockAt(x + dx, y + dy, z + dz);
        if (dy == -1 && b != B_SOLID) floorBad++;
        if (dy == 4 && b != B_SOLID) ceilBad++;
        if ((dx == k || dx == l || dz == j1 || dz == k1) && dy == 0 && b == B_AIR && blockAt(x + dx, y + 1, z + dz) == B_AIR) open++;
    }
    return open | (floorBad << 8) | (ceilBad << 16);
}
int dbg_block(int x, int y, int z) {
    ensureTN(); int tx = fdiv(x, 256) * 256, tz = fdiv(z, 256) * 256;
    if (c3x != tx || c3z != tz) { ensureCarve3D(tx, tz); cornerReset(tx / 4, tz / 4); }
    else if (ccx0 != tx / 4 - 1 || ccz0 != tz / 4 - 1) cornerReset(tx / 4, tz / 4);
    return blockAt(x, y, z);
}
int ec_dbg(int px, int pz, int oi, int oj, int off) {
    int k = (px & ~15) + off, l = (pz & ~15) + off, h = surfaceY(k, l), t;
    t = surfaceY(k, l + oj); if (t < h) h = t; t = surfaceY(k + oi, l); if (t < h) h = t; t = surfaceY(k + oi, l + oj); if (t < h) h = t;
    return h;
}
/* 슬라임 청크 (자바): 2×2로 붙은 슬라임 청크 묶음 중 (cx,cz)에서 R 안에 가장 가까운 것. 거리 반환, 없으면 -1. 위치는 outBuf[90..91] */
static int isSlimeC(int x, int z) {
    int64_t s = (int64_t)G.seed + (int64_t)(int32_t)((uint32_t)x * (uint32_t)x * 0x4c1906u) + (int64_t)(int32_t)((uint32_t)x * 0x5ac0dbu)
              + (int64_t)(int32_t)((uint32_t)z * (uint32_t)z) * 0x4307a7LL + (int64_t)(int32_t)((uint32_t)z * 0x5f24fu);
    uint64_t r = ((uint64_t)s ^ 0x3ad8025fULL ^ 0x5DEECE66DULL) & ((1ULL << 48) - 1);
    int bits, val;
    do { r = (r * 0x5DEECE66DULL + 0xBULL) & ((1ULL << 48) - 1); bits = (int)(r >> 17); val = bits % 10; } while ((int)((unsigned)bits - (unsigned)val + 9u) < 0);
    return val == 0;
}
int slime_near(int R, int cx, int cz) {
    int c0x = (cx - R) >> 4, c1x = (cx + R) >> 4, c0z = (cz - R) >> 4, c1z = (cz + R) >> 4;
    int w = c1x - c0x + 2, h = c1z - c0z + 2; if (w > 400 || h > 400) return -1;
    static uint8_t sm[402 * 402];
    for (int j = 0; j < h; j++) for (int i = 0; i < w; i++) sm[j * w + i] = isSlimeC(c0x + i, c0z + j);
    long long best = -1; long long R2 = (long long)R * R;
    for (int j = 0; j + 1 < h; j++) for (int i = 0; i + 1 < w; i++) {
        if (!(sm[j*w+i] && sm[j*w+i+1] && sm[(j+1)*w+i] && sm[(j+1)*w+i+1])) continue;
        int x = (c0x + i + 1) * 16, z = (c0z + j + 1) * 16;   /* 네 청크가 만나는 모서리 */
        long long dx = x - cx, dz = z - cz, d2 = dx*dx + dz*dz;
        if (d2 <= R2 && (best < 0 || d2 < best)) { best = d2; outBuf[90] = x; outBuf[91] = z; }
    }
    return best < 0 ? -1 : isqrtll(best);
}
/* 시드 찾기용: 첫 번째 고리(가장 가까운 3개)의 엔드 유적만 보고 R 안에서 가장 가까운 것. spawner면 차원문 방의 좀벌레 스포너 위치 */
int sh_near(int R, int cx, int cz, int spawner) {
    StrongholdIter sh; initFirstStronghold(&sh, G.mc, G.seed);
    long long best = -1, R2 = (long long)R * R;
    for (int i = 0; i < 3; i++) {
        int more = nextStronghold(&sh, &G);
        int x = sh.pos.x, z = sh.pos.z;
        if (spawner) {
            int np = getStrongholdPieces(pieces, 1024, G.mc, G.seed, sh.pos.x >> 4, sh.pos.z >> 4);
            for (int k = 0; k < np; k++) if (pieces[k].type == SH_PORTAL_ROOM) { x = 5; z = 6; rotPos(pieces[k].bb0, pieces[k].bb1, &x, &z, pieces[k].rot); break; }
        }
        long long dx = x - cx, dz = z - cz, d2 = dx*dx + dz*dz;
        if (d2 <= R2 && (best < 0 || d2 < best)) { best = d2; outBuf[90] = x; outBuf[91] = z; }
        if (!more) break;
    }
    return best < 0 ? -1 : isqrtll(best);
}
/* 시드 찾기용: 첫 번째 드래곤 관문의 바깥 출구 (x,z) → outBuf[90..91] */
int end_gate1(void) {
    Pos src[20]; getFixedEndGateways(G.mc, G.seed, src);
    static SurfaceNoise sn; initSurfaceNoise(&sn, DIM_END, G.seed);
    Pos d = getLinkedGatewayPos(&G.en, &sn, G.seed, src[0]);
    outBuf[90] = d.x; outBuf[91] = d.z; return 1;
}
/* ================= 상자 내용물 =================
 * 구조물 (st, x, z)의 상자들을 계산해서 텍스트로 돌려줌. 줄 형식:
 *   C|루트 테이블|상자 x|상자 z
 *   I|아이템 이름|개수|마법부여:레벨,...
 */
#include "../xcub/loot/loot_tables.h"
#include "../xcub/loot/mc_loot.h"
#include "../xcub/loot/items.h"
#include "../xcub/loot/loot_functions.h"
static char lootBuf[1 << 17]; static int lootLen;
static Piece lootPieces[1100];
static void lootPut(const char *s) { int n = (int)strlen(s); if (lootLen + n + 1 >= (int)sizeof lootBuf) return; memcpy(lootBuf + lootLen, s, n); lootLen += n; lootBuf[lootLen] = 0; }
static int lootBiomeOv = -1;
void loot_biome(int b) { lootBiomeOv = b; }
char *loot_struct(int st, int x, int z, int maxChests) {
    lootLen = 0; lootBuf[0] = 0;
    int biome = getBiomeAt(&G, 4, x >> 2, 320 >> 2, z >> 2);
    if (curDim == 0) biome = getBiomeAt(&G, 4, x >> 2, surfaceY(x, z) >> 2, z >> 2);
    if (lootBiomeOv >= 0) biome = lootBiomeOv;
    StructureSaltConfig ssc; if (!getStructureSaltConfig(st, G.mc, biome, &ssc)) return lootBuf;
    StructureVariant sv; memset(&sv, 0, sizeof sv); getVariant(&sv, st, G.mc, G.seed, x, z, biome);
    int n = getStructurePieces(lootPieces, 1100, st, ssc, &sv, G.mc, G.seed, x, z);
    /* 엔드 도시: 한 청크에 여러 조각의 상자가 있을 때를 고려해서 다시 계산.
       청크마다 난수 하나를 이어 쓰고, 조각 순서대로 (그 청크 안 상자 수만큼 건너뛰고 → 상자 수만큼 뽑기) */
    if (st == End_City) {
        static int ck[512][2]; static RandomSource cr[512]; int nc = 0;
        for (int i = 0; i < n; i++) {
            Piece *p = &lootPieces[i]; if (p->chestCount <= 0) continue;
            int done[4] = {0};
            for (int c = 0; c < p->chestCount && c < 4; c++) {
                if (done[c]) continue;
                int cx = p->chestPoses[c].x >> 4, cz = p->chestPoses[c].z >> 4, k;
                for (k = 0; k < nc; k++) if (ck[k][0] == cx && ck[k][1] == cz) break;
                if (k == nc) {
                    if (nc >= 512) break;
                    ck[nc][0] = cx; ck[nc][1] = cz; cr[nc].type = XOROSHIRO_J;
                    absSetSeed(&cr[nc], getPopulationSeed(G.mc, G.seed, cx * 16, cz * 16) + ssc.decoratorIndex + 10000 * ssc.generationStep);
                    nc++;
                }
                int idx[4], m = 0;
                for (int d = c; d < p->chestCount && d < 4; d++) if (!done[d] && (p->chestPoses[d].x >> 4) == cx && (p->chestPoses[d].z >> 4) == cz) { idx[m++] = d; done[d] = 1; }
                for (int q = 0; q < m; q++) absNextLong(&cr[k]);
                for (int q = 0; q < m; q++) p->lootSeeds[idx[q]] = absNextLong(&cr[k]);
            }
        }
    }
    /* 월드 파일과 대조해서 맞춘 보정 */
    for (int i = 0; i < n; i++) {
        Piece *p = &lootPieces[i];
        /* 난파선: 첫 상자가 청크 안에 혼자 있으면, 청크 난수에서 하나 건너뛴 다음 값이 상자 시드
           (해변 난파선도 같음. 월드 파일 대조로 확인) */
        if (st == Shipwreck) {
            for (int c = 0; c < 1 && c < p->chestCount; c++) {   /* 첫 상자만 해당 (두 번째 이후는 원래 계산이 맞음) */
                int cx = p->chestPoses[c].x >> 4, cz = p->chestPoses[c].z >> 4, same = 0;
                for (int d = 0; d < p->chestCount && d < 4; d++) if ((p->chestPoses[d].x >> 4) == cx && (p->chestPoses[d].z >> 4) == cz) same++;
                if (same != 1) continue;
                RandomSource rnd = {.type = XOROSHIRO_J};
                absSetSeed(&rnd, getPopulationSeed(G.mc, G.seed, cx * 16, cz * 16) + ssc.decoratorIndex + 10000 * ssc.generationStep);
                absNextLong(&rnd); p->lootSeeds[c] = absNextLong(&rnd);
            }
        }
        /* 보루 잔해 보물 방(mid_wall_main)과 정글 사원 상자 2개: 두 상자의 시드가 서로 바뀌어 있음 */
        int sw = -1;
        if (st == Bastion && p->name && !strcmp(p->name, "bastion/treasure/ramparts/mid_wall_main") && p->chestCount >= 2) sw = 0;
        if (st == Jungle_Temple && p->chestCount >= 4) sw = 2;
        if (sw >= 0) { uint64_t t = p->lootSeeds[sw]; p->lootSeeds[sw] = p->lootSeeds[sw + 1]; p->lootSeeds[sw + 1] = t; }
        /* 정글 사원: 상자·발사기 위치를 사원 방향에 맞게 다시 계산 (월드 파일 대조로 맞춘 사원 안 좌표)
           0·1 화살 발사기 (3,1) (9,3), 2·3 상자 (9,10) (8,3) */
        if (st == Jungle_Temple && p->chestCount >= 4) {
            static const int L[4][2] = {{3, 1}, {9, 3}, {9, 10}, {8, 3}};
            int sx = sv.sx ? sv.sx : 12, sz = sv.sz ? sv.sz : 15;
            for (int c = 0; c < 4; c++) {
                int lx = L[c][0], lz = L[c][1], wx, wz;
                if (sv.rotation == 0 && !sv.mirror)      { wx = x + lx;          wz = z + sz - 1 - lz; }
                else if (sv.rotation == 0)               { wx = x + lx;          wz = z + lz; }
                else if (sv.mirror)                      { wx = x + sx - 1 - lz; wz = z + lx; }
                else                                     { wx = x + lz;          wz = z + lx; }
                p->chestPoses[c].x = wx; p->chestPoses[c].z = wz;
            }
        }
    }
    char line[256]; int chests = 0;
    for (int i = 0; i < n && chests < maxChests; i++) {
        Piece *p = &lootPieces[i];
        for (int c = 0; c < p->chestCount && c < 4 && chests < maxChests; c++) {
            if (!p->lootTables[c]) continue;
            LootTableContext *ctx = NULL;
            if (!init_loot_table_name(&ctx, p->lootTables[c], G.mc) || !ctx) continue;
            set_loot_seed(ctx, p->lootSeeds[c]);
            generate_loot(ctx);
            snprintf(line, sizeof line, "C|%s|%d|%d|%lld|%d|%s|%d\n", p->lootTables[c], p->chestPoses[c].x, p->chestPoses[c].z, (long long)p->lootSeeds[c], p->rot, p->name ? p->name : "", c); lootPut(line);
            for (int k = 0; k < ctx->generated_item_count; k++) {
                ItemStack *it = &ctx->generated_items[k];
                const char *nm = get_item_name(ctx, it->item);
                int o = snprintf(line, sizeof line, "I|%s|%d|", nm ? nm : "?", it->count);
                for (int e = 0; e < it->enchantment_count && o < 220; e++)
                    o += snprintf(line + o, sizeof line - o, "%s%s:%d", e ? "," : "", get_enchantment_name((Enchantment)it->enchantments[e].enchantment), it->enchantments[e].level);
                if (nm && (strstr(nm, "potion") || strstr(nm, "stew")) && it->mob_effect.duration > 0 && it->mob_effect.effect >= 0 && it->mob_effect.effect < EFFECT_NUM)
                    o += snprintf(line + o, sizeof line - o, "|%s:%d", MOB_EFFECTS[it->mob_effect.effect].effect_name, it->mob_effect.duration);
                snprintf(line + o, sizeof line - o, "\n"); lootPut(line);
            }
            /* 표는 미리 만들어 둔 정적 데이터라 free 하지 않음 */
            chests++;
        }
    }
    return lootBuf;
}
/* 디버그: 청크 (bx,bz)의 구조물 장식 난수에서 k번째 nextLong / 다른 단계 시험용 */
static char dbgBuf[4096];
char *dbg_chunkseeds(int bx, int bz, int st, int k) {
    StructureSaltConfig ssc; getStructureSaltConfig(st, G.mc, -1, &ssc);
    int o = 0;
    for (int di = -3; di <= 3; di++) {
        RandomSource rnd = {.type = XOROSHIRO_J};
        uint64_t ps = getPopulationSeed(G.mc, G.seed, bx & ~15, bz & ~15);
        absSetSeed(&rnd, ps + ssc.decoratorIndex + di + 10000 * ssc.generationStep);
        o += snprintf(dbgBuf + o, sizeof dbgBuf - o, "di%d:", di);
        for (int i = 0; i < k; i++) o += snprintf(dbgBuf + o, sizeof dbgBuf - o, " %lld", (long long)absNextLong(&rnd));
        o += snprintf(dbgBuf + o, sizeof dbgBuf - o, "\n");
    }
    return dbgBuf;
}

/* 구조물 세부 종류 (지도 표시·검색용)
 *  마을: 하위 3비트 종류(0 평원 1 사막 2 사바나 3 타이가 4 설원) | 8 버려진 마을
 *  이글루: 1 지하실 있음
 *  난파선: 하위 5비트 모양 번호(아래 목록) | 32 해변
 */
static const char *SHIP_NAMES[20] = {"shipwreck/with_mast","shipwreck/upsidedown_full","shipwreck/upsidedown_fronthalf","shipwreck/upsidedown_backhalf","shipwreck/sideways_full","shipwreck/sideways_fronthalf","shipwreck/sideways_backhalf","shipwreck/rightsideup_full","shipwreck/rightsideup_fronthalf","shipwreck/rightsideup_backhalf","shipwreck/with_mast_degraded","shipwreck/upsidedown_full_degraded","shipwreck/upsidedown_fronthalf_degraded","shipwreck/upsidedown_backhalf_degraded","shipwreck/sideways_full_degraded","shipwreck/sideways_fronthalf_degraded","shipwreck/sideways_backhalf_degraded","shipwreck/rightsideup_full_degraded","shipwreck/rightsideup_fronthalf_degraded","shipwreck/rightsideup_backhalf_degraded"};
int subtypeFlag(int st, int x, int z) {
    int bid = getBiomeAt(&G, 4, x >> 2, surfaceY(x, z) >> 2, z >> 2);
    StructureVariant sv; memset(&sv, 0, sizeof sv); getVariant(&sv, st, G.mc, G.seed, x, z, bid);
    if (st == Village) {
        int b = sv.biome, t = b == desert ? 1 : b == savanna ? 2 : b == taiga ? 3 : b == snowy_tundra ? 4 : 0;
        return t | (sv.abandoned ? 8 : 0);
    }
    if (st == Igloo) return sv.basement ? 1 : 0;
    if (st == Shipwreck) {
        StructureSaltConfig ssc; if (!getStructureSaltConfig(st, G.mc, bid, &ssc)) return 31;
        static Piece sp[4]; int n = getStructurePieces(sp, 4, st, ssc, &sv, G.mc, G.seed, x, z);
        int idx = 31;
        for (int k = 0; n > 0 && k < 20; k++) if (sp[0].name && !strcmp(sp[0].name, SHIP_NAMES[k])) { idx = k; break; }
        return idx | (isOceanic(bid) ? 0 : 32);
    }
    return 0;
}
int subtype_flag(int st, int x, int z) { return subtypeFlag(st, x, z); }
int dbg_variant(int st, int x, int z) {
    int bid = getBiomeAt(&G, 4, x >> 2, surfaceY(x, z) >> 2, z >> 2);
    StructureVariant sv; memset(&sv, 0, sizeof sv); getVariant(&sv, st, G.mc, G.seed, x, z, bid);
    return sv.rotation | (sv.mirror << 4) | (sv.sx << 8) | (sv.sz << 16);
}
int dbg_vy(int st, int x, int z, int what) {
    StructureVariant sv; memset(&sv, 0, sizeof sv); getVariant(&sv, st, G.mc, G.seed, x, z, -1);
    return what == 0 ? sv.y : what == 1 ? sv.x : what == 2 ? sv.z : what == 3 ? sv.sx : sv.sz;
}
int dbg_pos(int st, int cx, int cz) {   /* 그 청크가 속한 지역의 구조물 시도 위치(청크) 반환: x | z<<16 (부호 있는 16비트), 실패 0x7fffffff */
    StructureConfig sc; if (!getStructureConfig(st, G.mc, &sc)) return 0x7fffffff;
    Pos p; if (!getStructurePos(st, G.mc, G.seed, floorDiv(cx, sc.regionSize), floorDiv(cz, sc.regionSize), &p)) return 0x7fffffff;
    return ((p.x >> 4) & 0xffff) | ((p.z >> 4) << 16);
}
int dbg_viable(int st, int x, int z) { return viableAt(st, x, z); }
int dbg_vpos(int st, int x, int z) { return isViableStructurePos(st, &G, x, z, 0) | (isViableStructureTerrain(st, &G, x, z) << 1); }
int dbg_bv(int st, int x, int z, int y) { int id = getBiomeAt(&G, 4, x >> 2, y >> 2, z >> 2); return isViableFeatureBiome(G.mc, st, id); }
/* 표 이름 번호와 상자 시드로 내용물만 계산 (조각 조립식 구조물용). 0 고대 도시, 1 고대 도시 얼음 상자 */
static char *lootNamed(const char *tname, uint32_t lo, uint32_t hi);
char *loot_seed(int table, uint32_t lo, uint32_t hi) {
    static const char *T[] = {"chests/ancient_city", "chests/ancient_city_ice_box"};
    if (table < 0 || table > 1) { lootLen = 0; lootBuf[0] = 0; return lootBuf; }
    return lootNamed(T[table], lo, hi);
}
/* 이름으로 루트 테이블 하나를 시드로 돌림 (이름은 JS가 메모리에 써 줌) */
char *loot_named(const char *tname, uint32_t lo, uint32_t hi) { return lootNamed(tname, lo, hi); }
static char *lootNamed(const char *tname, uint32_t lo, uint32_t hi) {
    lootLen = 0; lootBuf[0] = 0;
    LootTableContext *ctx = NULL;
    if (!init_loot_table_name(&ctx, tname, G.mc) || !ctx) return lootBuf;
    set_loot_seed(ctx, (int64_t)(((uint64_t)hi << 32) | lo));
    generate_loot(ctx);
    char line[256];
    for (int k = 0; k < ctx->generated_item_count; k++) {
        ItemStack *it = &ctx->generated_items[k];
        const char *nm = get_item_name(ctx, it->item);
        int o = snprintf(line, sizeof line, "I|%s|%d|", nm ? nm : "?", it->count);
        for (int e = 0; e < it->enchantment_count && o < 220; e++)
            o += snprintf(line + o, sizeof line - o, "%s%s:%d", e ? "," : "", get_enchantment_name((Enchantment)it->enchantments[e].enchantment), it->enchantments[e].level);
        if (nm && (strstr(nm, "potion") || strstr(nm, "stew")) && it->mob_effect.duration > 0 && it->mob_effect.effect >= 0 && it->mob_effect.effect < EFFECT_NUM)
            o += snprintf(line + o, sizeof line - o, "|%s:%d", MOB_EFFECTS[it->mob_effect.effect].effect_name, it->mob_effect.duration);
        snprintf(line + o, sizeof line - o, "\n"); lootPut(line);
    }
    return lootBuf;
}
/* 고정 소금값(decoratorIndex + 10000*step)으로 청크 난수 k개 */
char *salt_longs(int bx, int bz, int salt, int k) {
    RandomSource rnd = {.type = G.mc >= MC_1_18 ? XOROSHIRO_J : JAVA_RANDOM};   /* 1.18 전은 자바 Random */
    uint64_t ps = getPopulationSeed(G.mc, G.seed, bx & ~15, bz & ~15);
    absSetSeed(&rnd, ps + salt);
    int o = 0;
    for (int i = 0; i < k; i++) o += snprintf(dbgBuf + o, sizeof dbgBuf - o, "%lld ", (long long)absNextLong(&rnd));
    return dbgBuf;
}

/* 지면 높이맵 WORLD_SURFACE_WG: 노이즈 단계(카버 전)에서 공기가 아닌 가장 높은 블록 + 1 (물 포함) */
int wg_height(int x, int z) { if (G.mc < MC_1_18) { return rp_height(x, z); }  /* 1.18 전 지형은 이 계산이 없음 */
    ensureTN(); int tx = fdiv(x, 256) * 256, tz = fdiv(z, 256) * 256;
    if (ccx0 != tx / 4 - 1 || ccz0 != tz / 4 - 1) cornerReset(tx / 4, tz / 4);
    noCarve = 1;
    int y = surfaceY(x, z) + 48; if (y > 319) y = 319;
    while (y > -64 && blockAt(x, y, z) == B_AIR) y--;
    if (y == surfaceY(x, z) + 48) { y = 319; while (y > -64 && blockAt(x, y, z) == B_AIR) y--; }
    noCarve = 0;
    return y + 1;
}
int dbg_fin(int x, int y, int z) { wg_height(x, z); noCarve = 1; blockAt(x, y, z); noCarve = 0; return (int)(lastFin * 1e6); }

/* 평면도 주변 지형 1: 높이 y에서 가로로 자른 단면. out[칸] = 0 돌, 1 공기(동굴), 2 물, 3 용암. 256칸 타일 단위로 돌아서 동굴 계산을 아낌 */
void slice_area(int x0, int z0, int w, int h, int y, unsigned char *out) { if (G.mc < MC_1_18) { return; }  /* 1.18 전 지형은 이 계산이 없음 */
    ensureTN();
    for (int tz = fdiv(z0, 256) * 256; tz < z0 + h; tz += 256)
    for (int tx = fdiv(x0, 256) * 256; tx < x0 + w; tx += 256) {
        if (c3x != tx || c3z != tz) { ensureCarve3D(tx, tz); cornerReset(tx / 4, tz / 4); }
        else if (ccx0 != tx / 4 - 1 || ccz0 != tz / 4 - 1) cornerReset(tx / 4, tz / 4);
        for (int z = tz > z0 ? tz : z0; z < tz + 256 && z < z0 + h; z++)
        for (int x = tx > x0 ? tx : x0; x < tx + 256 && x < x0 + w; x++) {
            int b = blockAt(x, y, z);
            out[(z - z0) * w + (x - x0)] = b == B_SOLID ? 0 : b == B_AIR ? 1 : b == B_WATER ? 2 : 3;
        }
    }
}
/* 평면도 주변 지형 2: 지표면 높이(WORLD_SURFACE_WG)와 물 여부. hy[칸] = 높이, wt[칸] = 1 물 */
void surf_area(int x0, int z0, int w, int h, short *hy, unsigned char *wt) { if (G.mc < MC_1_18) { return; }  /* 1.18 전 지형은 이 계산이 없음 */
    ensureTN();
    for (int tz = fdiv(z0, 256) * 256; tz < z0 + h; tz += 256)
    for (int tx = fdiv(x0, 256) * 256; tx < x0 + w; tx += 256) {
        cornerReset(tx / 4, tz / 4);
        noCarve = 1;
        for (int z = tz > z0 ? tz : z0; z < tz + 256 && z < z0 + h; z++)
        for (int x = tx > x0 ? tx : x0; x < tx + 256 && x < x0 + w; x++) {
            int a = surfaceY(x, z), y = a + 24; if (y > 319) y = 319;
            if (blockAt(x, y, z) != B_AIR) y = 319;
            while (y > -64 && blockAt(x, y, z) == B_AIR) y--;
            int k = (z - z0) * w + (x - x0);
            hy[k] = (short)(y + 1); wt[k] = blockAt(x, y, z) == B_WATER;
        }
        noCarve = 0;
    }
}
/* 평면도용: 범위 안 폐광들의 조각 상자. 반환 int 배열: [폐광 수, (x, z, 조각 수, (종류, x0,y0,z0,x1,y1,z1)×n)×폐광 수] */
static int mbBuf[200000];
int *mine_boxes(int x0, int z0, int x1, int z1) {
    static Pos ms[256];
    int n = getMineshafts(G.mc, G.seed, x0 >> 4, z0 >> 4, x1 >> 4, z1 >> 4, ms, 256); if (n > 256) n = 256;
    int o = 1, cnt = 0;
    for (int k = 0; k < n; k++) {
        int cx = ms[k].x >> 4, cz = ms[k].z >> 4, mesa = 0;
        if (!mineshaftBiome(cx, cz, &mesa)) continue;
        int np = getMineshaftPieces(pieces, 1024, G.mc, G.seed, cx, cz);
        int dy = mineshaftYOffset(np, mesa);
        if (o + 3 + np * 7 >= 200000) break;
        mbBuf[o++] = ms[k].x; mbBuf[o++] = ms[k].z; mbBuf[o++] = np; cnt++;
        for (int i = 0; i < np; i++) { Piece *p = &pieces[i];
            mbBuf[o++] = p->type; mbBuf[o++] = p->bb0.x; mbBuf[o++] = p->bb0.y + dy; mbBuf[o++] = p->bb0.z; mbBuf[o++] = p->bb1.x; mbBuf[o++] = p->bb1.y + dy; mbBuf[o++] = p->bb1.z; }
    }
    mbBuf[0] = cnt; return mbBuf;
}
/* 평면도용: 구조물 조각 목록. 줄마다 P|이름|x0|y0|z0|x1|y1|z1|회전|종류|원점x|원점y|원점z */
char *pieces_struct(int st, int x, int z) {
    lootLen = 0; lootBuf[0] = 0;
    int biome = getBiomeAt(&G, 4, x >> 2, 320 >> 2, z >> 2);
    if (curDim == 0) biome = getBiomeAt(&G, 4, x >> 2, surfaceY(x, z) >> 2, z >> 2);
    StructureSaltConfig ssc; if (!getStructureSaltConfig(st, G.mc, biome, &ssc)) return lootBuf;
    StructureVariant sv; memset(&sv, 0, sizeof sv); getVariant(&sv, st, G.mc, G.seed, x, z, biome);
    int n = getStructurePieces(lootPieces, 1100, st, ssc, &sv, G.mc, G.seed, x, z);
    if (st == Stronghold && n > 0) {   /* 1.18+: 다 만든 뒤 해수면 아래로 내림 (moveBelowSeaLevel, 같은 난수 이어 씀) */
        int mn = 1 << 30, mx = -(1 << 30);
        for (int i = 0; i < n; i++) { if (lootPieces[i].bb0.y < mn) mn = lootPieces[i].bb0.y; if (lootPieces[i].bb1.y > mx) mx = lootPieces[i].bb1.y; }
        uint64_t r = g_strongholdRng; int k = (mx - mn + 1) + (G.mc >= MC_1_18 ? -64 : 0) + 1, lim = 63 - 10;
        if (k < lim) k += nextInt(&r, lim - k);
        int dy = k - mx;
        for (int i = 0; i < n; i++) { lootPieces[i].bb0.y += dy; lootPieces[i].bb1.y += dy; lootPieces[i].pos.y += dy; }
    }
    if (st == Fortress && n > 0) {   /* 네더 요새: 다 만든 뒤 48~70 사이로 옮김 (moveInsideHeights, 같은 난수 이어 씀) */
        int mn = 1 << 30, mx = -(1 << 30);
        for (int i = 0; i < n; i++) { if (lootPieces[i].bb0.y < mn) mn = lootPieces[i].bb0.y; if (lootPieces[i].bb1.y > mx) mx = lootPieces[i].bb1.y; }
        uint64_t r = g_fortressRng; int span = mx - mn + 1, i2 = 70 - 48 + 1 - span, j = i2 > 1 ? 48 + nextInt(&r, i2) : 48, dy = j - mn;
        for (int i = 0; i < n; i++) { lootPieces[i].bb0.y += dy; lootPieces[i].bb1.y += dy; lootPieces[i].pos.y += dy; }
    }
    char line[200];
    for (int i = 0; i < n; i++) { Piece *p = &lootPieces[i];
        snprintf(line, sizeof line, "P|%s|%d|%d|%d|%d|%d|%d|%d|%d|%d|%d|%d\n", p->name ? p->name : "?", p->bb0.x, p->bb0.y, p->bb0.z, p->bb1.x, p->bb1.y, p->bb1.z, p->rot, p->type, p->pos.x, p->pos.y, p->pos.z);
        lootPut(line); }
    return lootBuf;
}
char *dbg_sh(int x, int z, int bound) {
    static char b[600]; int o = 0;
    int np = getStrongholdPieces(lootPieces, 1100, G.mc, G.seed, x >> 4, z >> 4);
    int mn = 1 << 30, mx = -(1 << 30);
    for (int i = 0; i < np; i++) { if (lootPieces[i].bb0.y < mn) mn = lootPieces[i].bb0.y; if (lootPieces[i].bb1.y > mx) mx = lootPieces[i].bb1.y; }
    o += snprintf(b + o, sizeof b - o, "n %d mn %d mx %d |", np, mn, mx);
    uint64_t r = g_strongholdRng; for (int i = 0; i < 12; i++) o += snprintf(b + o, sizeof b - o, " %d", nextInt(&r, bound));
    return b;
}

/* ================= 폐허가 된 차원문 틀 (1.16.x) =================
 * 1.16 지형(동굴 빼고 소음만)으로 높이를 정하고, 설계도·회전·대칭·높이로 틀 흑요석이 우는 흑요석으로 바뀌는지까지 계산.
 * 게임 코드: RuinedPortalFeature.Start.generatePieces / findSuitableY, BlockAgeProcessor(흑요석 15%), Mth.getSeed */
#include "rp_tables.h"
static SurfaceNoise RPsn; static uint64_t RPsnSeed = 0; static int RPsnOK = 0;
static float RP_BW[25];
static void rpInitNoise(void) {
    if (RPsnOK && RPsnSeed == G.seed) return;
    initSurfaceNoise(&RPsn, DIM_OVERWORLD, G.seed); RPsnSeed = G.seed; RPsnOK = 1;
    for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) RP_BW[i + 2 + (j + 2) * 5] = 10.0f / (float)sqrt((double)((float)(i * i + j * j) + 0.2f));
}
static double rpLerp(double t, double a, double b) { return a + t * (b - a); }
static double rpCLerp(double a, double b, double t) { return t < 0 ? a : t > 1 ? b : rpLerp(t, a, b); }
/* 소음 기둥 캐시 (칸 4×4 단위) */
#define RPC 64
static int rpcX[RPC], rpcZ[RPC], rpcOK[RPC]; static uint64_t rpcSeed[RPC]; static double rpcV[RPC][33];
static const double *rpColumn(int cx, int cz) {
    unsigned h = ((unsigned)cx * 73856093u ^ (unsigned)cz * 19349663u) % RPC;
    if (rpcOK[h] && rpcX[h] == cx && rpcZ[h] == cz && rpcSeed[h] == G.seed) return rpcV[h];
    float sS = 0, sD = 0, sW = 0, d0, s0; double dd, ss;
    getBiomeDepthAndScale(getBiomeAt(&G, 4, cx, 0, cz), &dd, &ss, 0); d0 = (float)dd;
    for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) {
        getBiomeDepthAndScale(getBiomeAt(&G, 4, cx + i, 0, cz + j), &dd, &ss, 0);
        float d = (float)dd, s = (float)ss, f = d > d0 ? 0.5f : 1.0f;
        float w = f * RP_BW[i + 2 + (j + 2) * 5] / (d + 2.0f);
        sS += s * w; sD += d * w; sW += w;
    }
    float fD = sD / sW, fS = sS / sW;
    double dep = (double)(fD * 0.5f - 0.125f) * 0.265625, sc = 96.0 / (double)(fS * 0.9f + 0.1f);
    double rv = sampleOctaveAmp(&RPsn.octdepth, cx * 200, 10.0, cz * 200, 1.0, 0.0, 1);
    double r5 = rv < 0 ? -rv * 0.3 : rv, r6 = r5 * 24.575625 - 2.0;
    double rd = r6 < 0 ? r6 * 0.009486607142857142 : (r6 < 1 ? r6 : 1.0) * 0.006640625;
    for (int y = 0; y <= 32; y++) {
        double n = sampleSurfaceNoise(&RPsn, cx, y, cz);
        double a = 1.0 - y * 2.0 / 32 + rd, b = a * 1.0 + -0.46875, c = (b + dep) * sc;
        n += c > 0 ? c * 4.0 : c;
        n = rpCLerp(-10.0, n, (32 - y - 0.0) / 3.0);
        rpcV[h][y] = n;
    }
    rpcX[h] = cx; rpcZ[h] = cz; rpcSeed[h] = G.seed; rpcOK[h] = 1;
    return rpcV[h];
}
/* 블록 기둥: 0 공기, 1 물, 2 돌 (y 0..255) */
static void rpBlockCol(int x, int z, unsigned char out[256]) {
    int cx = x >> 2, cz = z >> 2; double fx = (x & 3) / 4.0, fz = (z & 3) / 4.0;
    const double *c00 = rpColumn(cx, cz); double a00[33]; memcpy(a00, c00, sizeof a00);
    const double *c01 = rpColumn(cx, cz + 1); double a01[33]; memcpy(a01, c01, sizeof a01);
    const double *c10 = rpColumn(cx + 1, cz); double a10[33]; memcpy(a10, c10, sizeof a10);
    const double *c11 = rpColumn(cx + 1, cz + 1); double a11[33]; memcpy(a11, c11, sizeof a11);
    for (int cy = 31; cy >= 0; cy--) for (int k = 7; k >= 0; k--) {
        double t = k / 8.0;
        double v = rpLerp(fz, rpLerp(fx, rpLerp(t, a00[cy], a00[cy + 1]), rpLerp(t, a10[cy], a10[cy + 1])),
                              rpLerp(fx, rpLerp(t, a01[cy], a01[cy + 1]), rpLerp(t, a11[cy], a11[cy + 1])));
        int y = cy * 8 + k; out[y] = v > 0 ? 2 : y < 63 ? 1 : 0;
    }
}
static int rpBaseHeight(int x, int z, int oceanFloor) {
    unsigned char c[256]; rpBlockCol(x, z, c);
    for (int y = 255; y >= 0; y--) if (oceanFloor ? c[y] == 2 : c[y] != 0) return y + 1;
    return 0;
}
static uint64_t rpJ; static void rpJSet(int64_t s) { rpJ = ((uint64_t)s ^ 0x5DEECE66DULL) & ((1ULL << 48) - 1); }
static int rpJNext(int bits) { rpJ = (rpJ * 0x5DEECE66DULL + 0xBULL) & ((1ULL << 48) - 1); return (int)(int64_t)(rpJ >> (48 - bits)); }
static float rpJFloat(void) { return rpJNext(24) / (float)(1 << 24); }
static int64_t rpGetSeed(int x, int y, int z) {
    int64_t l = (int64_t)(int32_t)((uint32_t)x * 3129871u) ^ (int64_t)z * 116129781LL ^ (int64_t)y;
    l = (int64_t)((uint64_t)l * (uint64_t)l * 42317861ULL + (uint64_t)l * 11ULL); return l >> 16;
}
static void rpTransform(int x, int z, int mir, int rot, int px, int pz, int *ox, int *oz) {
    if (mir) x = -x;
    switch (rot) { case 2: *ox = px + px - x; *oz = pz + pz - z; return; case 3: *ox = px - pz + z; *oz = px + pz - x; return;
                   case 1: *ox = px + pz - z; *oz = pz - px + x; return; default: *ox = x; *oz = z; }
}
/* 결과 outBuf[100..]: 0 y, 1 놓인 방식(0 지표 1 땅속 2 산속 3 반쯤 묻힘 4 물 밑), 2 설계도(0..12), 3 틀 흑요석 필요(최소), 4 그 틀의 우는 흑요석 수,
   5 틀에 있는 흑요석(멀쩡한) 수, 6 회전, 7 대칭, 8..11 고른 틀 (z0,z1,y0,y1 설계도 기준), 12 바다 여부, 13 더 없어질 수도 있는 칸 수. 반환: 필요한 흑요석 수, 틀이 없으면 99, 지원 안 하면 -1 */
/* 1.18 이후: 동굴 카버 없이 소음 지형(대수층·소음 동굴 포함) 블록. 0 공기 1 물·용암 2 단단함 */
static int rp18Block(int x, int y, int z) {
    int tx = fdiv(x, 256) * 256, tz = fdiv(z, 256) * 256;
    if (ccx0 != tx / 4 - 1 || ccz0 != tz / 4 - 1) cornerReset(tx / 4, tz / 4);
    int ba = bActive; bActive = 0; noCarve = 1; int b = blockAt(x, y, z); noCarve = 0; bActive = ba;
    return b == B_SOLID ? 2 : b == B_AIR ? 0 : 1;
}
static int rp18Base(int x, int z, int ocean) {
    int y0 = surfaceY(x, z) + 48, y = y0; if (y > 319) y = 319;
    if (rp18Block(x, y, z) != 0) y = 319;
    while (y > -64) { int b = rp18Block(x, y, z); if (ocean ? b == 2 : b != 0) break; y--; }
    return y + 1;
}
static int rpNew(void) { return G.mc >= MC_1_18; }
static int rpBaseAny(int x, int z, int ocean) { return rpNew() ? rp18Base(x, z, ocean) : rpBaseHeight(x, z, ocean); }
int rp_frame(int px, int pz) {
    if (!((G.mc >= MC_1_16_1 && G.mc < MC_1_17) || G.mc >= MC_1_18)) return -1;
    if (rpNew()) ensureTN(); else rpInitNoise();
    int biome = rpNew() ? getBiomeAt(&G, 4, px >> 2, surfaceY(px, pz) >> 2, pz >> 2) : getBiomeAt(&G, 4, (px >> 2) + 2, 0, (pz >> 2) + 2);
    StructureVariant sv; if (!getVariant(&sv, Ruined_Portal, G.mc, G.seed, px, pz, biome)) return -1;
    uint64_t rng = chunkGenerateRnd(G.seed, px >> 4, pz >> 4);
    int vp = 0, tp = sv.biome;   /* 0 지표 1 땅속 2 산속 3 반쯤 묻힘 4 물 밑 */
    if (tp == desert) vp = 3;
    else if (tp == jungle) { if (G.mc <= MC_26_2) nextFloat(&rng); vp = 0; }
    else if (tp == swamp || tp == ocean) vp = 4;
    else { int b = nextFloat(&rng) < 0.5f; vp = b ? (tp == mountains ? 2 : 1) : 0; if (!b && G.mc <= MC_26_2) nextFloat(&rng); }
    int giant = nextFloat(&rng) < 0.05f; int t = giant ? 10 + nextInt(&rng, 3) : nextInt(&rng, 10);
    int rot = nextInt(&rng, 4); int mir = !(nextFloat(&rng) < 0.5f);
    const int *T = RP_T[t]; int sx = T[0], sy = T[1], sz = T[2];
    int pvx = sx / 2, pvz = sz / 2;
    int rsx = (rot & 1) ? sz : sx, rsz = (rot & 1) ? sx : sz, i9 = rsx - 1, i11 = rsz - 1;
    int x0, z0, x1, z1;
    switch (rot) {
    case 0: x0 = 0; z0 = 0; x1 = i9; z1 = i11; break;
    case 2: x0 = 2 * pvx - i9; z0 = 2 * pvz - i11; x1 = 2 * pvx; z1 = 2 * pvz; break;
    case 3: x0 = pvx - pvz; z0 = pvx + pvz - i11; x1 = pvx - pvz + i9; z1 = pvx + pvz; break;
    default: x0 = pvx + pvz - i9; z0 = pvz - pvx; x1 = pvx + pvz; z1 = pvz - pvx + i11; break;
    }
    if (mir) { int dx = 0, dz = 0; if (rot == 1) dz = -i11; else if (rot == 3) dz = i11; else if (rot == 2) dx = i9; else dx = -i9; x0 += dx; x1 += dx; z0 += dz; z1 += dz; }
    x0 += px; x1 += px; z0 += pz; z1 += pz;
    int ccx = x0 + (x1 - x0 + 1) / 2, ccz = z0 + (z1 - z0 + 1) / 2;
    int surf = rpBaseAny(ccx, ccz, vp == 4) - 1, minY = rpNew() ? -49 : 15;
    int y;
    if (vp == 2) { int top = surf - sy; y = 70 < top ? 70 + nextInt(&rng, top - 70 + 1) : top; }
    else if (vp == 1) { int top = surf - sy; y = minY < top ? minY + nextInt(&rng, top - minY + 1) : top; }
    else if (vp == 3) y = surf - sy + 2 + nextInt(&rng, 7);
    else y = surf;
    { int cxs[4] = {x0, x1, x0, x1}, czs[4] = {z0, z0, z1, z1};
      if (rpNew()) {
        for (; y > minY; y--) { int n = 0; for (int k = 0; k < 4; k++) { int b = rp18Block(cxs[k], y, czs[k]); if (vp == 4 ? b == 2 : b != 0) { if (++n == 3) break; } } if (n >= 3) break; }
      } else {
        static unsigned char cols[4][256];
        for (int k = 0; k < 4; k++) rpBlockCol(cxs[k], czs[k], cols[k]);
        for (; y > 15; y--) { int n = 0; for (int k = 0; k < 4; k++) { int b = y < 256 && y >= 0 ? cols[k][y] : 0; if (vp == 4 ? b == 2 : b != 0) n++; } if (n >= 3) break; }
      } }
    /* 틀 */
    for (int i = 0; i < 16; i++) outBuf[100 + i] = 0;
    outBuf[100] = y; outBuf[101] = vp; outBuf[102] = t; outBuf[106] = rot; outBuf[107] = mir; outBuf[112] = (tp == ocean);
    if (T[3] < 0) { outBuf[103] = 99; return 99; }
    int fx = T[3], fz0 = T[4], fz1 = T[5], fy0 = T[6], fy1 = T[7];
    signed char good[24][24]; memset(good, 0, sizeof good);   /* [y][z] 1 흑요석, 2 우는 흑요석 */
    int ngood = 0;
    for (int k = RP_N[t][0]; k < RP_N[t][1]; k++) {
        int ty = RP_P[k][0], tz = RP_P[k][1], wx, wz; rpTransform(fx, tz, mir, rot, pvx, pvz, &wx, &wz);
        wx += px; wz += pz; int wy = y + ty;
        rpJSet(rpGetSeed(wx, wy, wz)); int cry = rpJFloat() < 0.15f;
        good[ty][tz] = cry ? 2 : 1; if (!cry) ngood++;
    }
    /* 땅 위·물 밑 차원문: 기둥 맨 위(높이 3 이하)의 우는 흑요석은 게임이 네더랙으로 덮을 수 있고, 그러면 바로 밑부터 50%씩
       네더랙·마그마로 바뀜. 실제로 덮이는지는 장식 난수라 "없어질 수 있는 칸"으로 따로 셈 (1.16.1·26.3 월드 대조) */
    signed char risk[24][24]; memset(risk, 0, sizeof risk);
    if (vp == 0 || vp == 4) for (int zz = 0; zz < 16; zz++) {
        int ty = RP_TOPO[t][zz]; if (ty < 0 || good[ty][zz] != 2) continue;
        for (int k = ty - 1; k >= 0 && k >= ty - 9; k--) risk[k][zz] = 1;   /* 네더랙이 그 기둥에 떨어질지는 장식 난수라 "없어질 수 있음"으로 */
    }
    /* 설계도 틀 안에서 가장 적게 채워도 되는 틀 (안쪽 최소 2×3) */
    int best = 999, bc = 0, br = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0;
    for (int a0 = fz0; a0 <= fz1; a0++) for (int a1 = a0 + 3; a1 <= fz1; a1++)
    for (int c0 = fy0; c0 <= fy1; c0++) for (int c1 = c0 + 4; c1 <= fy1; c1++) {
        int need = 0, cry = 0, rk = 0;
        for (int zz = a0; zz <= a1; zz++) for (int yy = c0; yy <= c1; yy++) {
            int edgeZ = (zz == a0 || zz == a1), edgeY = (yy == c0 || yy == c1);
            if (!(edgeZ || edgeY) || (edgeZ && edgeY)) continue;
            if (good[yy][zz] != 1) need++; else if (risk[yy][zz]) rk++; if (good[yy][zz] == 2) cry++;
        }
        if (need < best || (need == best && rk < br)) { best = need; bc = cry; br = rk; b0 = a0; b1 = a1; b2 = c0; b3 = c1; }
    }
    outBuf[103] = best; outBuf[104] = bc; outBuf[105] = ngood; outBuf[108] = b0; outBuf[109] = b1; outBuf[110] = b2; outBuf[111] = b3; outBuf[113] = br;
    return best;
}
/* 확인용: (x,z) 블록 기둥의 1.16 지표 높이 (WORLD_SURFACE_WG) */
int rp_height(int x, int z) { if (rpNew()) { ensureTN(); return rp18Base(x, z, 0); } if (G.mc < MC_1_16_1 || G.mc >= MC_1_17) return -1; rpInitNoise(); return rpBaseHeight(x, z, 0); }
/* 고른 버전에 그 바이옴이 생기는지 */
int biome_ok(int id) { return isOverworld(G_MCV, id); }
