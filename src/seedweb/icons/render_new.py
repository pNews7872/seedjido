import sys,json,re,importlib
sys.path.insert(0,'/home/claude/seedweb/icons')
import newicons; importlib.reload(newicons)
s=open('/home/claude/seedweb/template2.html').read()
PAL=json.loads(re.search(r'const PIX_PAL = (.*?);\n', s).group(1)); PAL.update(newicons.NEWPAL)
from PIL import Image, ImageDraw
def draw(rr,S):
    im=Image.new('RGBA',(16*S,16*S),(0,0,0,0)); dr=ImageDraw.Draw(im)
    for y,r in enumerate(rr):
        for x,ch in enumerate(r):
            if ch!='.': dr.rectangle([x*S,y*S,x*S+S-1,y*S+S-1],fill=PAL[ch])
    return im
ks=sys.argv[1].split(',') if len(sys.argv)>1 else list(newicons.ICONS)
sheet=Image.new('RGB',(len(ks)*110,150),(108,148,88))
for i,k in enumerate(ks):
    big=draw(newicons.ICONS[k],6); sheet.paste(big,(i*110+5,5),big)
    sm=draw(newicons.ICONS[k],2); sheet.paste(sm,(i*110+30,110),sm)
sheet.save('/home/claude/seedweb/icons/new1.png')
