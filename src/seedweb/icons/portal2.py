import json
S=json.load(open('/tmp/pshapes3.json'))
P={'˯':'#7a5a3a','˰':'#5e4430','˱':'#3a8fd6','˲':'#2d74b8','˳':'#e3d6a2','˴':'#c9b878','˵':'#3f8f2a','˶':'#2e6e1e','˷':'#8b8b8b','˸':'#6e6e6e','˹':'#7a2b2b','˺':'#5a1f1f'}
def shape_grid(name):
    g=S[name]["g"]; H=len(g); W=len(g[0]); k=2 if max(W,H)<=8 else 1
    if name.startswith('giant'): k=1
    ox=(16-W*k)//2; oy=max(0,(16-H*k)//2)
    grid=[['.']*16 for _ in range(16)]
    for r,row in enumerate(g):
        for c,ch in enumerate(row):
            if ch=='.': continue
            for dy in range(k):
                for dx in range(k):
                    x=ox+c*k+dx; y=oy+r*k+dy
                    if not(0<=x<16 and 0<=y<16): continue
                    if ch=='G': col='ˆ' if (dx,dy)==(0,0) else '˅' if (dx==k-1 and dy==k-1) else '˄'
                    else:
                        crying=((c*7+r*3)%5==0)
                        col=('˂' if (dx+dy)%2==0 else 'ˁ') if crying else ('ˀ' if (dx,dy)==(k-1,0) and k>1 else 'ʿ')
                        if k==1: col='ˁ' if crying else ('ˀ' if (c+r)%3==0 else 'ʿ')
                    grid[y][x]=col
    return grid
def variant(name,env,ug):
    g=shape_grid(name)
    frame={(x,y) for y in range(16) for x in range(16) if g[y][x]!='.'}
    bg=('˯','˰') if ug else ('˱','˲') if env==5 else None
    if bg:
        for y in range(16):
            for x in range(16):
                if g[y][x]=='.': g[y][x]=bg[0] if (x*3+y*5)%7 else bg[1]
        for y in range(16):
            for x in range(16):
                if (x in (0,15) or y in (0,15)) and (x,y) not in frame: g[y][x]='k'
    ground={1:('˳','˴'),4:('˷','˸'),6:('˹','˺'),0:None}.get(env)
    if ground and not bg:
        for y in (14,15):
            for x in range(16):
                if g[y][x]=='.': g[y][x]=ground[0] if (x+y)%3 else ground[1]
    if env in (2,3):
        top=sorted(frame,key=lambda p:(p[1],p[0]))
        for i,(x,y) in enumerate(top[:12:3]):
            for d in (1,2):
                if y+d<16 and g[y+d][x]=='.': g[y+d][x]='˵' if d==1 else '˶'
    # 상자 2×2: 오른쪽 아래 빈 곳
    for cx in (14,12,0):
        if all(g[y][x] in '.˳˴˷˸˹˺˯˰˱˲' for x in (cx,cx+1) for y in (14,15)):
            for (x,y,c) in [(cx,14,'b'),(cx+1,14,'b'),(cx,15,'B'),(cx+1,15,'y')]: g[y][x]=c
            break
    return [''.join(r) for r in g]
I={}
names=[f'portal_{i}' for i in range(1,11)]+[f'giant_portal_{i}' for i in range(1,4)]
for idx,name in enumerate(names):
    key=idx+1  # 1..10 보통, 11..13 거대
    for env in range(7):
        for ug in (0,1):
            if ug and env not in (0,4): continue
            I[f'rp_{key}_{env}_{ug}']=variant(name,env,ug)
json.dump({'P':P,'I':I},open('/tmp/portal_icons2.json','w'),ensure_ascii=False)
print(len(I))
