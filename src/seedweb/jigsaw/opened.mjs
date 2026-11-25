import fs from 'fs'; import zlib from 'zlib'; import {parseNBT} from '/home/claude/seedweb/scan/lib.mjs'; import {makeAssembler,piecesChests} from './jigsaw.mjs';
const S=-1764505425291978715n;
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,S);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const rd=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
const nb=e.malloc(128);const nm=s=>{new Uint8Array(e.memory.buffer,nb,128).set(new TextEncoder().encode(s+'\0'));return nb;};
// world block entities with items
const W=new Map();
for(const f of fs.readdirSync('/tmp/open')){const b=fs.readFileSync('/tmp/open/'+f);const dv=new DataView(b.buffer,b.byteOffset);
 for(let i=0;i<1024;i++){const off=(dv.getUint32(i*4)>>>8)*4096;if(!off)continue;const len=dv.getUint32(off);let r;try{const raw=zlib.inflateSync(b.subarray(off+5,off+4+len));r=parseNBT(new Uint8Array(raw.buffer,raw.byteOffset,raw.byteLength));}catch(x){continue;}
 for(const be of (r.block_entities||[])) if(/chest|barrel|dispenser|pot/.test(String(be.id))) W.set(be.x+','+be.y+','+be.z,be);}}
const enc=it=>{const c=it.components||{};const E=c['minecraft:stored_enchantments']||c['minecraft:enchantments'];if(!E)return '';const lv=E.levels||E;return Object.entries(lv).map(([k,v])=>k.replace('minecraft:','')+':'+Number(v)).sort().join(',');};
const pot=it=>{const c=it.components||{};const P=c['minecraft:potion_contents'];return P?String(P.potion||(P.custom_effects&&JSON.stringify(P.custom_effects))||'').replace('minecraft:',''):'';};
const tot=items=>{const t={};for(const it of items){let id=String(it.id).replace('minecraft:','');const e=enc(it);if(e)id+='['+e+']';t[id]=(t[id]||0)+Number(it.count??it.Count??1);}return t;};
const fmt=t=>Object.entries(t).sort().map(([k,v])=>k+'×'+v).join(' ');
const jobs=[];
const AC=JSON.parse(fs.readFileSync('ancient_city.json'));jobs.push(['고대 도시',AC,makeAssembler(AC)(S,7,-90,{startPool:'ancient_city/city_center',startJigsaw:'minecraft:city_anchor',y:-27,maxDepth:7,maxDist:116}),70000]);
const T=JSON.parse(fs.readFileSync('trial_chambers.json')),tj=JSON.parse(fs.readFileSync('/tmp/mcm/mcmeta/data/minecraft/worldgen/structure/trial_chambers.json'));
jobs.push(['시련의 방',T,makeAssembler(T)(S,8,-82,{startPool:'trial_chambers/chamber/end',yMin:-40,yMax:-20,maxDepth:20,maxDist:116,pad:[10,10],aliases:tj.pool_aliases}),30004]);
const V=JSON.parse(fs.readFileSync('village.json'));const va=makeAssembler(V);const VI={desert:39,plains:40,savanna:41,snowy:42,taiga:43};
for(const st of JSON.parse(fs.readFileSync('/tmp/oscan.json')).starts.filter(x=>x.id.includes('village'))){const ty=st.id.split('_')[1];
 jobs.push(['마을 '+ty+' '+st.cx*16+','+st.cz*16,V,va(S,st.cx,st.cz,{startPool:`village/${ty}/town_centers`,y:0,heightFn:(x,z)=>e.wg_height(x,z),projectStart:true,maxDepth:6,maxDist:80,hack:true}),40000+VI[ty]]);}
let ok=0,bad=0,unopened=0,miss=0;
for(const [name,D,pcs,salt] of jobs){const seqs={},used={};
 for(const c of piecesChests(D,pcs)){const cx=c.x>>4,cz=c.z>>4,k=cx+','+cz;if(!seqs[k])seqs[k]=rd(e.salt_longs(cx*16,cz*16,salt,64)).trim().split(' ');used[k]=used[k]||0;const sd=BigInt.asUintN(64,BigInt(seqs[k][used[k]++]));
  if(!c.table||!c.table.startsWith('chests'))continue;
  const w=W.get(c.x+','+c.y+','+c.z);
  if(!w){miss++;continue;}
  if(w.LootTable){unopened++;continue;}
  const pred={};for(const l of rd(e.loot_named(nm(c.table),Number(sd&0xffffffffn),Number(sd>>32n))).trim().split('\n')){if(!l)continue;const f=l.split('|');let id=f[1].replace('minecraft:','');if(id==='book'&&f[3])id='enchanted_book';if(f[3])id+='['+f[3].split(',').sort().join(',')+']';pred[id]=(pred[id]||0)+ +f[2];}
  const wt=tot(w.Items||[]);
  if(fmt(pred)===fmt(wt))ok++;else{bad++;console.log('DIFF',name,c.x,c.y,c.z,c.table,'\n  pred',fmt(pred),'\n  world',fmt(wt));}}}
console.log('ok',ok,'bad',bad,'unopened',unopened,'not in files/absent',miss);
