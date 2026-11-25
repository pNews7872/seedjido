import fs from 'fs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const s=BigInt.asUintN(64,-1764505425291978715n); e.set_seed_dim(Number(s&0xffffffffn),Number(s>>32n),e.mc_wd(),0);
const res=[];const types={};
const UNDER={175:'lush',174:'drip',183:'dark',187:'sulfur'};
for(let tx=-4;tx<4;tx++)for(let tz=-4;tz<4;tz++){
 e.cave_entrances(tx*64,tz*64,64,64,1);
 const a=new Int32Array(e.memory.buffer,e.cave_ptr(),4096).slice();const seen=new Uint8Array(4096);
 for(let k=0;k<4096;k++){if(!a[k]||seen[k])continue;const st=[k];seen[k]=1;let n=0,best=k,bd=0;
  while(st.length){const q=st.pop();n++;const dep=a[q]>>16;if(dep>bd){bd=dep;best=q;}const qi=q%64,qj=(q/64)|0;
   for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ni=qi+di,nj=qj+dj;if(ni<0||nj<0||ni>63||nj>63)continue;const nk=nj*64+ni;if(a[nk]&&!seen[nk]){seen[nk]=1;st.push(nk);}}}
  if(!((n>=3&&bd>=12)||bd>=20))continue;
  const bi=best%64,bj=(best/64)|0,top=(a[best]&0xffff)-64; const x=tx*256+bi*4+2,z=tz*256+bj*4+2,bot=top-bd;
  let t='none'; for(const y of [bot,bot-4,bot-8,bot-12,bot-16]){const b=e.biome_at(x,z,y); if(UNDER[b]){t=UNDER[b];break;}}
  types[t]=(types[t]||0)+1; res.push([n,bd]);}
}
const q=(arr,f)=>{const v=arr.slice().sort((a,b)=>a-b);return f.map(x=>v[Math.floor(x*(v.length-1))]);};
console.log(res.length,'n',q(res.map(r=>r[0]),[.33,.5,.66,.8,.9]),'bd',q(res.map(r=>r[1]),[.33,.5,.66,.8,.9]),types);
const big=res.filter(r=>r[0]>=10||r[1]>=40).length;console.log('big',big);
for(const [a,b] of [[5,28],[6,30],[4,25]])console.log(a,b,res.filter(r=>!(r[0]>=10||r[1]>=40)&&(r[0]>=a||r[1]>=b)).length);
const tier=r=>(r[0]>=20||r[1]>=45)?2:(r[0]>=8||r[1]>=30)?1:0;const c=[0,0,0];for(const r of res)c[tier(r)]++;console.log('tiers',c);
