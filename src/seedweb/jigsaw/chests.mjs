import fs from 'fs'; import {makeAssembler,piecesChests} from './jigsaw.mjs';
const data=JSON.parse(fs.readFileSync('ancient_city.json'));const asm=makeAssembler(data);
const S=-1764505425291978715n;
const pcs=asm(S,7,-90,{startPool:'ancient_city/city_center',startJigsaw:'minecraft:city_anchor',y:-27,maxDepth:7,maxDist:116});
const ch=piecesChests(data,pcs);
const W=new Map(JSON.parse(fs.readFileSync('/tmp/acw.json')).map(w=>[w[0]+','+w[1]+','+w[2],w]));
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,S);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const rd=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
const seqs={};const longs=(cx,cz)=>{const k=cx+','+cz;if(!seqs[k])seqs[k]=rd(e.salt_longs(cx*16,cz*16,70000,12)).trim().split(' ');return seqs[k];};
const used={};let ok=0,bad=0,miss=0;
for(const c of ch){const cx=c.x>>4,cz=c.z>>4,k=cx+','+cz;used[k]=used[k]||0;const seed=longs(cx,cz)[used[k]++];
 const feat=pcs.slice(0,c.piece).filter(q=>q.el.t==='f'&&(q.pos[0]>>4)===cx&&(q.pos[2]>>4)===cz).length;
 const w=W.get(c.x+','+c.y+','+c.z);
 if(!w){miss++;console.log('MISS',c.x,c.y,c.z,c.table,c.block,'piece',c.piece);continue;}
 if(w[3]===seed)ok++;else{bad++;console.log('BAD',c.x,c.y,c.z,'piece',c.piece,'featBefore',feat,'worldIdx',longs(cx,cz).indexOf(w[3]),'used',used[k]-1);}}
console.log('pred',ch.length,'world',W.size,'ok',ok,'bad',bad,'miss',miss);
