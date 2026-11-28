// 조각 조립식 구조물 데이터 뽑기 (mcmeta 26.3-data): node extract2.mjs <출력 이름> <폴더>...
import fs from 'fs'; import zlib from 'zlib'; import path from 'path'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const ROOT='/tmp/rp/v116/data/minecraft', PROOT='/tmp/rp/v1162/data/minecraft';
const [out,...dirs]=process.argv.slice(2);
const CONT=new Set(['chest','trapped_chest','barrel','dispenser','dropper','hopper','decorated_pot','crafter']);
const T={},P={};
function walk(d,f){if(!fs.existsSync(d))return;for(const x of fs.readdirSync(d)){const p=path.join(d,x);if(fs.statSync(p).isDirectory())walk(p,f);else f(p);}}
for(const dir of dirs){
 walk(`${ROOT}/structures/${dir}`,p=>{if(!p.endsWith('.nbt'))return;
  const name=p.slice(ROOT.length+'/structures/'.length).replace('.nbt','');
  const r=parseNBT(new Uint8Array(zlib.gunzipSync(fs.readFileSync(p))));
  const pal=(r.palette||r.palettes[0]).map(e=>({n:String(e.Name||e.name||e.id).replace('minecraft:',''),p:e.Properties||e.properties||{}}));
  const nb=r.blocks.filter(b=>b.nbt).map(b=>({pos:Array.from(b.pos),st:pal[b.state],nbt:b.nbt}));
  nb.sort((a,b)=>a.pos[1]-b.pos[1]||a.pos[0]-b.pos[0]||a.pos[2]-b.pos[2]);
  const jig=[],box=[];
  for(const b of nb){
   if(b.st.n==='jigsaw'){const [front,top]=b.st.p.orientation.split('_');const t=b.nbt;
    jig.push([...b.pos,front,top,String(t.name),String(t.target),String(t.pool).replace('minecraft:',''),String(t.joint||''),Number(t.selection_priority||0),Number(t.placement_priority||0)]);}
   else if(CONT.has(b.st.n)||b.st.n.endsWith('shulker_box')) box.push([...b.pos,String(b.nbt.LootTable||'').replace('minecraft:',''),b.st.n]);
  }
  T[name]={s:Array.from(r.size),j:jig,c:box};});
 walk(`${PROOT}/worldgen/template_pool/${dir}`,p=>{if(!p.endsWith('.json'))return;
  const name=p.slice(PROOT.length+'/worldgen/template_pool/'.length).replace('.json','');
  const d=JSON.parse(fs.readFileSync(p));
  const el=e=>{const t=e.element_type.split(':')[1];const pr=e.projection==='terrain_matching'?'t':'r';
   if(t==='single_pool_element'||t==='legacy_single_pool_element')return {t:'s',l:e.location.replace('minecraft:',''),pr};
   if(t==='list_pool_element')return {t:'l',e:e.elements.map(el),pr};
   if(t==='feature_pool_element')return {t:'f',f:e.feature,pr};return {t:'e'};};
  P[name]={fb:d.fallback.replace('minecraft:',''),el:d.elements.map(e=>[e.weight,el(e.element)])};});
}
P['empty']={fb:'empty',el:[]};
const miss=new Set();const chk=e=>{if(e.t==='s'&&!T[e.l])miss.add(e.l);if(e.t==='l')e.e.forEach(chk);};
for(const p of Object.values(P))for(const [,e] of p.el)chk(e);
for(const m of miss)T[m]={s:[0,0,0],j:[],c:[]};
fs.writeFileSync(`/home/claude/seedweb/jigsaw/${out}.json`,JSON.stringify({T,P}));
console.log(out,Object.keys(T).length,'tmpl',Object.keys(P).length,'pools','missing',[...miss],'size',fs.statSync(`/home/claude/seedweb/jigsaw/${out}.json`).size);
const tabs={};for(const v of Object.values(T))for(const c of v.c)tabs[c[3]+'/'+c[4]]=(tabs[c[3]+'/'+c[4]]||0)+1;console.log(JSON.stringify(tabs));
