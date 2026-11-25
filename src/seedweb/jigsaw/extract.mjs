// 고대 도시 조각(템플릿)·풀 데이터를 작은 JSON으로 뽑기 (mcmeta 26.3-data)
import fs from 'fs'; import zlib from 'zlib'; import path from 'path'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs';
const ROOT='/tmp/mcm/mcmeta/data/minecraft';
const T={};
function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(f.endsWith('.nbt'))load(p);}}
function load(p){
  const name=p.slice(ROOT.length+'/structure/'.length).replace('.nbt','');
  const r=parseNBT(new Uint8Array(zlib.gunzipSync(fs.readFileSync(p))));
  const pal=(r.palette||r.palettes[0]).map(e=>({n:String(e.Name||e.id).replace('minecraft:',''),p:e.Properties||e.properties||{}}));
  // 블록 엔티티(nbt 있는 블록)만, 게임과 같은 순서(y, x, z)로
  const nb=r.blocks.filter(b=>b.nbt).map(b=>({pos:Array.from(b.pos),st:pal[b.state],nbt:b.nbt}));
  nb.sort((a,b)=>a.pos[1]-b.pos[1]||a.pos[0]-b.pos[0]||a.pos[2]-b.pos[2]);
  const jig=[],box=[];
  for(const b of nb){
    if(b.st.n==='jigsaw'){const o=b.st.p.orientation;const [front,top]=o.split('_');const t=b.nbt;
      jig.push([...b.pos,front,top,String(t.name),String(t.target),String(t.pool).replace('minecraft:',''),String(t.joint||''),Number(t.selection_priority||0),Number(t.placement_priority||0)]);}
    else if(t_isContainer(b)) box.push([...b.pos,String(b.nbt.LootTable||'').replace('minecraft:',''),b.st.n]);
  }
  T[name]={s:Array.from(r.size),j:jig,c:box};
}
function t_isContainer(b){return ['chest','trapped_chest','barrel','dispenser','dropper','hopper','shulker_box','decorated_pot'].includes(b.st.n)||b.nbt.LootTable!==undefined;}
walk(ROOT+'/structure/ancient_city');
// 풀에는 있지만 게임 데이터에 파일이 없는 조각은 게임처럼 빈 조각으로 (지그소가 없어 붙지 않음)
T['ancient_city/walls/intact_horizontal_wall_stairs_5']={s:[0,0,0],j:[],c:[]};
const P={};
for(const f of ['city_center','city/entrance','city_center/walls','sculk','structures','walls','walls/no_corners']){
  const d=JSON.parse(fs.readFileSync(`${ROOT}/worldgen/template_pool/ancient_city/${f}.json`));
  const el=e=>{const t=e.element_type.split(':')[1];if(t==='single_pool_element'||t==='legacy_single_pool_element')return {t:'s',l:e.location.replace('minecraft:','')};if(t==='list_pool_element')return {t:'l',e:e.elements.map(el)};if(t==='feature_pool_element')return {t:'f',f:e.feature};return {t:'e'};};
  P['ancient_city/'+f]={fb:d.fallback.replace('minecraft:',''),el:d.elements.map(e=>[e.weight,el(e.element)])};
}
fs.writeFileSync('/home/claude/seedweb/jigsaw/ancient_city.json',JSON.stringify({T,P}));
console.log(Object.keys(T).length,'templates', JSON.stringify(Object.entries(T).filter(([k,v])=>v.c.length).map(([k,v])=>k.split('/').pop()+':'+v.c.length)));
console.log('jig sample',JSON.stringify(T['ancient_city/city_center/city_center_1'].j.slice(0,3)));
console.log('size',fs.statSync('/home/claude/seedweb/jigsaw/ancient_city.json').size);
