import math, random
P = {}  # new palette
def col(k, h): P[k] = h; return k
# base
K='k'; 
P.update({
 'α':'#cfe3ef','β':'#8aa1ae','γ':'#4f6470',  # compass glass light/mid/dark rim
 'δ':'#c23b3b','ε':'#7b7b84',               # needle red / gray
 'ζ':'#e9d7ff','η':'#c79bf2','θ':'#9a5fe0','ι':'#6a3aa8','κ':'#3e2170',  # amethyst
 'λ':'#7a7a7a','μ':'#5e5e5e','ν':'#8f8f8f','ξ':'#4f7d3a','ο':'#6f9c4a',   # cobble / moss
 'π':'#b8b8b8','ρ':'#8e8e8e','σ':'#d6d6d6','τ':'#5a5a5a',                 # silverfish grays
 'υ':'#fff27a','φ':'#f6c22a','χ':'#e48a14','ψ':'#a85a0c','ω':'#3a1f0a',   # blaze
 'Α':'#3b1519','Β':'#5a2026','Γ':'#7a2c31','Δ':'#2a0e12',                 # nether brick
 'Ε':'#2b2731','Ζ':'#3a3542','Η':'#4a4453','Θ':'#f2c230','Ι':'#ff7a1a',   # blackstone / gold / lava
 'Κ':'#14101c','Λ':'#3b2466','Μ':'#8a4ad6','Ν':'#f6d23a','Ξ':'#b07d12',   # obsidian / crying / portal / gold
 'Ο':'#efe6cf','Π':'#cfc3a4','Ρ':'#a99a78',                               # bone
 'Σ':'#9d9cb4','Τ':'#6f6e8c','Υ':'#c9c8dc','Φ':'#4b4a66',                 # elytra
 'Χ':'#232323','Ψ':'#3a3a3a','Ω':'#161616','ϐ':'#b06ce0','ϑ':'#e7c6ff',  # bedrock / beam
 'ϒ':'#2a8f3a','ϓ':'#5fb043','ϔ':'#7a5232','ϕ':'#5a3a22',                 # grass/dirt
 'ϖ':'#ff6a00','ϗ':'#ffb03a','Ϙ':'#c8420a',                               # lava
 'ϙ':'#3a3a42','Ϛ':'#2a2a30','ϛ':'#4c4c55',                               # deepslate
 'Ϝ':'#4f7c3a','ϝ':'#3c6a2c','Ϟ':'#6fa04f','ϟ':'#26401d',                 # zombie
 'Ϡ':'#e4e4e4','ϡ':'#c4c4c4','Ϣ':'#9a9a9a',                               # skeleton
 'ϣ':'#8b8b8b','Ϥ':'#6b6b6b','ϥ':'#a3a3a3',                               # stone
})
def blank(): return [['.']*16 for _ in range(16)]
def out(g): return [''.join(r) for r in g]
def outline(g, ch='k'):
    F=[r[:] for r in g]
    for y in range(16):
        for x in range(16):
            if F[y][x]=='.' and any(0<=y+a<16 and 0<=x+b<16 and F[y+a][x+b] not in '.' for a,b in ((0,1),(0,-1),(1,0),(-1,0))):
                g[y][x]=ch
    return g
I={}
# 1. compass (symmetric)
g=blank()
for y in range(16):
    for x in range(16):
        d=math.hypot(x-7.5,y-7.5)
        if d<=7.2: g[y][x]='k'
        if d<=6.2: g[y][x]='γ'
        if d<=5.3: g[y][x]='α'
for y in range(3,8): g[y][7]=g[y][8]='δ'
for y in range(8,13): g[y][7]=g[y][8]='ε'
g[2][7]=g[2][8]='α'
for (yy,xx) in [(4,4),(11,4)]: g[yy][xx]='β'; g[yy][15-xx]='β'
I['spawn']=out(g)
# 3. amethyst cluster
I['17']=[
"................",
".......kk.......",
"......kζηk......",
"......kζηk..k...",
"..k...kηθk.kζk..",
".kζk..kηθk.kηk..",
".kηk.kζηθkkηθk..",
".kηθkkζηθkηθk...",
"..kηθkζηθkθk....",
"..kηθkηθιkθk....",
"...kθkηθιkιk....",
"...kθιηθιιk.....",
"..kιιθιθιιιk....",
".kκκκκκκκκκκk...",
"..kkkkkkkkkk....",
"................"]
# helpers for badge on background
def place(bg, badge, ox, oy):
    g=[list(r) for r in bg]
    for y,r in enumerate(badge):
        for x,c in enumerate(r):
            if c!='.' and 0<=oy+y<16 and 0<=ox+x<16: g[oy+y][ox+x]=c
    return out(g)
cage=[
"kkkkkkkkkkkkk...",
"k$$$$$$$$$$$k...",
"k$-)-)-)-)-$k...",
"k$-)-)-)-)-$k...",
"k$-)-)-)-)-$k...",
"k$$$$$$$$$$$k...",
"k$-)-)-)-)-$k...",
"k$-)-)-)-)-$k...",
"k$-)-)-)-)-$k...",
"k$$$$$$$$$$$k...",
"k$-)-)-)-)-$k...",
"k$$$$$$$$$$$k...",
"kkkkkkkkkkkkk...",
"................","................","................"]
random.seed(7)
cob=[]
for y in range(16):
    row=''
    for x in range(16):
        if y in (0,12) or x in (0,12): row+='k' if (y<=12 and x<=12) else '.'
        elif y<12 and x<12: row+=random.choice('λλμνλμ') if not (random.random()<0.22) else random.choice('ξο')
        else: row+='.'
    cob.append(row)
cave_spider=["kkkkkkkkk","k%%%%%%%k","k%^%%%^%k","k%%^%^%%k","k%%%%%%%k","k%^^%^^%k","k%%%%%%%k","k-%-%-%-k","kkkkkkkkk"]
spider=["kkkkkkkkk","k-------k","k-^---^-k","k--^-^--k","k-------k","k-^^-^^-k","k-------k","k)-)-)-)k","kkkkkkkkk"]
zombie=["kkkkkkkkk","kϟϟϟϟϟϟϟk","kϝϝϝϝϝϝϝk","kϜϜϜϜϜϜϜk","kϟ-ϜϜϜ-ϟk","kϜϜϜϝϜϜϜk","kϜϝϟϟϟϝϜk","kϜϜϜϜϜϜϜk","kkkkkkkkk"]
skeleton=["kkkkkkkkk","kϠϠϠϠϠϠϠk","kϡϠϠϠϠϠϡk","kϠ--Ϡ--Ϡk","kϠ--Ϡ--Ϡk","kϡϠϠ-ϠϠϡk","kϠ-Ϡ-Ϡ-Ϡk","kϡϠϡϠϡϠϡk","kkkkkkkkk"]
blaze=["kkkkkkkkk","kφυφφφυφk","kυφφυφφυk","kφωωφωωφk","kχφφφφφχk","kφφωωωφφk","kχφχφχφχk","kψχψχψχψk","kkkkkkkkk"]
I['100']=place(cage,cave_spider,7,7)
I['102']=place(cage,blaze,7,7)
# silverfish: bug body bottom, over cage
fish=[
"............kk",
"..kk.kk.kk.k.k",
".kσσkσσkσσkσk.",
"kπσπρπσπρπσπσk",
"kτπτρτπτρτπσxk",
"kπρπρπρπρπρπσk",
".kτkkτkkτkkτk.",
"..k..k..k..k..",
]
I['101']=place(cage,fish,2,8)
I['201_0']=place(cob,skeleton,7,7)
I['201_1']=place(cob,zombie,7,7)
I['201_3']=place(cob,spider,7,7)
I['201']=I['201_1']
# 7. nether fortress
I['18']=[
".....kk.kk.kk...",
".....kΓkΓkΓk....",
".....kΓΒΓΒΓk....",
".....kΒΓΒΓΒk....",
".....kΓΒkΒΓk....",
"kkkkkkΒkΔkΒkkkkk",
"kΓΒΓΒkΓkΔkΓkΒΓΒk",
"kkkkkkΒΓΒΓΒkkkkk",
".kΓk..kΒΓΒk..kΓk",
".kΒk..kΓΒΓk..kΒk",
".kΓkkkkΒΓΒkkkkΓk",
".kΒkΔΔkΓΒΓkΔΔkΒk",
".kΓkΔΔkΒΓΒkΔΔkΓk",
".kΒk..kΓΒΓk..kΒk",
".kΓk..kΒΓΒk..kΓk",
".kkk..kkkkk..kkk"]
# 8. bastion with noise + variants
random.seed(3)
def bastion(variant):
    g=blank()
    for y in range(2,16):
        for x in range(16):
            g[y][x]=random.choice('ΕΕΖΖΗΕ')
    # crenellation top
    for x in range(16):
        if x in (0,15) or y==0: pass
    for y in (0,1):
        for x in range(16):
            g[y][x]='.'
    for x in [0,1,2,3,12,13,14,15]: g[1][x]=random.choice('ΕΖΗ')
    # gold band
    for x in range(1,15): g[6][x]='Θ' if x%3 else 'Ξ'
    if variant==2:   # treasure: lava pool center + chest on top
        for y in range(10,14):
            for x in range(4,12): g[y][x]='Ι' if (x+y)%3 else 'ϗ'
        for y,x in [(8,6),(8,7),(8,8),(8,9),(9,6),(9,9)]: g[y][x]='b'
        g[9][7]=g[9][8]='Θ'
    elif variant==0: # housing units: 양쪽 아래에 상자, 가운데 통로
        for cx_ in (1,12):
            for y in (12,13):
                for x in (cx_,cx_+1,cx_+2): g[y][x]='b'
            g[12][cx_+1]='Θ'
            for x in (cx_,cx_+1,cx_+2): g[11][x]='k'
        for y in range(9,16):
            for x in (6,7,8,9): g[y][x]='x'
    elif variant==1: # hoglin stables: hoglin face
        hog=["ΗΗΗΗΗΗ","ΗbbbbΗ","ΗbkbkΗ","bbOObb","bOσσOb","ΗbbbbΗ"]
        for y,r in enumerate(hog):
            for x,c in enumerate(r): g[9+y][5+x]=c
    elif variant==3: # bridge: arch bridge
        for x in range(16): g[10][x]='Ζ'
        for y in range(11,16):
            for x in range(3,13): g[y][x]='.'
        for y in range(11,16):
            for x in (3,4,11,12): g[y][x]=random.choice('ΕΗ')
    return out(outline(g))
for v in range(4): I['19_%d'%v]=bastion(v)
I['19']=I['19_2']
# 9. ruined portal: 3px blocks, 4x5 frame, gold blocks on top corners, missing whole blocks
cells=[ # 5 cols x 5 rows of block (col 0..4) -> use 3px each => 15px; offset 0
 "GOOO.",
 "O..CO",
 "C.PPO",
 "O.PPC",
 "OO.OO"]
g=blank()
mp={'O':'Κ','C':'Λ','G':'Ν'}
for r,row in enumerate(cells):
    for c,ch in enumerate(row):
        for dy in range(3):
            for dx in range(3):
                y=r*3+dy; x=c*3+dx
                if ch in 'OCG': g[y][x]=mp[ch]
                elif ch=='P': g[y][x]='Μ' if (dx+dy)%2 else 'p'
# gold top: col 0 row 0 is gold
for dy in range(3):
    for dx in range(3):
        g[dy][dx]='Ν' if (dx+dy)%3 else 'Ξ'
g=[ (['.']+r)[:16] for r in g]  # shift right by 1 for symmetry margin
I['12']=out(outline(g))
I['11']=I['11'] if '11' in I else None
# 10. ribcage top view
I['20']=[
"................",
".......kk.......",
"..kkkkkΟΟkkkkk..",
".kΟΟΟΟkΟΟkΟΟΟΟk.",
".kΟkkkkΠΟkkkkΟk.",
"kΟk..kkΟΟkk..kΟk",
"kΟk.kΟΟkΟΟΟk.kΟk",
"kΟkkΟkkΠΟkkΟkkΟk",
"kΠkΟk.kΟΟk.kΟkΠk",
"kΠkΟkkkΟΠkkkΟkΠk",
".kkΠkΟΟΟΟΟΟkΠkk.",
"..kΠkΠkkkkΠkΠk..",
"...kkΠk.kΠkkk...",
"....kΠk.kΠk.....",
".....kk..kk.....",
"................"]
# 12. elytra item style
I['121']=[
"......kkkk......",
".....kΥΣΣΥk.....",
"....kΥΣkkΣΥk....",
"...kΥΣk..kΣΥk...",
"...kΣΣk..kΣΣk...",
"..kΥΣΤk..kΤΣΥk..",
"..kΣΣΤk..kΤΣΣk..",
".kΥΣΤΣk..kΣΤΣΥk.",
".kΣΣΤΣk..kΣΤΣΣk.",
".kΣΤΣΤk..kΤΣΤΣk.",
"kΥΣΤΣΦk..kΦΣΤΣΥk",
"kΣΤΣΦk....kΦΣΤΣk",
"kΣΣΦk......kΦΣΣk",
"kΤΦk........kΦΤk",
".kk..........kk.",
"................"]
# 13. end gateway side view
I['22']=[
".......ϐϑ.......",
".......ϐϑ.......",
"......kϐϑk......",
"....kkΧΨΧΩkk....",
"...kΨΧΩΧΨΧΩΨk...",
"...kΧΩΨΧΩΨΧΩk...",
"....kkk--kkk....",
"......k-+k......",
"......k+-k......",
"....kkk--kkk....",
"...kΩΧΨΩΧΨΩΧk...",
"...kΨΩΧΨΩΧΨΩk...",
"....kkΧΨΩΧkk....",
"......kϐϑk......",
".......ϐϑ.......",
".......ϐϑ......."]
# 14. cave entrances small / big
I['200']=[
"................",
"................",
"................",
"................",
"................",
"kkkkkkkkkkkkkkkk",
"ϓϒϓϒϓϒϓϒϓϒϓϒϓϒϓϒ"[:16],
"ϔϕϔϔϔϕkkkϔϔϕϔϔϔϕ"[:16],
"ϣϤϥϣϣkxxxkϣϤϥϣϣϤ"[:16],
"ϤϣϣϥkxxxxxkϣϣϤϥϣ"[:16],
"ϣϥϤϣkxxxxxkϥϣϣϤϣ"[:16],
"ϥϣϣϤϣkxxxkϣϤϥϣϣϥ"[:16],
"ϣϤϣϣϥϣkkkϣϣϣϤϣϥϣ"[:16],
"ϤϣϥϣϣϤϣϥϣϣϤϣϣϥϣϤ"[:16],
"kkkkkkkkkkkkkkkk",
"................"]
I['200_big']=[
"................",
"................",
"kkkkkkkkkkkkkkkk",
"ϓϒϓϒkkkkkkkkϓϒϓϒ"[:16],
"ϔϕϔkxxxxxxxxkϔϕϔ"[:16],
"ϣϥkxxxxxxxxxxkϣϤ"[:16],
"ϤkxxxxxxxxxxxxkϤ"[:16],
"ϣkxxxxxxxxxxxxkϥ"[:16],
"kxxϤxxxxxxxxϤxxk"[:16],
"kxxkxxxxxxxxkxxk"[:16],
"kxxxxxxxxxxxxxxk",
"ϣkxxxxxxxxxxxxkϣ"[:16],
"ϤϣkxxxxxxxxxxkϣϤ"[:16],
"ϣϥϣkkkkkkkkkkϣϥϣ"[:16],
"kkkkkkkkkkkkkkkk",
"................"]
# 18. underground lava lake: deepslate around flat lava
random.seed(5)
g=blank()
for y in range(1,15):
    for x in range(16):
        g[y][x]=random.choice('ϙϙϚϛϙ')
for y in range(6,10):
    for x in range(3,13): g[y][x]='.'
for x in range(3,13): g[8][x]='ϖ'; g[9][x]='Ϙ'
for x in range(3,13): g[8][x]='ϗ' if x%4==1 else 'ϖ'
for y in (6,7):
    for x in range(3,13): g[y][x]='x'
I['202']=out(outline(g))
# 19. surface lava pool
g=blank()
for y in range(4,15):
    for x in range(16):
        if y==4: g[y][x]='ϓ' if x%2 else 'ϒ'
        elif y==5: g[y][x]='ϔ'
        else: g[y][x]=random.choice('ϔϕϔ') if y<8 else random.choice('ϣϤϥ')
for y in range(4,10):
    for x in range(4,12):
        if y==4 or y==5 or (y<9 and 3<x<12): g[y][x]='.'
for x in range(4,12): g[6][x]='ϗ' if x%3==0 else 'ϖ'
for x in range(4,12): g[7][x]='ϖ'
for x in range(5,11): g[8][x]='Ϙ'
g[8][4]=g[8][11]='ϔ'
for y in (4,5):
    for x in range(4,12): g[y][x]='.'
I['203']=out(outline(g))
for k,v in list(I.items()):
    if v is None: del I[k]; continue
    assert len(v)==16 and all(len(r)==16 for r in v),(k,[len(r) for r in v])
