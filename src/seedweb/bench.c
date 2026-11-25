#include "../xcub/terrainnoise.h"
#include "../xcub/biomes.h"
#include <stdio.h>
#include <time.h>
static double now(){struct timespec t;clock_gettime(CLOCK_MONOTONIC,&t);return t.tv_sec+t.tv_nsec*1e-9;}
int main(){
  static TerrainNoise tn; setupTerrainNoise(&tn, MC_26_3, 0);
  double col[64]; double t0=now(); int seeds=5;
  for(int s=0;s<seeds;s++){ initTerrainNoise(&tn, s, DIM_OVERWORLD);
    for(int cx=-62;cx<62;cx+=4) for(int cz=-62;cz<62;cz+=4) sampleNoiseColumn(&tn, cx, cz, 0, 48, col); }
  double t=now()-t0; int cols=seeds*31*31;
  printf("init+cols: %.3fs for %d seeds, %.1f us/column\n", t, seeds, t/cols*1e6);
  t0=now(); for(int s=0;s<20;s++) initTerrainNoise(&tn,s,DIM_OVERWORLD); printf("init only %.2f ms\n",(now()-t0)/20*1e3);
}
