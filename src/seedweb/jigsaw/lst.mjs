import fs from 'fs'; import {makeAssembler,piecesChests} from './jigsaw.mjs';
const S=-1764505425291978715n;
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,S);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const W=new Map(JSON.parse(fs.readFileSync('/tmp/tvw.json')).map(w=>[w[0]+','+w[1]+','+w[2],w]));
const T=JSON.parse(fs.readFileSync('trial_chambers.json')),tj=JSON.parse(fs.readFileSync('/tmp/mcm/mcmeta/data/minecraft/worldgen/structure/trial_chambers.json'));
const tp=makeAssembler(T)(S,128>>4,-1312>>4,{startPool:'trial_chambers/chamber/end',yMin:-40,yMax:-20,maxDepth:20,maxDist:116,pad:[10,10],aliases:tj.pool_aliases});
const tc=piecesChests(T,tp).filter(c=>c.table);const cnt={};for(const c of tc)cnt[c.table]=(cnt[c.table]||0)+1;console.log(cnt);
const KO={supply:'보급 상자',corridor:'복도 통',entrance:'입구 상자',intersection:'교차로 상자',intersection_barrel:'교차로 통',reward:'보상 상자'};
const rf=new Set();let i=0;
for(const c of tc.filter(c=>c.table.startsWith('chests')).sort((a,b)=>a.y-b.y||a.z-b.z||a.x-b.x)){rf.add(`r.${c.x>>9}.${c.z>>9}.mca`);console.log(`| ${++i} | ${c.x} ${c.y} ${c.z} | ${KO[c.table.split('/').pop()]} | \`/tp @s ${c.x} ${c.y+1} ${c.z}\` |${W.has(c.x+','+c.y+','+c.z)?'':' (월드X)'}`);}
console.log([...rf]);
const V=JSON.parse(fs.readFileSync('village.json'));const asm=makeAssembler(V);
const starts=JSON.parse(fs.readFileSync('/tmp/oscan.json')).starts.filter(x=>x.id.includes('village'));
const VK={plains_house:'평원 집',savanna_house:'사바나 집',tannery:'가죽 세공인',cartographer:'지도 제작자',weaponsmith:'무기 대장장이'};
for(const st of starts){const ty=st.id.split('_')[1];const pcs=asm(S,st.cx,st.cz,{startPool:`village/${ty}/town_centers`,y:0,heightFn:(x,z)=>e.wg_height(x,z),projectStart:true,maxDepth:6,maxDist:80,hack:true});
 console.log('VILLAGE',ty,st.cx*16,st.cz*16);for(const c of piecesChests(V,pcs).filter(c=>c.table)){const k=c.table.split('/').pop().replace('village_','');console.log(`| ${c.x} ${c.y} ${c.z} | ${VK[k]||k} | \`/tp @s ${c.x} ${c.y+1} ${c.z}\` | r.${c.x>>9}.${c.z>>9}.mca |${W.has(c.x+','+c.y+','+c.z)?' 월드O':' 월드X'}`);}}
