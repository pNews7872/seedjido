import json,re
t=open('/home/claude/seedweb/template2.html').read()
PIX=json.loads(re.search(r'const PIX = (.*?);\n', t).group(1))
P={'ˇ':0}
P={'˯':'#7a5a3a','˰':'#5e4430','˱':'#3a8fd6','˲':'#2d74b8','˳':'#e3d6a2','˴':'#c9b878','˵':'#3f8f2a','˶':'#2e6e1e','˷':'#8b8b8b','˸':'#6e6e6e','˹':'#7a2b2b','˺':'#5a1f1f','˻':'#6aa84a'}
def blank(): return [['.']*16 for _ in range(16)]
def blk2(g,kind,bx,by):
    for dy in range(2):
        for dx in range(2):
            if kind=='O': c='ˀ' if (dx,dy)==(1,0) else 'ʿ'
            elif kind=='C': c='˂' if (dx+dy)%2==0 else 'ˁ'
            else: c='ˆ' if (dx,dy)==(0,0) else '˅' if (dx,dy)==(1,1) else '˄'
            if 0<=by+dy<16 and 0<=bx+dx<16: g[by+dy][bx+dx]=c
def portal(giant):
    g=blank()
    if not giant:
        layout=["...G.","OOOCO","O...O","C...C","....O","O...O","C...O","OOC.O"]; ox=2; oy=0
    else:
        layout=["....G..","OOOCOOO","O.....C","O......","C.....O","O.....O","OOC.OOO"]; ox=1; oy=2
    for r,row in enumerate(layout):
        for c,ch in enumerate(row):
            if ch!='.': blk2(g,ch,ox+c*2,oy+r*2)
    return g
def variant(giant,env,ug):
    g=portal(giant)
    frame={(x,y) for y in range(16) for x in range(16) if g[y][x]!='.'}
    bg=None
    if ug: bg=('˯','˰')
    elif env==5: bg=('˱','˲')
    if bg:
        for y in range(16):
            for x in range(16):
                if g[y][x]=='.': g[y][x]=bg[0] if (x*3+y*5)%7 else bg[1]
        # 가장자리 한 칸 테두리
        for y in range(16):
            for x in range(16):
                if (x in (0,15) or y in (0,15)) and (x,y) not in frame: g[y][x]='k'
    ground={1:('˳','˴'),4:('˷','˸'),6:('˹','˺')}.get(env)
    if ground and not bg:
        for y in (14,15):
            for x in range(16):
                if g[y][x]=='.': g[y][x]=ground[0] if (x+y)%3 else ground[1]
    if env in (2,3):  # 정글·늪: 덩굴
        vines=[(3,2),(3,3),(3,4),(9,2),(9,3),(11,6),(11,7),(11,8),(5,2)] if not giant else [(2,4),(2,5),(2,6),(8,4),(8,5),(13,6),(13,7),(13,8),(5,4)]
        for x,y in vines:
            if (x,y) in frame or g[y][x]=='.': g[y][x]='˵' if (x+y)%2 else '˶'
    # 상자(2×2) 오른쪽 아래
    cx=12 if not giant else 13
    for (x,y,c) in [(cx,14,'b'),(cx+1,14,'b'),(cx,15,'B'),(cx+1,15,'y')]:
        if x<16: g[y][x]=c
    return [''.join(r) for r in g]
I={}
for giant in (0,1):
    for env in range(7):
        for ug in (0,1):
            if ug and env not in (0,4): continue
            I[f'12_{giant}_{env}_{ug}']=variant(giant,env,ug)
json.dump({'P':P,'I':I},open('/tmp/portal_icons.json','w'),ensure_ascii=False)
print(len(I))
