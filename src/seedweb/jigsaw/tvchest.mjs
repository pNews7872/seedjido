import fs from 'fs'; import {makeAssembler,piecesChests} from './jigsaw.mjs';
const S=-1764505425291978715n;
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,S);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const rd=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
const W=new Map(JSON.parse(fs.readFileSync('/tmp/tvw.json')).map(w=>[w[0]+','+w[1]+','+w[2],w]));
const starts=JSON.parse(fs.readFileSync('/tmp/oscan.json')).starts;
const kind=process.argv[2];
const data=JSON.parse(fs.readFileSync(kind==='t'?'trial_chambers.json':'village.json'));const asm=makeAssembler(data);
const tj=JSON.parse(fs.readFileSync('/tmp/mcm/mcmeta/data/minecraft/worldgen/structure/trial_chambers.json'));
const VI={desert:39,plains:40,savanna:41,snowy:42,taiga:43};
let ok=0,bad=0,miss=0,nolt=0,featBad=0,matched=new Set();
for(const st of starts.filter(s=>kind==='t'?s.id.includes('trial'):s.id.includes('village'))){
 const ty=st.id.split('_')[1];
 const pcs=kind==='t'?asm(S,st.cx,st.cz,{startPool:'trial_chambers/chamber/end',yMin:-40,yMax:-20,maxDepth:20,maxDist:116,pad:[10,10],aliases:tj.pool_aliases})
   :asm(S,st.cx,st.cz,{startPool:`village/${ty}/town_centers`,y:0,heightFn:(x,z)=>e.wg_height(x,z),projectStart:true,maxDepth:6,maxDist:80,hack:true});
 const salt=kind==='t'?30004:40000+VI[ty];
 const seqs={},used={};
 for(const c of piecesChests(data,pcs)){const cx=c.x>>4,cz=c.z>>4,k=cx+','+cz;
  if(!seqs[k])seqs[k]=rd(e.salt_longs(cx*16,cz*16,salt,64)).trim().split(' ');used[k]=used[k]||0;const sd=seqs[k][used[k]++];
  if(!c.table){nolt++;continue;}
  const w=W.get(c.x+','+c.y+','+c.z);
  if(!w){miss++;continue;}
  matched.add(c.x+','+c.y+','+c.z);
  if(w[3]===sd)ok++;else{bad++;const feat=pcs.slice(0,c.piece).some(q=>q.el.t==='f'&&(q.pos[0]>>4)===cx&&(q.pos[2]>>4)===cz);if(feat)featBad++;else if(bad-featBad<6)console.log('BAD',c.x,c.y,c.z,c.table,'piece',c.piece,'idx',seqs[k].indexOf(w[3]),'used',used[k]-1);}}
}
const wn=[...W.values()].filter(w=>kind==='t'?w[4].includes('trial'):w[4].includes('village'));
console.log(kind,'ok',ok,'bad',bad,'(after feature in chunk:',featBad,') pred-missing-in-world',miss,'noLootTable',nolt,'world total',wn.length,'unmatched world',wn.filter(w=>!matched.has(w[0]+','+w[1]+','+w[2])).length);
