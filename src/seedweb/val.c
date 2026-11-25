#include "seedwasm26.c"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
static double now(){struct timespec t;clock_gettime(CLOCK_MONOTONIC,&t);return t.tv_sec+t.tv_nsec*1e-9;}
int main(int argc,char**argv){
  int margin=atoi(argv[1]); int N=atoi(argv[2]);
  int combos[][4]={{186,184,-9},{188,-9},{185,14,-9},{184,-1,-9},{140,-9},{186,-9},{14,-9},{168,-2,-9}};
  for(int c=0;c<8;c++){
    int n=0; while(combos[c][n]!=-9){ idsBuf[n]=combos[c][n]; ysBuf[n]=256; n++; }
    int R = (c==1||c==4)?300:600;
    double t0=now(); int exact[4000], ne=0; for(int s=0;s<N;s++) if(test_seed(s,0,MC_26_3,n,R,32,0,0,1,0)) { if(ne<4000) exact[ne]=s; ne++; }
    double t1=now(); int nf=0, miss=0, j=0; for(int s=0;s<N;s++){ int r=test_seed(s,0,MC_26_3,n,R,32,0,0,1,margin); if(r) nf++; 
       while(j<ne && exact[j]<s) j++; if(j<ne && exact[j]==s && !r) miss++; }
    double t2=now();
    printf("combo %d R=%d exact %d (%.1fs) fast %d (%.1fs) missed %d  speedup %.2fx\n",c,R,ne,t1-t0,nf,t2-t1,miss,(t1-t0)/(t2-t1));
    fflush(stdout);
  }
}
