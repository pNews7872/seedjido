import fs from 'fs'; import {makeAssembler} from './jigsaw.mjs';
const data=JSON.parse(fs.readFileSync('village.json'));const asm=makeAssembler(data);
const S=-1764505425291978715n;
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,S);e.set_seed_dim(Number(SU&0xffffffffn),Number(SU>>32n),e.mc_wd(),0);
const off=+(process.argv[2]||0);
const hf=(x,z)=>e.wg_height(x,z)+off;
const starts=JSON.parse(fs.readFileSync('/tmp/oscan.json')).starts.filter(x=>x.id.includes('village'));
for(const st of starts){const ty=st.id.split('_')[1];
 const pcs=asm(S,st.cx,st.cz,{startPool:`village/${ty}/town_centers`,y:0,heightFn:hf,projectStart:true,maxDepth:6,maxDist:80,hack:true});
 const w=st.ch;let ok=0,okxz=0,first=-1;
 for(let i=0;i<w.length;i++){const a=pcs[i]&&pcs[i].bb,b=w[i].bb;if(a&&a.join()===b.join())ok++;if(a&&a[0]===b[0]&&a[2]===b[2]&&a[3]===b[3]&&a[5]===b[5])okxz++;else if(first<0)first=i;}
 console.log(ty,st.cx,st.cz,'exact',ok,'xz',okxz,'/',w.length,'pred',pcs.length,first>=0?'first '+first+' '+(pcs[first]?(pcs[first].el.l||pcs[first].el.t)+' '+pcs[first].bb:'-')+' | '+w[first].t+' '+w[first].bb:'');
}
if(process.argv[3]){const st=starts[+process.argv[3]];const ty=st.id.split('_')[1];
const pcs=asm(S,st.cx,st.cz,{startPool:`village/${ty}/town_centers`,y:0,heightFn:hf,projectStart:true,maxDepth:6,maxDist:80,hack:true});
for(let i=0;i<16;i++){const a=pcs[i],b=st.ch[i];console.log(i,(a.el.l||a.el.t),a.el.pr,a.bb.join(),'|',b.t,b.bb.join(),'dy',b.bb[1]-a.bb[1],b.bb[4]-a.bb[4]);}}
