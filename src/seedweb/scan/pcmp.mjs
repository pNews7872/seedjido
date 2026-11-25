import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const S=BigInt.asUintN(64,-1764505425291978715n);
const ENV={'minecraft:ruined_portal':0,'minecraft:ruined_portal_desert':1,'minecraft:ruined_portal_jungle':2,'minecraft:ruined_portal_swamp':3,'minecraft:ruined_portal_mountain':4,'minecraft:ruined_portal_ocean':5,'minecraft:ruined_portal_nether':6};
for(const [dim,st,file,L] of [[0,11,'/tmp/oscan.json',1400],[-1,12,'/tmp/nscan2.json',2900]]){
 e.set_seed_dim(Number(S&0xffffffffn),Number(S>>32n),e.mc_wd(),dim);
 const o=JSON.parse(fs.readFileSync(file));const A=new Map(o.starts.filter(s=>s.id.includes('ruined')).map(s=>[s.cx+','+s.cz,s]));
 const n=e.structs_rect(st,-L,-L,L,L,4096);const a=new Int32Array(e.memory.buffer,e.rect_ptr(),n*4);
 let m=0,env=0,ug=0,gi=0,idx=0;const bad=[];
 for(let i=0;i<n;i++){const k=(a[i*4]>>4)+','+(a[i*4+2]>>4);const s=A.get(k);if(!s)continue;m++;const f=a[i*4+3];
  const t=s.ch[0].t, giant=t.includes('giant'), num=+t.split('_').pop();
  if((f&15)===ENV[s.id])env++;else bad.push(s.id+' pred env '+(f&15));
  if(!!(f&16)===(s.ch[0].vp==='underground'))ug++;else bad.push('ug '+s.ch[0].vp+' pred '+(f&16));
  if(!!(f&32)===giant)gi++; if((f>>8)===num)idx++;}
 console.log('dim',dim,'pred',n,'matched',m,'actual',A.size,'env ok',env,'underground ok',ug,'giant ok',gi,'shape ok',idx, bad.slice(0,6));
}
