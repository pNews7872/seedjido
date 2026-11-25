import fs from 'fs'; import {makeAssembler} from './jigsaw.mjs';
const data=JSON.parse(fs.readFileSync('ancient_city.json'));
const asm=makeAssembler(data);
const S=-1764505425291978715n;
const t0=Date.now();
const pcs=asm(S,7,-90,{startPool:'ancient_city/city_center',startJigsaw:'minecraft:city_anchor',y:-27,maxDepth:7,maxDist:116});
console.log('pieces',pcs.length,(Date.now()-t0)+'ms');
const w=JSON.parse(fs.readFileSync('/tmp/oscan.json')).starts.find(x=>x.id==='minecraft:ancient_city').ch;
const nm=p=>p.el.t==='s'?p.el.l:p.el.t==='l'?'LIST:'+p.el.e[0].l:p.el.t==='f'?'feature':'?';
let ok=0;for(let i=0;i<Math.max(pcs.length,w.length);i++){const a=pcs[i],b=w[i];const an=a?nm(a)+' '+a.bb.join(','):'-';const bn=b?String(b.t||'').replace('minecraft:','')+' '+b.bb.join(','):'-';const same=a&&b&&a.bb.join(',')===b.bb.join(',');if(same)ok++;if(!same&&i<4)console.log(i,same?'OK':'XX',an,'|',bn);}
console.log('same',ok,'/',w.length);
