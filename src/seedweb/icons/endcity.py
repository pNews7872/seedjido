import json
def blank(): return [['.']*16 for _ in range(16)]
class G(list):
    pass
def put(g,x,y,c):
    if 0<=x<16 and 0<=y<16: g[y][x]=c
def tower(g,cx,w,top,bot,cap=True):
    # 몸통
    x0=cx-w//2
    for y in range(top+ (3 if cap else 0),bot+1):
        for x in range(x0,x0+w):
            edge = x in (x0,x0+w-1)
            g[y][x]='k' if edge else ('6' if (x-x0)%3==0 else '5')
    for y in range(top+5,bot,4):
        for x in range(cx-1,cx+1):
            if g[y][x] not in 'k': g[y][x]='x'
    if cap:
        cw=w+4; c0=cx-cw//2
        for x in range(c0+1,c0+cw-1): put(g,x,top,'k')
        for x in range(c0,c0+cw): put(g,x,top+1,'k' if x in (c0,c0+cw-1) else '5')
        for x in range(c0,c0+cw): put(g,x,top+2,'k')
    if bot<15:
        for x in range(x0,x0+w): g[bot][x]='k'
def bridge(g,xa,xb,y):
    for x in range(xa,xb+1): g[y][x]='6' if x%2 else '5'; 
    for x in range(xa,xb+1):
        if g[y-1][x]=='.': g[y-1][x]='k'
        if y+1<16 and g[y+1][x]=='.': g[y+1][x]='k'
I={}
g=blank(); tower(g,8,6,6,15); I['ec_0']=g
g=blank(); tower(g,6,6,2,15); tower(g,12,4,7,15,cap=True); I['ec_1']=g
g=blank(); tower(g,4,4,1,15); tower(g,12,4,3,15); bridge(g,6,10,8); I['ec_2']=g
g=blank(); tower(g,3,4,5,15); tower(g,8,4,0,15); tower(g,12,4,4,15); bridge(g,5,6,10); bridge(g,10,11,7); I['ec_3']=g
for k in list(I): I[k]=[''.join(r) for r in I[k]]
badge=[".kkkkk.","kȅȅkȅȅk","kȅȏkȏȅk","kȅȏkȏȅk","kȅȅkȅȅk",".kȅ.ȅk.","..k.k.."]
for k in ['ec_0','ec_1','ec_2','ec_3']:
    g=[list(r) for r in I[k]]
    for y,r in enumerate(badge):
        for x,c in enumerate(r):
            if c!='.': g[9+y][9+x]=c
            elif g[9+y][9+x] not in '.': pass
    I[k+'s']=[''.join(r) for r in g]
json.dump(I,open('/tmp/ec_icons.json','w'),ensure_ascii=False)
