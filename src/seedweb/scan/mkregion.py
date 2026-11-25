import struct, zlib, math
def s(x): b=x.encode(); return struct.pack('>H',len(b))+b
def tag(t,name,payload): return bytes([t])+s(name)+payload
def comp(items): return b''.join(items)+b'\x00'
def i32(v): return struct.pack('>i',v)
def lst(et, payloads): return bytes([et])+i32(len(payloads))+b''.join(payloads)
def longarr(vals): return i32(len(vals))+b''.join(struct.pack('>q', v if v<2**63 else v-2**64) for v in vals)
def pack(values,bits):
    vpl=64//bits; out=[]
    for i in range(0,len(values),vpl):
        v=0
        for j,x in enumerate(values[i:i+vpl]): v|=x<<(j*bits)
        out.append(v)
    return out
def block(name,props=None):
    items=[tag(8,'Name',s(name))]
    if props: items.append(tag(10,'Properties',comp([tag(8,k,s(v)) for k,v in props.items()])))
    return comp(items)
def chunk(cx,cz,lava_cells,spawners,surface=64):
    # sections from Y=-4..19 ; section 4 (y 64..79): stone below surface, lava cells
    secs=[]
    for Y in range(-4,20):
        y0=Y*16
        pal=[block('minecraft:air'),block('minecraft:stone'),block('minecraft:lava',{'level':'0'})]
        idx=[]
        for k in range(4096):
            x=k&15; z=(k>>4)&15; y=y0+(k>>8)
            v=1 if y<surface else 0
            if (x,y,z) in lava_cells: v=2
            idx.append(v)
        bits=4
        secs.append(comp([tag(1,'Y',bytes([Y&255])), tag(10,'block_states',comp([tag(9,'palette',lst(10,pal)), tag(12,'data',longarr(pack(idx,bits)))]))]))
    # heightmap: top motion-blocking +1 relative to -64
    hv=[]
    for k in range(256):
        x=k&15; z=k>>4
        top=surface-1
        for (lx,ly,lz) in lava_cells:
            if lx==x and lz==z: top=max(top,ly)
        hv.append(top+1+64)
    hm=comp([tag(12,'MOTION_BLOCKING',longarr(pack(hv,9)))])
    bes=[comp([tag(8,'id',s('minecraft:mob_spawner')),tag(3,'x',i32(x)),tag(3,'y',i32(y)),tag(3,'z',i32(z)),tag(10,'SpawnData',comp([tag(10,'entity',comp([tag(8,'id',s('minecraft:'+mob))]))]))]) for x,y,z,mob in spawners]
    root=comp([tag(3,'xPos',i32(cx)),tag(3,'zPos',i32(cz)),tag(8,'Status',s('minecraft:full')),tag(9,'sections',lst(10,secs)),tag(10,'Heightmaps',hm),tag(9,'block_entities',lst(10,bes) if bes else lst(0,[]))])
    return bytes([10])+s('')+root[:-0] if False else bytes([10])+s('')+root
# chunk (0,0): surface lava pool 3x3 at y=63 (exposed, since surface 64 → stone up to 63; put lava at y 63)
pool={(x,63,z) for x in range(4,7) for z in range(4,7)}
under={(x,30,z) for x in range(2,8) for z in range(2,6)}  # 24 cells underground
c00=chunk(0,0,pool|under,[(5,20,9,'zombie'),(10,-30,3,'cave_spider')])
c10=chunk(1,0,set(),[(20,40,7,'skeleton')])
region=bytearray(8192)
sector=2
for (cx,cz,data) in [(0,0,c00),(1,0,c10)]:
    comp_=zlib.compress(data); payload=struct.pack('>I',len(comp_)+1)+b'\x02'+comp_
    n=math.ceil(len(payload)/4096)
    idx=(cx&31)+(cz&31)*32
    struct.pack_into('>I',region,idx*4,(sector<<8)|n)
    region+=payload+b'\x00'*(n*4096-len(payload)); sector+=n
open('r.0.0.mca','wb').write(region)
print(len(region))
