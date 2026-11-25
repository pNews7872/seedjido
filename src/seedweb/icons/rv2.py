import sys,json,re,importlib
sys.path.insert(0,'/home/claude/seedweb/icons'); import v3 as v2
from PIL import Image, ImageDraw, ImageFont
s=open('/home/claude/seedweb/template2.html').read()
PAL=json.loads(re.search(r'const PIX_PAL = (.*?);\n', s).group(1)); PAL.update(v2.P)
PIX=json.loads(re.search(r'const PIX = (.*?);\n', s).group(1))
names=sys.argv[1].split(',')
font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',14)
cols=6;W=160;H=175
sheet=Image.new('RGB',(cols*W,((len(names)+cols-1)//cols)*H),(108,148,88));dr=ImageDraw.Draw(sheet)
for n,k in enumerate(names):
    rows=v2.I.get(k) or PIX[k]; x0=(n%cols)*W; y0=(n//cols)*H; S=8
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch!='.': dr.rectangle([x0+16+x*S,y0+6+y*S,x0+16+x*S+S-1,y0+6+y*S+S-1],fill=PAL[ch])
    sm=Image.new('RGBA',(32,32),(0,0,0,0)); d2=ImageDraw.Draw(sm)
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch!='.': d2.rectangle([x*2,y*2,x*2+1,y*2+1],fill=PAL[ch])
    sheet.paste(sm,(x0+64,y0+137),sm)
    dr.text((x0+4,y0+150),k,fill=(255,255,255),font=font)
sheet.save('/home/claude/seedweb/icons/v2.png')
