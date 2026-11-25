import fs from 'fs'; import {makeAssembler} from './jigsaw.mjs';
const data=JSON.parse(fs.readFileSync('trial_chambers.json'));const asm=makeAssembler(data);
const S=-1764505425291978715n;
const js=JSON.parse(fs.readFileSync('/tmp/mcm/mcmeta/data/minecraft/worldgen/structure/trial_chambers.json'));
const starts=JSON.parse(fs.readFileSync('/tmp/oscan.json')).starts.filter(x=>x.id==='minecraft:trial_chambers');
let full=0;
for(const st of starts){
 const pcs=asm(S,st.cx,st.cz,{startPool:'trial_chambers/chamber/end',yMin:-40,yMax:-20,maxDepth:20,maxDist:116,pad:[10,10],aliases:js.pool_aliases});
 const w=st.ch;let ok=0,first=-1;
 for(let i=0;i<w.length;i++){if(pcs[i]&&pcs[i].bb.join(',')===w[i].bb.join(','))ok++;else if(first<0)first=i;}
 if(ok===w.length&&pcs.length===w.length)full++;
 else console.log(st.cx,st.cz,'ok',ok,'/',w.length,'pred',pcs.length,'first',first,first>=0?(pcs[first]?(pcs[first].el.l||pcs[first].el.t)+' '+pcs[first].bb:'-')+' | '+w[first].t+' '+w[first].bb:'');
}
console.log('full match',full,'/',starts.length);
