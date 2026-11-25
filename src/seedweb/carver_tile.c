/* 카버 동굴·협곡을 타일 단위로 한 번에 파기 (xpple/cubiomes carver.c를 바탕으로, 청크 대신 타일 경계를 쓰도록 바꿈)
 * 게임은 대상 청크마다 주변 ±8청크의 카버를 다시 돌리지만, 결과의 합집합은 출발 청크마다 한 번씩 끝까지 돌린 것과 같다. */
#include "../xcub/carver.h"
#include "../xcub/rng.h"
#include <math.h>
#include <string.h>
#include <stdint.h>
#define CPI 3.14159265358979323846

static int TX0, TZ0, TS, SLICEY; /* SLICEY != NOSLICE 이면 그 높이만 2D로 기록 */
#define NOSLICE (-99999)
static uint8_t *TM;
static inline void tset(int x, int y, int z) {
    long i;
    if (SLICEY != NOSLICE) { if (y != SLICEY) return; i = (long)(z - TZ0) * TS + (x - TX0); }
    else i = ((long)(y + 64) * TS + (z - TZ0)) * TS + (x - TX0);
    TM[i >> 3] |= (uint8_t)(1 << (i & 7));
}
static int reachT(double x, double z, int bi, int bc, float w) {
    double f = fabs(x - (TX0 + TS / 2.0)) - TS / 2.0, g = fabs(z - (TZ0 + TS / 2.0)) - TS / 2.0;
    if (f < 0) f = 0; if (g < 0) g = 0;
    double h = bc - bi, i = w + 2.0F + 16.0F;
    return f * f + g * g - h * h <= i * i;
}
typedef int (*SkipFn)(double, double, double, int, int, void *);
static int skipCanyon(double rx, double ry, double rz, int y, int minY, void *wf) {
    return (rx * rx + rz * rz) * ((float *)wf)[y - minY - 1] + ry * ry / 6.0 >= 1.0;
}
static int skipCave(double rx, double ry, double rz, int a, int b, void *minRel) {
    (void)a; (void)b;
    return ry <= *(double *)minRel ? 1 : rx * rx + ry * ry + rz * rz >= 1.0;
}
static void ellipsoid(double x, double y, double z, double hr, double vr, int minYw, int hw, SkipFn skip, void *arg) {
    if (x + hr < TX0 - 2 || x - hr > TX0 + TS + 1 || z + hr < TZ0 - 2 || z - hr > TZ0 + TS + 1) return;
    int minX = (int)floor(x - hr) - 1, maxX = (int)floor(x + hr), minZ = (int)floor(z - hr) - 1, maxZ = (int)floor(z + hr);
    if (minX < TX0) minX = TX0; if (maxX > TX0 + TS - 1) maxX = TX0 + TS - 1;
    if (minZ < TZ0) minZ = TZ0; if (maxZ > TZ0 + TS - 1) maxZ = TZ0 + TS - 1;
    int minY = (int)floor(y - vr) - 1; if (minY < minYw + 1) minY = minYw + 1;
    int maxY = (int)floor(y + vr) + 1; if (maxY > minYw + hw - 1) maxY = minYw + hw - 1;
    if (SLICEY != NOSLICE && (SLICEY > maxY || SLICEY <= minY)) return;
    for (int ax = minX; ax <= maxX; ax++) {
        double rx = (ax + 0.5 - x) / hr;
        for (int az = minZ; az <= maxZ; az++) {
            double rz = (az + 0.5 - z) / hr;
            if (rx * rx + rz * rz >= 1.0) continue;
            int y0 = maxY, y1 = minY;
            if (SLICEY != NOSLICE) { y0 = SLICEY; y1 = SLICEY - 1; }
            for (int ay = y0; ay > y1; ay--) {
                double ry = (ay - 0.5 - y) / vr;
                if (skip(rx, ry, rz, ay, minYw, arg)) continue;
                tset(ax, ay, az);
            }
        }
    }
}
/* ---- canyon ---- */
static void widthFactors(uint64_t *rnd, int h, float wf[], CanyonCarverConfig c) {
    float f; { float a = nextFloat(rnd), b = nextFloat(rnd); f = 1.0F + a * b; wf[0] = f * f; }
    for (int j = 1; j < h; j++) { if (nextInt(rnd, c.widthSmoothness) == 0) { float a = nextFloat(rnd), b = nextFloat(rnd); f = 1.0F + a * b; } wf[j] = f * f; }
}
static double vRad(CanyonCarverConfig c, uint64_t *rnd, double vr, float bc, float cb) {
    float f = 1.0F - fabs(0.5F - cb / bc) * 2.0F;
    float g = c.verticalRadiusDefaultFactor + c.verticalRadiusCenterFactor * f;
    return g * vr * nextFloatBetween(rnd, 0.75F, 1.0F);
}
static void canyonInner(CanyonCarverConfig c, int mc, uint64_t *rnd, int ocx, int ocz) {
    int range = (c.range * 2 - 1) * 16;
    double x = (ocx << 4) + nextInt(rnd, 16);
    double y = c.y(rnd, c.minY, c.maxY, c.innerY);
    double z = (ocz << 4) + nextInt(rnd, 16);
    float yaw = nextFloat(rnd) * (float)(CPI * 2);
    float pitch = c.verticalRotation(rnd, c.minVerRot, c.maxVerRot);
    double hvr = c.yScale;
    float th = c.thickness(rnd, c.minThickness, c.maxThickness, c.plateauThickness);
    int bc = (int)(range * c.distanceFactor(rnd, c.minDistance, c.maxDistance));
    uint64_t seed = nextLong(rnd); setSeed(rnd, seed);
    const int minYw = -64, hw = 384;
    float wf[384]; widthFactors(rnd, hw, wf, c);
    float f = 0, g = 0;
    for (int bi = 0; bi < bc; bi++) {
        double hr = 1.5 + sin(bi * (float)CPI / bc) * th;
        double vr = hr * hvr;
        hr *= c.horizontalRadiusFactor(rnd, c.minHorRadius, c.maxHorRadius);
        vr = vRad(c, rnd, vr, bc, bi);
        float h = cos(pitch), j = sin(pitch);
        x += cos(yaw) * h; y += j; z += sin(yaw) * h;
        pitch *= 0.7F; pitch += g * 0.05F; yaw += f * 0.05F; g *= 0.8F; f *= 0.5F;
        float f1 = nextFloat(rnd), f2 = nextFloat(rnd), f3 = nextFloat(rnd); g += (f1 - f2) * f3 * 2.0F;
        float f4 = nextFloat(rnd), f5 = nextFloat(rnd), f6 = nextFloat(rnd); f += (f4 - f5) * f6 * 4.0F;
        if (nextInt(rnd, 4) == 0) continue;
        if (!reachT(x, z, bi, bc, th)) return;
        ellipsoid(x, y, z, hr, vr, minYw, hw, skipCanyon, wf);
    }
    (void)mc;
}
/* ---- cave ---- */
static void tunnel(CaveCarverConfig c, uint64_t seed, double x, double y, double z, double hrm, double vrm, float th, float yaw, float pitch, int bi0, int bc, double hvr, double floorLevel) {
    uint64_t rnd; setSeed(&rnd, seed);
    int i = nextInt(&rnd, bc / 2) + bc / 4;
    int bl = nextInt(&rnd, 6) == 0;
    float f = 0, g = 0;
    for (int j = bi0; j < bc; j++) {
        double d = 1.5 + sin((float)CPI * j / bc) * th, e = d * hvr;
        float h = cos(pitch);
        x += cos(yaw) * h; y += sin(pitch); z += sin(yaw) * h;
        pitch *= bl ? 0.92F : 0.7F; pitch += g * 0.1F; yaw += f * 0.1F; g *= 0.9F; f *= 0.75F;
        float f1 = nextFloat(&rnd), f2 = nextFloat(&rnd), f3 = nextFloat(&rnd); g += (f1 - f2) * f3 * 2.0F;
        float f4 = nextFloat(&rnd), f5 = nextFloat(&rnd), f6 = nextFloat(&rnd); f += (f4 - f5) * f6 * 4.0F;
        if (j == i && th > 1.0F) {
            uint64_t s1 = nextLong(&rnd); float t1 = nextFloat(&rnd);
            tunnel(c, s1, x, y, z, hrm, vrm, t1 * 0.5F + 0.5F, yaw - (float)(CPI / 2), pitch / 3.0F, j, bc, 1.0, floorLevel);
            uint64_t s2 = nextLong(&rnd); float t2 = nextFloat(&rnd);
            tunnel(c, s2, x, y, z, hrm, vrm, t2 * 0.5F + 0.5F, yaw + (float)(CPI / 2), pitch / 3.0F, j, bc, 1.0, floorLevel);
            return;
        }
        if (nextInt(&rnd, 4) == 0) continue;
        if (!reachT(x, z, j, bc, th)) return;
        ellipsoid(x, y, z, d * hrm, e * vrm, -64, 384, skipCave, &floorLevel);
    }
}
static void caveInner(CaveCarverConfig c, uint64_t *rnd, int cx, int cz) {
    int range = (c.range * 2 - 1) << 4;
    int r1 = nextInt(rnd, c.caveBound), r2 = nextInt(rnd, r1 + 1), n = nextInt(rnd, r2 + 1);
    for (int k = 0; k < n; k++) {
        double x = (cx << 4) + nextInt(rnd, 16);
        double y = c.y(rnd, c.minY, c.maxY, c.innerY);
        double z = (cz << 4) + nextInt(rnd, 16);
        double hrm = c.horizontalRadiusMultiplier(rnd, c.minHorRadius, c.maxHorRadius);
        double vrm = c.verticalRadiusMultiplier(rnd, c.minVerRadius, c.maxVerRadius);
        double fl = c.floorLevel(rnd, c.minFloorLevel, c.maxFloorLevel);
        int m = 1;
        if (nextInt(rnd, 4) == 0) {
            double ys = c.yScale(rnd, c.minYScale, c.maxYScale);
            float rad = 1.0F + nextFloat(rnd) * 6.0F;
            double hr = 1.5 + sin(CPI / 2) * rad;
            ellipsoid(x + 1.0, y, z, hr, hr * ys, -64, 384, skipCave, &fl);
            m += nextInt(rnd, 4);
        }
        for (int p = 0; p < m; p++) {
            float q = nextFloat(rnd) * (float)(CPI * 2);
            float o = (nextFloat(rnd) - 0.5F) / 4.0F;
            float r = c.thickness(rnd);
            int s = range - nextInt(rnd, range / 4);
            tunnel(c, nextLong(rnd), x, y, z, hrm, vrm, r, q, o, 0, s, c.tunnelYScale, fl);
        }
    }
}
/* 타일 [x0, x0+size) × [z0, z0+size)에 닿는 모든 카버를 판다. sliceY가 NOSLICE면 3D 비트맵 */
void carve_tile_into(uint64_t seed, int mc, int x0, int z0, int size, int sliceY, uint8_t *mask) {
    TX0 = x0; TZ0 = z0; TS = size; SLICEY = sliceY; TM = mask;
    long bytes = sliceY != NOSLICE ? ((long)size * size + 7) / 8 : ((long)size * size * 384 + 7) / 8;
    memset(mask, 0, bytes);
    int cx0 = (x0 >> 4) - 8, cx1 = ((x0 + size - 1) >> 4) + 8, cz0 = (z0 >> 4) - 8, cz1 = ((z0 + size - 1) >> 4) + 8;
    CaveCarverConfig cc[2]; CanyonCarverConfig ky;
    getCaveCarverConfig(CAVE_CARVER, mc, -1, &cc[0]);
    getCaveCarverConfig(CAVE_EXTRA_UNDERGROUND_CARVER, mc, -1, &cc[1]);
    getCanyonCarverConfig(CANYON_CARVER, mc, &ky);
    for (int cx = cx0; cx <= cx1; cx++) for (int cz = cz0; cz <= cz1; cz++) {
        uint64_t rnd;
        for (int t = 0; t < 2; t++) if (checkCaveStart(seed, cx, cz, cc[t], &rnd)) caveInner(cc[t], &rnd, cx, cz);
        if (checkCanyonStart(seed, cx, cz, ky, &rnd)) canyonInner(ky, mc, &rnd, cx, cz);
    }
}

/* 협곡 경로: (cx,cz) 청크에서 협곡이 시작하면 경로 위 6개 점(시작~끝)과 중심 높이를 out에 넣고 길이(단계 수)를 돌려줌 */
int canyon_trace(uint64_t seed, int mc, int cx, int cz, int out[6][3], int *ymin, int *ymax) {
    CanyonCarverConfig c; getCanyonCarverConfig(CANYON_CARVER, mc, &c);
    uint64_t rnd;
    if (!checkCanyonStart(seed, cx, cz, c, &rnd)) return 0;
    int range = (c.range * 2 - 1) * 16;
    double x = (cx << 4) + nextInt(&rnd, 16);
    double y = c.y(&rnd, c.minY, c.maxY, c.innerY);
    double z = (cz << 4) + nextInt(&rnd, 16);
    float yaw = nextFloat(&rnd) * (float)(CPI * 2);
    float pitch = c.verticalRotation(&rnd, c.minVerRot, c.maxVerRot);
    float th = c.thickness(&rnd, c.minThickness, c.maxThickness, c.plateauThickness);
    int bc = (int)(range * c.distanceFactor(&rnd, c.minDistance, c.maxDistance));
    uint64_t s2 = nextLong(&rnd); setSeed(&rnd, s2);
    float wf[384]; widthFactors(&rnd, 384, wf, c);
    float f = 0, g = 0;
    int k = 0; *ymin = 999; *ymax = -999;
    for (int bi = 0; bi < bc; bi++) {
        double hr = 1.5 + sin(bi * (float)CPI / bc) * th;
        double vr = hr * c.yScale;
        hr *= c.horizontalRadiusFactor(&rnd, c.minHorRadius, c.maxHorRadius);
        vr = vRad(c, &rnd, vr, bc, bi);
        float h = cos(pitch), j = sin(pitch);
        x += cos(yaw) * h; y += j; z += sin(yaw) * h;
        pitch *= 0.7F; pitch += g * 0.05F; yaw += f * 0.05F; g *= 0.8F; f *= 0.5F;
        float f1 = nextFloat(&rnd), f2 = nextFloat(&rnd), f3 = nextFloat(&rnd); g += (f1 - f2) * f3 * 2.0F;
        float f4 = nextFloat(&rnd), f5 = nextFloat(&rnd), f6 = nextFloat(&rnd); f += (f4 - f5) * f6 * 4.0F;
        int skip = nextInt(&rnd, 4) == 0;
        if (!skip) { int lo = (int)floor(y - vr), hi = (int)floor(y + vr); if (lo < *ymin) *ymin = lo; if (hi > *ymax) *ymax = hi; }
        while (k < 6 && bi >= (long)(bc - 1) * k / 5) { out[k][0] = (int)floor(x); out[k][1] = (int)floor(y); out[k][2] = (int)floor(z); k++; }
    }
    return bc;
}
