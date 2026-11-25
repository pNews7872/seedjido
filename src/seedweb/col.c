#include "../cubiomes/util.h"
#include <stdio.h>
int main(){ unsigned char c[256][3]; initBiomeColors(c); printf("[");
for(int i=0;i<256;i++) printf("%s\"%02x%02x%02x\"", i?",":"", c[i][0],c[i][1],c[i][2]); printf("]\n");}
