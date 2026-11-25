import math, random, sys
sys.path.insert(0,'/home/claude/seedweb/icons')
import v2
from PIL import Image
P=dict(v2.P); I={}
blank=v2.blank; out=v2.out; outline=v2.outline; place=v2.place
P.update({'ȧ':'#353535','ȁ':'#787878','ȃ':'#828282','ȅ':'#888888','ȇ':'#8c8c8c','ȉ':'#828298','ȋ':'#8c8ca2','ȍ':'#8e8ea4','ȏ':'#9191c4','ȑ':'#8f8fb3','ȓ':'#88889e',
 'ɐ':'#a77ae0','ɑ':'#c9a3f5','ɒ':'#7d4fc4','ɓ':'#5a3497','ɔ':'#efbfe6','ɕ':'#f1edc8',
 'ɖ':'#ffe24a','ɗ':'#ffc21c','ɘ':'#f39c12','ə':'#c86a0a','ɚ':'#8a4206','ɛ':'#2b1606','ɜ':'#fff7a8',
 'ɝ':'#5d8f3c','ɞ':'#4a7a2e','ɟ':'#6ea84a','ɠ':'#2f5520','ɡ':'#1e3514',
 'ɢ':'#e8e8e8','ɣ':'#cfcfcf','ɤ':'#b3b3b3','ɥ':'#2a2a2a','ɦ':'#5c5c5c',
 'ɧ':'#5c5c5c','ɯ':'#3a2a5a','ɰ':'#261a3d','ɱ':'#6a3cc0','ɨ':'#9c9c9c','ɩ':'#bababa','ɪ':'#747474','ɫ':'#494949','ɬ':'#6f7f88','ɭ':'#8c9b8c','ɮ':'#818181',
})
# 1 compass: flatter ellipse, shorter needle
g=blank()
for y in range(16):
    for x in range(16):
        d=((x-7.5)/7.4)**2+((y-7.5)/6.0)**2
        if d<=1: g[y][x]='k'
        if ((x-7.5)/6.4)**2+((y-7.5)/5.0)**2<=1: g[y][x]='γ'
        if ((x-7.5)/5.4)**2+((y-7.5)/4.1)**2<=1: g[y][x]='α'
for y in (6,7): g[y][7]=g[y][8]='δ'
for y in (8,9): g[y][7]=g[y][8]='ε'

I['spawn']=out(g)
# 2 amethyst cluster: faceted spikes
g=blank()
spikes=[(4.5,14,1.2,4,2.0),(11.5,14,13.8,4,2.0),(7.5,14,7.5,1,2.6),(5.8,14,3.4,8,1.6),(9.8,14,12.4,7.5,1.6)]
def inspike(x,y,s):
    bx,by,tx,ty,w=s
    L=math.hypot(tx-bx,ty-by); ux,uy=(tx-bx)/L,(ty-by)/L
    px,py=x+.5-bx,y+.5-by
    t=px*ux+py*uy; n=px*(-uy)+py*ux
    if t<0 or t>L: return None
    ww=w if t<L-w*1.6 else w*(L-t)/(w*1.6)
    if abs(n)>ww: return None
    return t/L, n/ max(w,0.01)
order=[0,1,3,4,2]
for i in order:
    s=spikes[i]
    for y in range(16):
        for x in range(16):
            r=inspike(x,y,s)
            if r is None: continue
            t,n=r
            if t>0.82: c='ɔ'
            elif n<-0.35: c='ɑ' if t>0.4 else 'ɐ'
            elif n<0.3: c='ɐ' if t>0.3 else 'ɒ'
            else: c='ɒ' if t>0.35 else 'ɓ'
            g[y][x]=c
for (y,x) in [(4,7),(9,4),(9,11)]:
    if g[y][x]!='.': g[y][x]='ɕ'
I['17']=out(outline(g))
# cage / cobble backgrounds from v2
cage=[r for r in v2.cage]; cob=v2.cob
# 4 silverfish: top view in dark badge over cage
g=[list(r) for r in cage]
bx0,by0,bw,bh=1,6,15,10
for y in range(by0,by0+bh):
    for x in range(bx0,bx0+bw):
        g[y][x]='k' if y in (by0,by0+bh-1) or x in (bx0,bx0+bw-1) else '-'
hh=[0.6,1.1,1.6,1.6,2.6,2.6,3.6,3.6,3.6,3.1,3.1,2.1,2.1]
sep={3,5,8,10}
cy=by0+5.0; ox=bx0+1
for i,h in enumerate(hh):
    X=ox+i
    for y in range(by0+1,by0+bh-1):
        dy=y+.5-cy
        if abs(dy)<=h:
            if i>=11: c='ɮ'
            elif i in sep: c='ɫ'
            elif abs(dy)<0.6: c='ɩ'
            elif abs(dy)>h-1: c='ɪ'
            else: c='ɨ'
            g[y][X]=c
g[int(cy)-2][ox+12]='k'; g[int(cy)+1][ox+12]='k'
for i in (4,7,9):
    g[int(cy-hh[i])-1][ox+i]='ɪ'; g[int(cy+hh[i])+1][ox+i]='ɪ'
g[int(cy)-2][ox+13]='ɪ'; g[int(cy)+1][ox+13]='ɪ'
I['101']=out(g)
# 5 blaze 8x8 face + rods
bl=["ɖɜɖɖɗɖɜɖ",
    "ɗɖɗɖɖɗɖɗ",
    "ɖɗɖɗɗɖɗɖ",
    "ɗɛɜɗɗɛɜɗ",
    "ɘɗɘɗɗɘɗɘ",
    "ɘəɘɛɛɘəɘ",
    "əɘəɘɘəɘə",
    "ɚəɚəəɚəɚ"]
badge=['k'*10]+['k'+r+'k' for r in bl]+['k'*10]
g=[list(r) for r in place(cage,badge,6,6)]
I['102']=out(g)
# 6 zombie face 8x8
zb=["ɠɠɡɠɠɠɡɠ",
    "ɠɞɠɠɞɠɠɞ",
    "ɝɟɝɝɝɞɟɝ",
    "ɝɝɝɟɝɝɝɝ",
    "ɝkkɝɝkkɝ",
    "ɝɝɝɞɞɝɝɝ",
    "ɝɝɞɠɠɞɝɝ",
    "ɞɝɝɝɝɝɝɞ"]
sk=["ɣɢɢɣɢɢɢɣ",
    "ɢɢɣɢɢɣɢɢ",
    "ɢɢɢɢɢɢɢɢ",
    "ɣɢɢɢɢɢɢɣ",
    "ɢɥɥɢɢɥɥɢ",
    "ɢɢɢɦɦɢɢɢ",
    "ɢɥɥɥɥɥɥɢ",
    "ɣɢɤɢɢɤɢɣ"]
mk=lambda f:['k'*10]+['k'+r+'k' for r in f]+['k'*10]
I['201_1']=place(cob,mk(zb),6,6); I['201']=I['201_1']
I['201_0']=place(cob,mk(sk),6,6)
# 9 fortress revert
import newicons
I['18']=newicons.ICONS['18']
# 11 ruined portal: full rectangle 4x5 blocks of 3px, gold top, one missing block
cells=["OGOO",
       "OPPC",
       "OPP.",
       "CPPO",
       "OOOO"]
g=blank()
for r,row in enumerate(cells):
    for c,ch in enumerate(row):
        for dy in range(3):
            for dx in range(3):
                y=r*3+dy+1-1; x=c*3+dx+2
                if ch=='O': g[y][x]='ɯ' if (dx+dy+r+c)%3 else 'ɰ'
                elif ch=='C': g[y][x]='ɱ' if (dx+dy)%2==0 else 'ɯ'
                elif ch=='G': g[y][x]='Ν' if (dx+dy)%3 else 'Ξ'
                elif ch=='P': g[y][x]='Μ' if (x+y)%3 else 'p'
I['12']=out(outline(g))
# 12 nether fossil: spine at bottom, 3+3 ribs rising like ((( )))
g=blank()
ribs=[[(6,12),(5,11),(5,10),(5,9),(5,8),(5,7),(5,6),(5,5),(6,4),(6,3)],
      [(4,12),(3,11),(3,10),(3,9),(3,8),(3,7),(3,6),(4,5)],
      [(2,12),(1,11),(1,10),(1,9),(1,8),(2,7)]]
for rb in ribs:
    for x,y in rb:
        g[y][x]='Ο'; g[y][15-x]='Ο'
    x,y=rb[0]; g[y][x]='Π'; g[y][15-x]='Π'
for x in range(1,15): g[13][x]='Ο' if x%2 else 'Π'
F=[r[:] for r in g]
for y in range(16):
    for x in range(16):
        if F[y][x]=='.':
            L=any(F[y][i]!='.' for i in range(0,x)); R=any(F[y][i]!='.' for i in range(x+1,16))
            if L and R and y>=3: g[y][x]='Ρ' if False else '.'
I['20']=out(outline([r[:] for r in g]))
# 13 elytra from reference
im=Image.open('/mnt/user-data/uploads/f80f7702-image.png').convert('RGB')
em={'353535':'ȧ','888888':'ȅ','9191c4':'ȏ','787878':'ȁ','828282':'ȃ','9191c3':'ȏ','828298':'ȉ','8c8ca2':'ȋ','8e8ea4':'ȍ','9090bd':'ȏ','8c8c8c':'ȇ','88889e':'ȓ','8f8fb3':'ȑ'}
rows=[]
for y in range(16):
    r=''
    for x in range(16):
        h='%02x%02x%02x'%im.getpixel((int((x+.5)*150/16),int((y+.5)*150/16)))
        r+='.' if h=='000000' else em[h]
    rows.append(r)
I['121']=rows
# 15 caves: hill with opening
def hill(big):
    g=blank()
    for y in range(16):
        for x in range(16):
            top=4+0.09*(x-7.5)**2 if not big else 2+0.07*(x-7.5)**2
            if y>=top and y<=14:
                d=y-top
                g[y][x]='ϒ' if d<1 else 'ϔ' if d<2 else ('ϣ' if (x*7+y*3)%5 else 'Ϥ')
                if d<1 and (x%2): g[y][x]='ϓ'
    if not big:
        hole=[(13,6,9),(12,6,9),(11,7,8),(10,7,8)]
        for y,a,b in hole:
            for x in range(a,b+1): g[y][x]='x'
        for x in range(6,10): g[14][x]='x'
    else:
        for y in range(5,15):
            w=[0,3,4,5,5,6,6,6,6,6][y-5]
            for x in range(int(7.5-w)+1,int(7.5+w)+1): g[y][x]='x'
        for x,y in [(4,9),(11,9),(7,7),(8,7),(5,7),(10,7)]:
            if g[y][x]=='x' and g[y-1][x]!='x': g[y][x]='Ϥ'
        for x,y in [(6,8),(9,8)]: g[y][x]='Ϥ' if g[y-1][x]!='x' else g[y][x]
    return out(outline(g))
I['200']=hill(False); I['200_big']=hill(True)
# 15 underground lava lake: deepslate pocket with flat lava
random.seed(11)
g=blank()
for y in range(1,15):
    for x in range(1,15):
        g[y][x]=random.choice('ϙϙϚϛϙϚ')
for y in range(4,12):
    for x in range(3,13):
        if ((x-7.5)/5.2)**2+((y-8)/4.2)**2<=1: g[y][x]='x'
for y in range(8,13):
    for x in range(2,14):
        if g[y][x]=='x' or (y==8 and ((x-7.5)/5.2)**2<=1):
            g[y][x]='ϗ' if y==8 and x%3==1 else 'ϖ' if y<10 else 'Ϙ' if (x+y)%3==0 else 'ϖ'
I['202']=out(outline(g))
# surface lava pool: top-down grass with lava blob
random.seed(4)
g=blank()
for y in range(1,15):
    for x in range(1,15):
        g[y][x]=random.choice('ϓϓϒϓϒϓ')
for y in range(3,13):
    for x in range(3,13):
        d=((x-7.5)/5.0)**2+((y-8)/4.3)**2
        if d<=1.0: g[y][x]='ϣ' if d>0.62 else 'ϖ'
for y in range(3,13):
    for x in range(3,13):
        if g[y][x]=='ϖ':
            if (x*5+y*3)%7==0: g[y][x]='ϗ'
            elif (x+2*y)%5==0: g[y][x]='Ϙ'
I['203']=out(outline(g))
for k,v in I.items():
    assert len(v)==16 and all(len(r)==16 for r in v),(k,[len(r) for r in v])
    for r in v:
        for c in r: assert c=='.' or c in P or c in 'kxbOpsI-+12$)%^', (k,c)

# silverfish: back to v2 side view
I['101']=v2.I['101']
# bastions: shared style (noisy blackstone, gray basalt drips on top, gold accent)
P.update({'ʙ':'#383340','ʚ':'#2b2731','ʛ':'#46404d','ʜ':'#6b6870','ʝ':'#8d8a91','ʞ':'#f0c020','ʟ':'#ff7a1a','ʠ':'#ffb03a'})
def bast(rects, seed):
    rnd=random.Random(seed); g=blank()
    for (x0,y0,x1,y1) in rects:
        for y in range(y0,y1+1):
            for x in range(x0,x1+1): g[y][x]=rnd.choice('ʙʙʚʛʙ')
    # gray drips: top 2 rows of each rect + random drips down
    for (x0,y0,x1,y1) in rects:
        for x in range(x0,x1+1):
            if g[y0-1][x]!='.' if y0>0 else False: continue
            g[y0][x]=rnd.choice('ʜʝʜ')
            d=rnd.choice([0,1,1,2,3])
            for k in range(1,d+1):
                if y0+k<=y1: g[y0+k][x]='ʜ'
        # crenellation notches
        for x in range(x0+1,x1,3):
            if rnd.random()<0.6: g[y0][x]='.'
    return g
def fin(g): return out(outline(g))
# treasure room: left tall tower + big cube with lava grate on top
g=bast([(1,1,5,15),(5,6,15,15)],1)
for x in range(6,15):
    for y in (6,7,8):
        g[y][x]='ʚ' if (x-y)%3==0 else 'ʟ'
g[11][9]='ʞ'; g[11][10]='ʞ'
I['19_2']=fin(g)
# bridge: castle right, deck to the left on two pillars, lava fall
g=bast([(7,1,15,13),(0,7,7,8)],2)
for y in range(9,16):
    for x in (1,5): g[y][x]='ʛ' if y%2 else 'ʙ'
for y in range(3,11): g[y][11]='ʟ' if y%3 else 'ʠ'
g[6][0]='ʞ'; g[6][1]='ʞ'
I['19_3']=fin(g)
# housing units: L shape, tall tower right, low block left, magma dots
g=bast([(8,0,15,15),(0,8,8,15)],3)
for (x,y) in [(2,10),(5,12),(11,6),(13,11)]: g[y][x]='ʟ'
g[9][4]='ʞ'
I['19_0']=fin(g)
# hoglin stables: two towers on top of a wide stepped body
g=bast([(1,1,6,8),(10,1,14,8),(0,8,15,15)],4)
for x in range(2,15): 
    if g[7][x] not in 'ʜʝ': pass
for y in range(10,16):
    for x in (0,1): g[y][x]=g[y][x]
g[9][7]='ʞ'; g[9][8]='ʞ'
I['19_1']=fin(g)
I['19']=I['19_2']

for k,v in I.items():
    assert len(v)==16 and all(len(r)==16 for r in v),k

# silverfish: sprite-based (from user's reference) over cage
cm={'5c5c5c':'ɧ','9c9c9c':'ɨ','bababa':'ɩ','000000':'k','747474':'ɪ','494949':'ɫ','5b6c76':'ɬ','8c9b8c':'ɭ','788e9b':'ɬ','818181':'ɮ'}
g=[list(r) for r in cage]
for y,r in enumerate(body if 'body' in dir() else []):
    pass
im=Image.open('/mnt/user-data/uploads/a1f9721e-image.png').convert('RGB')
spr=[]
for y in range(18):
    r=''
    for x in range(18):
        h='%02x%02x%02x'%im.getpixel((x*10+5,y*10+5))
        r+='.' if h=='ffffff' else cm[h]
    spr.append(r)
sb=[r[1:17] for r in spr[7:18]]
sb=[r.replace('ɬ','.') if i<2 else r for i,r in enumerate(sb)]
for y,r in enumerate(sb):
    for x,c in enumerate(r):
        if c!='.': g[5+y][x]=c
I['101']=out(g)
# bastion loot badges (bottom-right, like spawners)
P.update({'ʡ':'#5a4f53','ʢ':'#3a3236','ʣ':'#9a8a8e','ʤ':'#a01818','ʥ':'#e04848','ʦ':'#5a1010',
          'ʧ':'#c98a6a','ʨ':'#8a5a40','ʩ':'#f0e8d8','ʪ':'#fff27a','ʫ':'#b07d12'})
loot={
 '19_2':["ʡʡʡʡʡʡ","ʡʢʣʢʢʡ","ʡʢʢʣʢʡ","ʡʣʢʢʣʡ","ʡʢʣʣʢʡ","ʡʡʡʡʡʡ"],   # 네더라이트 강화 형판
 '19_3':["ʪʪʪʪʪʞ","ʪʞʞʞʞʫ","ʪʞʪʞʞʫ","ʪʞʞʞʞʫ","ʪʞʞʞʫʫ","ʞʫʫʫʫʫ"],   # 금 블록
 '19_0':["--ʥ---","-ʥʤʤ-ʥ"[:6],"-ʤʤʦʥʤ","--ʦʤʤʦ","-ʦ-ʦ--","ʦ--ʦ--"],  # 네더 사마귀
 '19_1':["ʨʧʧʧʧʨ","ʧkʧʧkʧ","ʧʧʧʧʧʧ","ʩʧʨʨʧʩ","ʩʨkkʨʩ","ʨʨʨʨʨʨ"],   # 호글린
}
for k,inner in loot.items():
    inner=[(r+'------')[:6] for r in inner]
    badge=['k'*8]+['k'+r+'k' for r in inner]+['k'*8]
    I[k]=place(I[k],badge,8,8)
I['19']=I['19_2']
for k,v in I.items():
    assert len(v)==16 and all(len(r)==16 for r in v),k

# ---- bastions shrunk to 13x13 (like spawner cage) + 9x9 loot badge at (7,7)
def bast2(rects, seed):
    g=bast(rects, seed)
    return g
def badge9(inner):
    inner=[(r+'-------')[:7] for r in inner]
    return ['k'*9]+['k'+r+'k' for r in inner]+['k'*9]
L7={
 'tpl':["-ʣʣʣʣʣ-","ʣʢʢʢʢʢʣ","ʣʢʡʡʡʢʣ","ʣʢʡʣʡʢʣ","ʣʢʡʡʡʢʣ","ʣʢʢʢʢʢʣ","-ʣʣʣʣʣ-"],
 'gold':["ʪʪʪʪʪʪʞ","ʪʞʞʞʞʞʫ","ʪʞʪʪʞʞʫ","ʪʞʪʞʞʞʫ","ʪʞʞʞʞʞʫ","ʪʞʞʞʞʫʫ","ʞʫʫʫʫʫʫ"],
 'wart':["--ʥ--ʥ-","-ʥʤʤ-ʤʥ","ʥʤʤʥʤʤ-","ʤʤʦʤʤʦ-","-ʦ-ʦʤ--","-ʦ--ʦ--","ʦ--ʦ---"],
 'hog':["ʨʧʧʧʧʧʨ","ʧkʧʧʧkʧ","ʧʧʧʧʧʧʧ","ʩʨʧʧʧʨʩ","ʩʨkʨkʨʩ","ʧʨʨʨʨʨʧ","ʨʧʧʧʧʧʨ"],
}
L7={k:[r[:7] for r in v] for k,v in L7.items()}
# treasure
g=bast([(1,1,4,11),(4,5,11,11)],1)
for x in range(5,11):
    for y in (5,6):
        g[y][x]='ʚ' if (x-y)%3==0 else 'ʟ'
I['19_2']=place(out(outline(g)),badge9(L7['tpl']),7,7)
# bridge
g=bast([(6,1,11,10),(1,5,6,6)],2)
for y in range(7,12):
    for x in (1,4): g[y][x]='ʛ' if y%2 else 'ʙ'
for y in range(3,9): g[y][9]='ʟ' if y%3 else 'ʠ'
g[4][1]='ʞ'; g[4][2]='ʞ'
I['19_3']=place(out(outline(g)),badge9(L7['gold']),7,7)
# housing
g=bast([(6,1,11,11),(1,6,6,11)],3)
for (x,y) in [(2,8),(4,10),(8,4),(10,6)]: g[y][x]='ʟ'
g[7][3]='ʞ'
I['19_0']=place(out(outline(g)),badge9(L7['wart']),7,7)
# hoglin stables
g=bast([(1,1,4,6),(8,1,11,6),(1,6,11,11)],4)
g[8][5]='ʞ'; g[8][6]='ʞ'
I['19_1']=place(out(outline(g)),badge9(L7['hog']),7,7)
I['19']=I['19_2']
for k,v in I.items():
    assert len(v)==16 and all(len(r)==16 for r in v),k

# ---- v4 bastions: full 16x16 buildings, features kept outside bottom-right badge
P.update({'ʬ':'#652828','ʭ':'#723232','ʮ':'#854242','ʯ':'#340e0e','ʰ':'#511515','ʱ':'#209ab8','ʲ':'#60e8e8','ʳ':'#4bc9c9',
          'ʴ':'#be3f4a','ʵ':'#a62530','ʶ':'#5c141a','ʷ':'#4e1116'})
L7['tpl']=[".ʬʭʭʭʬ.",
           "ʬʭʮʱʮʭʯ",
           "ʬʭʱʲʱʭʯ",
           "ʬʱʲʲʳʱʯ",
           "ʬʭʮʳʮʭʯ",
           "ʯʰʭʭʭʰʯ",
           ".ʯʯʯʯʯ."]
L7['wart']=["-ʴʵ-ʵʶ-",
            "-ʵʵ-ʶʷ-",
            "-ʶʷʵʶ-ʵ",
            "ʴʵʶʶʷ-ʴ",
            "ʷʶʶʴʵʶʶ",
            "-ʵʷʶʶ--",
            "-ʶʷ-ʵʶ-"]
L7={k:[(r.replace('.','-')+'-------')[:7] for r in v] for k,v in L7.items()}
def mk(g,key): return place(out(outline(g)),badge9(L7[key]),7,7)
# treasure: tall tower left, big cube right with lava grate top
g=bast([(1,0,5,15),(5,4,15,15)],1)
for x in range(6,15):
    for y in (4,5):
        g[y][x]='ʚ' if (x-y)%3==0 else 'ʟ'
I['19_2']=mk(g,'tpl')
# bridge: castle top-right, deck floating on two thin pillars, open space underneath
g=bast([(9,0,15,8),(0,4,9,5)],2)
for y in range(6,16):
    for x in (1,5): g[y][x]='ʛ' if y%2 else 'ʙ'
for y in range(1,7): g[y][12]='ʟ' if y%3 else 'ʠ'
g[3][1]='ʞ'; g[3][2]='ʞ'
I['19_3']=mk(g,'gold')
# housing: tall tower left, ruined low wing to the right, magma dots
g=bast([(1,0,6,15),(6,5,15,15)],3)
for (x,y) in [(3,4),(2,11),(9,6),(13,7)]: g[y][x]='ʟ'
for x in (8,11,14): g[5][x]='.'
I['19_0']=mk(g,'wart')
# hoglin: two towers over a wide body
g=bast([(1,0,5,6),(10,0,14,6),(0,6,15,15)],4)
I['19_1']=mk(g,'hog')
I['19']=I['19_2']
for k,v in I.items():
    assert len(v)==16 and all(len(r)==16 for r in v),k

# ---- round 5
P.update({'ʸ':'#cfa0f3','ʹ':'#fecbe6','ʺ':'#b38ef3','ʻ':'#8d6acc','ʼ':'#fffdd5','ʽ':'#7a5bb5','ʾ':'#64479e'})
am=["................",".......A........","......ABC.......",".....AABDA......","....AAABDDA.....","....ABEECDA.....","....FCCAFDF.....","....FDCAFDG.....","BBA..FDAFFG..ABB","ABBA.FFCFFG.ABBA","ADEAAGFDCF.AAEDA","ADDBFGFFCGDDADDA",".ADFAFGFDGFAFDA.","..AFFFFGDGDFFD..","...DFGFGADGFD...","...FGGGDAGGGF..."]
mp=dict(zip('ABCDEFG','ʸʹʺʻʼʽʾ'))
I['17']=out(outline([[mp.get(c,'.') for c in r] for r in am]))
# fortress: square tower top
f=[r for r in newicons.ICONS['18']]
f[1]="kkkkkk.........."
f[2]="k1111k.........."
f[3]="k1kk1k.........."
f[4]="k1kk1k.........."
f[5]="k2111k.........."
I['18']=f
# ruined portal: 3px square blocks, gold block on top of frame, whole-block gaps, no inner outline
P.update({'ʿ':'#15101f','ˀ':'#2a1f3d','ˁ':'#3d2c5a','˂':'#7a3ad0','˃':'#a35ae0','˄':'#f6d23a','˅':'#c99a12','ˆ':'#fff08a'})
layout=["..G.",
        "OOCO",
        "O..C",
        "...O",
        "OCOO"]
g=blank()
def blk(kind,bx,by):
    for dy in range(3):
        for dx in range(3):
            x=bx+dx; y=by+dy
            if kind=='O': c='ʿ' if (dx,dy) in ((0,0),(2,1),(1,2)) else 'ˀ' if (dx+dy)%2 else 'ʿ'
            elif kind=='C': c='˂' if (dx,dy) in ((1,1),(0,2),(2,0)) else 'ˁ'
            else: c='ˆ' if (dx,dy)==(0,0) else '˅' if dx==2 or dy==2 else '˄'
            g[y][x]=c
for r,row in enumerate(layout):
    for c,ch in enumerate(row):
        if ch!='.': blk(ch,2+c*3,r*3)
I['12']=out(g)
# nether fossil: classic fish-skeleton fossil
P.update({'ˇ':'#efe6cf','ˈ':'#cfc3a4','ˉ':'#a99a78'})
g=blank()
cy=8
for x in range(2,12): g[cy][x]='ˇ' if x%2 else 'ˈ'
# ribs: lean toward tail
for x,L in [(4,3),(6,4),(8,4),(10,4)]:
    for k in range(1,L+1):
        xx=x-(1 if k>=3 else 0)
        g[cy-k][xx]='ˇ'; g[cy+k][xx]='ˇ'
# tail fin (forked)
for k,(x) in enumerate([2,1,0]):
    g[cy-1-k][x]='ˈ'; g[cy+1+k][x]='ˈ'
# skull
skull=[(12,6),(13,6),(12,7),(13,7),(14,7),(12,8),(14,8),(15,8),(12,9),(13,9),(14,9),(12,10),(13,10)]
for x,y in skull: g[y][x]='ˇ'
g[8][13]='k'
I['20']=out(outline(g))

# ---- round 6
# amethyst: drop outer columns 1,14 and row 7 so a full outline fits
am2=[r[0]+r[2:14]+r[15] for i,r in enumerate(am) if i not in (0,7)]
am2=['.'+r+'.' for r in am2]          # 16 wide
am2=['.'*16]+am2                       # 15 rows -> add top
am2=am2+['.'*16]*(16-len(am2))
# shift so content is in rows 1..14
I['17']=out(outline([[mp.get(c,'.') for c in r] for r in am2]))
# fortress options
F={}
F['A']=newicons.ICONS['18']
F['B']=I['18']
F['C']=["......kkkk......",
        "......k12k......",
        "......k11k......",
        "kkkkkkk21kkkkkkk",
        "k11211121112111k",
        "k21112111211121k",
        "kkkkkkk11kkkkkkk",
        ".k1k..k12k..k1k.",
        ".k1k..k11k..k1k.",
        ".k2k..k21k..k2k.",
        ".k1k..k11k..k1k.",
        ".k1k..k12k..k1k.",
        ".k2k..k11k..k2k.",
        ".k1k..k21k..k1k.",
        ".k1k..k11k..k1k.",
        ".kkk..kkkk..kkk."]
F['D']=["................",
        "kkkkkk..........",
        "k1k1k1k.........",
        "k11111k.........",
        "k1kk11k.........",
        "k11111k.........",
        "kkkkkkkkkkkkkkkk",
        "k11211121112111k",
        "k21112111211121k",
        "kkkkkkkkkkkkkkkk",
        ".k1kk.....kk1k..",
        ".k1k1k...k1k1k..",
        ".k1kk1kkk1kk1k..",
        ".k2k.k111k.k2k..",
        ".k1k.......k1k..",
        ".kkk.......kkk.."]
for k,v in F.items(): I['18_'+k]=v
# ruined portal: 2px square blocks, frame 5x7 (inner 3x5), gold on top
layout=["...G.",
        "OOOCO",
        "O...O",
        "C...C",
        "....O",
        "O...O",
        "C...O",
        "OOC.O"]
g=blank()
def blk2(kind,bx,by):
    for dy in range(2):
        for dx in range(2):
            if kind=='O': c='ˀ' if (dx,dy)==(1,0) else 'ʿ'
            elif kind=='C': c='˂' if (dx+dy)%2==0 else 'ˁ'
            else: c='ˆ' if (dx,dy)==(0,0) else '˅' if (dx,dy)==(1,1) else '˄'
            g[by+dy][bx+dx]=c
for r,row in enumerate(layout):
    for c,ch in enumerate(row):
        if ch!='.': blk2(ch,3+c*2,r*2)
I['12']=out(g)
# dinosaur ribcage fossil: spine on the ground, ribs rising and curving over
g=blank()
for x in range(1,15): g[13][x]='ˇ' if x%2 else 'ˈ'
for x in range(2,15,2): g[14][x]='ˉ'
for x0,h in [(2,5),(5,8),(8,10),(11,8),(14,5)]:
    pts=[(x0,13-k) for k in range(1,h-2)]
    pts+=[(x0-1,13-h+2),(x0-1,13-h+1),(x0-2,13-h)]
    for x,y in pts:
        if 0<=x<16: g[y][x]='ˇ'
# skull on the right ground
I['20']=out(outline(g))
g=blank()
for x in range(0,16): g[13][x]='ˇ' if x%2 else 'ˈ'
for x in range(1,16,3): g[14][x]='ˉ'
for x0,h in [(1,6),(5,9),(9,10),(13,7)]:
    top=13-h
    for y in range(top,13):
        t=(13-y)/h
        off=0 if t<0.55 else -1 if t<0.85 else -2
        w=2 if t<0.85 else 1
        for dx in range(w):
            x=x0+off+dx+ (1 if w==1 else 0)
            if 0<=x<16: g[y][x]='ˇ' if dx==0 else 'ˈ'
I['20']=out(outline(g))
g=blank()
for x in range(0,16): g[13][x]='ˇ' if x%2 else 'ˈ'
for x in range(1,16,3): g[14][x]='ˉ'
for x0,h,rx in [(4,6,3),(8,9,3.5),(12,10,3.5),(15,7,3)]:
    for k in range(300):
        t=math.radians(95*k/299)
        x=x0-rx*(1-math.cos(t)); y=12.99-h*math.sin(t)
        xi,yi=int(round(x-.01)),int(y)
        if 0<=xi<16 and 0<=yi<16:
            g[yi][xi]='ˇ'
            if t<math.radians(45) and xi-1>=0 and g[yi][xi-1]=='.' : g[yi][xi-1]='ˈ'
I['20']=out(outline(g))
g=blank()
for x in range(1,16): g[13][x]='ˇ' if x%2 else 'ˈ'
for x in range(2,16,3): g[14][x]='ˉ'
for x0,h in [(3,6),(7,9),(11,10),(15,7)]:
    offs=[0]*(h-4)+[-1,-1,-2,-3]
    for i,o in enumerate(offs):
        y=12-i; x=x0+o
        g[y][x]='ˇ'
        if i<h-4 and x0+1<16 and i<3: g[y][x0-1]='ˈ'
I['20']=out(outline(g))
def qb(p0,p1,p2,n=200):
    return [((1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0],(1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]) for t in [i/n for i in range(n+1)]]
# option A: ribcage lying on its back, nested U ribs rising from spine
g=blank()
for x in range(2,14): g[14][x]='ˈ' if x%2 else 'ˇ'
for a,b in [(7.0,12),(4.6,8.5),(2.3,5)]:
    for s in (-1,1):
        for x,y in qb((7.5+s*0.6,13.6),(7.5+s*a*1.35,13.6-b*0.35),(7.5+s*(a-1.6),13.6-b)):
            xi=int(x); yi=int(y)
            if 0<=xi<16 and 0<=yi<16: g[yi][xi]='ˇ'
I['20_A']=out(outline(g))
# option B: nether fossil as in game (bone-block arches)
g=blank()
def box(x0,y0,x1,y1,c):
    for y in range(y0,y1+1):
        for x in range(x0,x1+1): g[y][x]=c
for x0,top,bot in [(1,5,13),(6,7,15),(11,6,14)]:
    box(x0,top,x0+2,bot,'ˇ'); box(x0+2,top,x0+2,bot,'ˈ')
for x0,y0 in [(2,2),(7,4),(12,3)]:
    box(x0,y0,x0+2,y0+2,'ˇ'); box(x0+2,y0,x0+2,y0+2,'ˈ'); g[y0+1][x0+1]='ˉ'
box(4,3,6,4,'ˇ'); box(9,4,11,5,'ˇ')
I['20_B']=out(outline(g))

# ---- round 7
fA=newicons.ICONS['18']; fD=F['D']
I['18']=fD[:6]+fA[6:]
# fossil: 3 rib arches (∩) in a row, back ones offset up-right, spine on top
g=blank()
def arch(ox,oy,front):
    W,H=8,9
    for y in range(H):
        for x in range(W):
            leg = x<2 or x>=W-2
            top = y<2
            if not (leg or top): continue
            if y==0: c='ˇ'
            elif top: c='ˈ' if front else 'ˉ'
            else: c='ˇ' if (x in (0,W-2)) else 'ˈ' if front else 'ˉ'
            g[oy+y][ox+x]=c
    # feet hooks outward
    g[oy+H-1][ox-1]='ˈ'; g[oy+H-1][ox+W]='ˈ'
arches=[(6,1),(4,4),(2,7)]
for i,(ox,oy) in enumerate(arches):
    G=[r[:] for r in g]
    # clear area for this arch then draw outline around it to separate layers
    arch(ox,oy,i==len(arches)-1)
    for y in range(16):
        for x in range(16):
            if g[y][x]!='.' and G[y][x]==g[y][x] and False: pass
    # outline ring around this arch over previous ones
    A=[[1 if (oy<=y<oy+9 and ox-1<=x<=ox+8 and g[y][x]!='.' and (G[y][x]!=g[y][x] or (x<ox+2 or x>=ox+6 or y<oy+2))) else 0 for x in range(16)] for y in range(16)]
    for y in range(16):
        for x in range(16):
            if A[y][x]: continue
            if G[y][x]!='.' and any(0<=y+a<16 and 0<=x+b<16 and A[y+a][x+b] for a,b in ((0,1),(0,-1),(1,0),(-1,0))):
                if not (oy<=y<oy+9 and ox-1<=x<=ox+8): g[y][x]='k'
                elif x>=ox+2 and x<ox+6 and y>=oy+2: g[y][x]='k'
I['20']=out(outline(g))
g=blank()
def arch2(ox,oy,W=7,H=9,shade=0):
    cells={}
    for y in range(H):
        for x in range(W):
            leg = x<2 or x>=W-2; top=y<2
            if not(leg or top): continue
            if y==0 or (x in (0,W-2) and y>=1): c='ˇ'
            else: c='ˈ' if shade==0 else 'ˉ'
            cells[(ox+x,oy+y)]=c
    cells[(ox-1,oy+H-1)]='ˈ'; cells[(ox+W,oy+H-1)]='ˈ'
    for (x,y),c in cells.items(): g[y][x]=c
    for (x,y) in list(cells):
        for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
            X,Y=x+b,y+a
            if 0<=X<16 and 0<=Y<16 and (X,Y) not in cells and g[Y][X]!='.':
                g[Y][X]='k'
for i,(ox,oy) in enumerate([(8,1),(5,3),(2,5)]):
    arch2(ox,oy,shade=0 if i==2 else 1)
I['20']=out(outline(g))
g2=[list(r) for r in I['20']]
for (x,y) in [(4,4),(7,2),(10,0)]:
    g2[y][x]='ˇ'; g2[y][x+1]='ˈ'
I['20']=out(g2)
# fossil v3: 2 ribs, uniform 2px thickness ring opened at the bottom
g=blank()
def rib(ox,oy,shade,W=11,H=10):
    cx,cy=(W-1)/2,(H-1)/2
    inside=lambda x,y: 0<=x<W and 0<=y<H and (abs((x-cx)/(W/2))**3+abs((y-cy)/(H/2))**3)<=1
    cells={}
    for y in range(H):
        for x in range(W):
            if not inside(x,y): continue
            # keep if within 2 px (chebyshev) of outside
            edge=any(not inside(x+dx,y+dy) for dx in (-2,-1,0,1,2) for dy in (-2,-1,0,1,2) if max(abs(dx),abs(dy))<=2 and abs(dx)+abs(dy)<=2)
            if not edge: continue
            if y>=H-2 and abs(x-cx)<=1.5: continue     # opening at bottom
            d1=any(not inside(x+dx,y+dy) for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)))
            cells[(ox+x,oy+y)]='ˇ' if d1 else ('ˈ' if shade==0 else 'ˉ')
    for (x,y),c in cells.items():
        if 0<=x<16 and 0<=y<16: g[y][x]=c
    for (x,y) in list(cells):
        for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
            X,Y=x+b,y+a
            if 0<=X<16 and 0<=Y<16 and (X,Y) not in cells and g[Y][X]!='.': g[Y][X]='k'
for i,(ox,oy) in enumerate([(4,1),(1,5)]):
    rib(ox,oy,0 if i==1 else 1)
I['20']=out(outline(g))
# spine connecting the two rib tops
g=[list(r) for r in I['20']]
sp={}
for k in range(0,61):
    t=k/60; x=5.6+(11.2-5.6)*t; y=5.6-(5.6-0.2)*t
    xi,yi=int(x),int(y)
    sp[(xi,yi)]='ˇ'; sp[(xi+1,yi)]='ˈ'
for (x,y),c in sp.items():
    if 0<=x<16 and 0<=y<16: g[y][x]=c
for (x,y) in list(sp):
    for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
        X,Y=x+b,y+a
        if 0<=X<16 and 0<=Y<16 and (X,Y) not in sp: g[Y][X]='k'
I['20']=out(g)
# fossil v4: unified bone = 2 ribs + spine as one piece
def ribcells(ox,oy,W=11,H=10):
    cx,cy=(W-1)/2,(H-1)/2
    inside=lambda x,y: 0<=x<W and 0<=y<H and (abs((x-cx)/(W/2))**3+abs((y-cy)/(H/2))**3)<=1
    S=set()
    for y in range(H):
        for x in range(W):
            if not inside(x,y): continue
            if all(inside(x+dx,y+dy) for dx in (-2,-1,0,1,2) for dy in (-2,-1,0,1,2) if abs(dx)+abs(dy)<=2): continue
            if y>=H-2 and abs(x-cx)<=1.5: continue
            S.add((ox+x,oy+y))
    return S
back=ribcells(4,1); front=ribcells(1,5)
spine=set()
for k in range(61):
    t=k/60; x=5.6+(10.6-5.6)*t; y=5.0-(5.0-0.6)*t
    spine.add((int(x),int(y))); spine.add((int(x)+1,int(y)))
spine-=front
allc=back|front|spine
g=blank()
def shade(x,y,dark):
    up=(x,y-1) not in allc or (x-1,y) not in allc
    return ('ˈ' if up else 'ˉ') if dark else ('ˇ' if up else 'ˈ')
for (x,y) in back-front-spine: g[y][x]='ˈ'
for (x,y) in spine: g[y][x]='ˇ'
for (x,y) in front: g[y][x]='ˇ'
# separate front rib from back rib only (not from spine)
for (x,y) in front:
    for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
        X,Y=x+b,y+a
        if (X,Y) in back and (X,Y) not in spine and (X,Y) not in front: g[Y][X]='k'
I['20']=out(outline(g))
# fossil v5: rings + spine bridging the two top bars, joined seamlessly
g=blank()
for (x,y) in back: g[y][x]='ˈ' if ((x,y-1) in back) else 'ˇ'
for (x,y) in front: g[y][x]='ˇ' if ((x,y-1) not in front or (x-1,y) not in front) else 'ˈ'
for (x,y) in front:
    for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
        X,Y=x+b,y+a
        if (X,Y) in back and (X,Y) not in front: g[Y][X]='k'
sp=set()
for k in range(81):
    t=k/80; x=6.0+(10.0-6.0)*t; y=5.2-(5.2-1.0)*t
    sp.add((int(x),int(y))); sp.add((int(x)+1,int(y)))
for (x,y) in sp: g[y][x]='ˇ' if (x,y-1) not in sp else 'ˈ'
for (x,y) in sp:
    for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
        X,Y=x+b,y+a
        if (X,Y) in sp or (X,Y) in front: continue
        if (X,Y) in back and (abs(X-10)+abs(Y-1))<=2: continue
        if 0<=X<16 and 0<=Y<16: g[Y][X]='k'
I['20']=out(outline(g))
# fossil v6: approved ring style; rings spread apart; spine joins the tops seamlessly
back=ribcells(5,0); front=ribcells(1,5)
g=blank()
def paint(S,dark):
    for (x,y) in S:
        cx=sum(p[0] for p in S)/len(S); cy=sum(p[1] for p in S)/len(S)
        # outer cells (touching outside of ring bbox interior) lit
        g[y][x]=('ˈ' if dark else 'ˇ')
paint(back,True)
for (x,y) in back:
    # inner edge darker
    pass
# back ring: lighter outer edge
for (x,y) in back:
    nb=[(x+1,y),(x-1,y),(x,y+1),(x,y-1)]
    g[y][x]='ˈ' if all(n in back for n in nb[:2]) or True else 'ˈ'
# outline back ring
def ring_outline(S):
    for (x,y) in S:
        for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
            X,Y=x+b,y+a
            if 0<=X<16 and 0<=Y<16 and (X,Y) not in S: g[Y][X]='k'
ring_outline(back)
# spine between tops
sp=set()
for k in range(101):
    t=k/100; x=5.6+(9.6-5.6)*t; y=5.0-(5.0-0.0)*t
    sp.add((int(round(x)),int(round(y)))); sp.add((int(round(x))+1,int(round(y))))
sp-=front
for (x,y) in sp: g[y][x]='ˇ'
for (x,y) in sp:
    for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
        X,Y=x+b,y+a
        if (X,Y) in sp or (X,Y) in front or (X,Y) in back: continue
        if 0<=X<16 and 0<=Y<16: g[Y][X]='k'
# front ring on top
for (x,y) in front:
    g[y][x]='ˇ'
for (x,y) in front:
    for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
        X,Y=x+b,y+a
        if (X,Y) in front or (X,Y) in sp: continue
        if 0<=X<16 and 0<=Y<16: g[Y][X]='k'
# inner shading: cells of front ring whose inner side faces the hole get mid tone
for S,lo in ((front,'ˈ'),):
    xs=[p[0] for p in S]; ys=[p[1] for p in S]; cx=(min(xs)+max(xs))/2; cy=(min(ys)+max(ys))/2
    for (x,y) in S:
        ox_,oy_=x+(1 if x<cx else -1), y+(1 if y<cy else -1)
        if (ox_,y) in S and (x,oy_) in S: g[y][x]=lo
I['20']=out(outline(g))
# fossil v7: exact approved ring style + spread back ring + seamless top spine
def ringcells(ox,oy,W=11,H=10):
    cx,cy=(W-1)/2,(H-1)/2
    inside=lambda x,y: 0<=x<W and 0<=y<H and (abs((x-cx)/(W/2))**3+abs((y-cy)/(H/2))**3)<=1
    C={}
    for y in range(H):
        for x in range(W):
            if not inside(x,y): continue
            if all(inside(x+dx,y+dy) for dx in (-2,-1,0,1,2) for dy in (-2,-1,0,1,2) if abs(dx)+abs(dy)<=2): continue
            if y>=H-2 and abs(x-cx)<=1.5: continue
            d1=any(not inside(x+dx,y+dy) for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)))
            C[(ox+x,oy+y)]=d1
    return C
def draw7(bo,fo,spine_on):
    g=blank()
    B=ringcells(*bo); Fr=ringcells(*fo)
    sp=set()
    if spine_on:
        (bx,by),(fx,fy)=bo,fo
        p0=(fx+5,fy); p1=(bx+5,by)      # top-centres
        for k in range(101):
            t=k/100; x=p0[0]+(p1[0]-p0[0])*t; y=p0[1]+(p1[1]-p0[1])*t
            sp.add((int(round(x)),int(round(y)))); sp.add((int(round(x))-1,int(round(y))))
        sp-=set(Fr)
    def put(C,shade,skip):
        for (x,y),lit in C.items():
            if 0<=x<16 and 0<=y<16: g[y][x]='ˇ' if lit else shade
        for (x,y) in C:
            for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
                X,Y=x+b,y+a
                if 0<=X<16 and 0<=Y<16 and (X,Y) not in C and (X,Y) not in skip and g[Y][X]!='.': g[Y][X]='k'
    put(B,'ˉ',sp)
    for (x,y) in sp:
        if 0<=x<16 and 0<=y<16: g[y][x]='ˇ' if (x,y-1) not in sp else 'ˈ'
    for (x,y) in sp:
        for a,b in ((0,1),(0,-1),(1,0),(-1,0)):
            X,Y=x+b,y+a
            if (X,Y) in sp or (X,Y) in B or (X,Y) in Fr: continue
            if 0<=X<16 and 0<=Y<16 and g[Y][X]!='.': g[Y][X]='k'
    put(Fr,'ˈ',sp)
    return out(outline(g))
I['20']=draw7((4,1),(1,5),True)
I['20_s']=draw7((5,1),(1,5),True)
I['20_n']=draw7((5,1),(1,5),False)
# unified ruined portal (overworld + nether): nether design shifted left + chest at bottom-right
g=[list(r) for r in I['12']] if False else None

# ---- canyon (204) & slime chunk (205)
P.update({'˒':'#8ccf6a','˓':'#6fb54d','˔':'#4f8f35','˕':'#2d5a1e','˖':'#c8f0b0'})
I['205']=["................",
          ".kkkkkkkkkkkkkk.",
          "k˖˒˒˒˒˒˒˒˒˒˒˒˒˓k",
          "k˒˒˒˒˒˒˒˒˒˒˒˒˒˓k",
          "k˒˒˓˓˓˓˓˓˓˓˓˒˒˓k",
          "k˒˒˓˕˕˓˓˓˓˕˕˒˒˓k",
          "k˒˒˓˕˖˓˓˓˓˕˖˒˒˓k",
          "k˒˒˓˓˓˓˓˓˓˓˓˒˒˓k",
          "k˒˒˓˓˓˓˓˓˓˓˓˒˒˓k",
          "k˒˒˓˓˓˓˓˕˓˓˓˒˒˓k",
          "k˒˒˓˓˓˓˓˓˓˓˓˒˒˓k",
          "k˒˒˓˓˓˓˓˓˓˓˓˒˒˓k",
          "k˒˒˒˒˒˒˒˒˒˒˒˒˒˓k",
          "k˓˓˓˓˓˓˓˓˓˓˓˓˓˔k",
          ".kkkkkkkkkkkkkk.",
          "................"]
I['205']=[(r[:3]+r[3:13].replace('˓','˔')+r[13:]) if 3<=i<=11 and 4<=i else r for i,r in enumerate(I['205'])]
# canyon: flat ground cut by a deep narrow crack
g=blank()
for y in range(3,15):
    for x in range(16):
        g[y][x]='ϒ' if y==3 and x%2 else 'ϓ' if y==3 else 'ϔ' if y<6 else ('ϣ' if (x*5+y*3)%7 else 'Ϥ')
crack={3:(4,11),4:(5,10),5:(5,10),6:(6,10),7:(6,9),8:(6,9),9:(7,9),10:(7,9),11:(7,8),12:(7,8),13:(7,8)}
for y,(a,b) in crack.items():
    for x in range(a,b+1): g[y][x]='x'
for x in (7,8): g[13][x]='a'
I['204']=out(outline(g))

# ---- cave entrances: 3 sizes x 5 kinds (0 일반, 1 점적석, 2 무성한, 3 깊은 어둠, 4 유황)
P.update({'ˠ':'#a06a44','ˡ':'#c89466','ˢ':'#3e7d2a','ˣ':'#6fb54d','ˤ':'#f6b73c','˥':'#061820','˦':'#29dfeb','˧':'#0f3a48','˨':'#e8d64a','˩':'#a89a22'})
def cave_icon(tier, kind):
    g=blank()
    tall = tier==2
    for y in range(16):
        for x in range(16):
            top=4+0.09*(x-7.5)**2 if not tall else 2+0.07*(x-7.5)**2
            if y>=top and y<=14:
                d=y-top
                g[y][x]='ϒ' if d<1 else 'ϔ' if d<2 else ('ϣ' if (x*7+y*3)%5 else 'Ϥ')
                if d<1 and (x%2): g[y][x]='ϓ'
    w,top={0:(2,10),1:(3.6,8),2:(6,6)}[tier]
    H=set()
    for y in range(top,15):
        k=y-top
        half=w-(1.5 if k==0 else 0.6 if k==1 else 0)
        for x in range(16):
            if abs(x+0.5-8)<=half: H.add((x,y))
    for x,y in H: g[y][x]='˥' if kind==3 else 'x'
    rows=sorted(set(y for _,y in H)); ytop=rows[0]
    def topcell(x):
        ys=[y for (xx,y) in H if xx==x]; return min(ys) if ys else None
    cols=sorted(set(x for x,_ in H))
    if kind==1:   # 점적석: 위에서 매달린 뾰족한 돌, 바닥에서 솟은 돌
        for i,x in enumerate(cols[::2]):
            t=topcell(x); L=1 if tier==0 else (2 if i%2==0 else 1)
            for k in range(L): g[t+k][x]='ˠ' if k==0 else 'ˡ'
        for x in cols[1::3]: g[14][x]='ˠ'; 
        if tier>0:
            for x in cols[1::3]: g[13][x]='ˡ'
    elif kind==2: # 무성한 동굴: 늘어진 덩굴과 발광 열매, 이끼 바닥
        for i,x in enumerate(cols[::2]):
            t=topcell(x); L=1 if tier==0 else 2+(i%2)
            for k in range(L): g[t+k][x]='ˢ'
            if tier>0 and i%2==0: g[t+L][x]='ˤ'
        for x in cols: g[14][x]='ˣ'
    elif kind==3: # 깊은 어둠: 스컬크
        for x in cols: g[14][x]='˧'
        for x in cols[::2]: g[14][x]='˦'
        if tier>0:
            for x in cols[1::3]: g[13][x]='˧'
            g[topcell(cols[len(cols)//2])][cols[len(cols)//2]]='˦'
    elif kind==4: # 유황 동굴: 노란 결정
        for i,x in enumerate(cols):
            g[14][x]='˨' if i%2==0 else '˩'
        for x in cols[1::2]: g[13][x]='˨'
        if tier>0:
            for x in cols[::3]: g[topcell(x)][x]='˩'
    return out(outline(g))
for t in range(3):
    for k in range(5): I['200_%d_%d'%(t,k)]=cave_icon(t,k)
I['200']=I['200_0_0']; I['200_big']=I['200_2_0']

# 네더 화석 + 마른 가스트 배지
P.update({'˪':'#a39787','˫':'#7c7064','ˬ':'#2e2724','˭':'#7fc6e0','ˮ':'#5e544d'})
gh=["˪˪˪˪˪˪",
    "˪ˬˬ˪ˬˬ"[:6],
    "˪˭˪˪˭˪",
    "˫˪˪˪˪˫",
    "˫˪ˮˮ˪˫",
    "ˮ˫˫˫˫ˮ"]
gh=["˪˪˪˪˪˪","ˬˬ˪˪ˬˬ","˭˪˪˪˪˭","˪˪˪˪˪˪","˫˪ˮˮ˪˫","ˮ˫˫˫˫ˮ"]
badge=['k'*8]+['k'+r+'k' for r in gh]+['k'*8]
import json,re
_t=open('/home/claude/seedweb/template2.html').read()
_pix=json.loads(re.search(r'const PIX = (.*?);\n', _t).group(1))
I['20_g']=place(_pix['20'],badge,8,8)
