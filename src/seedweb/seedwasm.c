#include "../cub2/generator.h"
#include "../cub2/biomes.h"
#include "../cub2/finders.h"
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

int test_seed(uint32_t lo, uint32_t hi, int mc, int n, int R, int step, int cx, int cz, int useSpawn) {
    set_seed(lo, hi, mc);
    if (useSpawn) { Pos sp = estimateSpawn(&G, 0); cx = sp.x; cz = sp.z; }
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
int mc_wd(void) { return MC_1_21_WD; }
