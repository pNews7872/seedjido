#include "../cubiomes/biomes.h"
#include "../cubiomes/util.h"
#include <stdio.h>
int main(){ for(int i=0;i<256;i++) if(isOverworld(MC_1_21_WD,i)) printf("%d %s\n", i, biome2str(MC_1_21_WD,i)); }
