import fs from 'fs';
const buf=fs.readFileSync('/home/claude/seedweb/seed3.wasm');
let mem; const fdw=(fd,iov,n,nw)=>{const v=new DataView(mem.buffer);let t=0;for(let i=0;i<n;i++)t+=v.getUint32(iov+i*8+4,true);v.setUint32(nw,t,true);return 0;};
const st=new Proxy({fd_write:fdw},{get:(o,k)=>o[k]||(()=>0)});
const {instance}=await WebAssembly.instantiate(buf,{wasi_snapshot_preview1:st,env:st}); const ex=instance.exports; mem=ex.memory;
export function load(seed){ const s=BigInt.asUintN(64,BigInt(seed)); const V=+(process.env.V||19); ex.set_mcv(V); ex.set_seed(Number(s&0xffffffffn),Number(s>>32n),V); return ex; }
const seed=process.argv[2]||'12345', R=+(process.argv[3]||600);
load(seed);
const n=ex.structs_rect(11,-R,-R,R,R,64), a=new Int32Array(mem.buffer,ex.rect_ptr(),n*4).slice();
const VP=['지표','땅속','산속','반쯤묻힘','물밑'];
for(let i=0;i<n;i++){const x=a[i*4],z=a[i*4+2];const t0=performance.now();const r=ex.rp_frame(x,z);const o=new Int32Array(mem.buffer,ex.out_ptr(),128);
 console.log(x,z,'need',r,'y',o[100],VP[o[101]],'tmpl',o[102]<10?'portal_'+(o[102]+1):'giant_'+(o[102]-9),'cry',o[104],'okObs',o[105],'rot',o[106],'mir',o[107],'frame z',o[108],o[109],'y',o[110],o[111],(performance.now()-t0).toFixed(1)+'ms');}
console.log('h(0,0)',ex.rp_height(0,0),'h(100,100)',ex.rp_height(100,100));
