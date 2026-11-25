#include "../xcub/generator.h"
#include "../xcub/biomes.h"
#include "../xcub/finders.h"
#include <stdint.h>

static Generator G;
static int curMc = -1;
static int idsBuf[16];
static int ysBuf[16];
static int outBuf[64];
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

void set_seed(uint32_t lo, uint32_t hi, int mc) {
    if (mc != curMc) { setupGenerator(&G, mc, 0); curMc = mc; }
    applySeed(&G, DIM_OVERWORLD, ((uint64_t)hi << 32) | lo);
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

int test_seed(uint32_t lo, uint32_t hi, int mc, int n, int R, int step, int cx, int cz, int useSpawn, int fast) {
    set_seed(lo, hi, mc);
    if (useSpawn) { Pos sp = estimateSpawn(&G, 0); cx = sp.x; cz = sp.z; }
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

void nearest(int n, int R, int step, int cx, int cz, int useSpawn) {
    prepY(n);
    if (useSpawn) { Pos sp = getSpawn(&G); cx = sp.x; cz = sp.z; }
    outBuf[48] = cx; outBuf[49] = cz;
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
}
int biome_at(int x, int z, int y) { return getBiomeAt(&G, 4, x >> 2, y >> 2, z >> 2); }
int mc_wd(void) { return MC_26_3; }
