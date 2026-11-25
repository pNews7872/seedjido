import fs from 'fs'; import vm from 'vm';
const src=fs.readFileSync('/home/claude/seedjido-repo/public/app.js','utf8');
const fn=src.slice(src.indexOf('function jigsawLoot'),src.indexOf('const LOOT_ST'));
const jg=src.slice(src.indexOf('// 조각 조립식'),src.indexOf('const AC_DATA'));
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const SU=BigInt.asUintN(64,-1764505425291978715n);const lo=Number(SU&0xffffffffn)|0,hi=Number(SU>>32n)|0;e.set_seed_dim(lo,hi,e.mc_wd(),0);
const ctx={hoverEx:e,mapState:{lo,hi},BigInt,Number,console,TextEncoder,Uint8Array};vm.createContext(ctx);vm.runInContext(jg+fn+';this.f=jigsawLoot;this.mk=makeAssembler;',ctx);
const rdq=q=>{const u=new Uint8Array(e.memory.buffer,q);let n=0;while(u[n])n++;return new TextDecoder().decode(u.slice(0,n));};
for(const [st,name] of [[25,'trial_chambers'],[5,'village']]){
 const d=JSON.parse(fs.readFileSync('/home/claude/seedjido-repo/public/jigsaw/'+name+'.json'));const D={d,asm:ctx.mk(d)};
 const n=e.structs_rect(st,-1500,-1500,1500,1500,512);const a=new Int32Array(e.memory.buffer,e.rect_ptr(),n*4);
 const pos=[];for(let i=0;i<n;i++)pos.push([a[i*4],a[i*4+2]]);
 console.log(name,'found',n,pos.slice(0,4).map(p=>p.join(',')+' ch '+(p[0]>>4)+','+(p[1]>>4)).join(' | '));
 const t=ctx.f(st,D,pos[0][0],pos[0][1],rdq);console.log(t.split('\n').filter(l=>l[0]==='C').length,'containers;',t.split('\n').slice(0,6).join(' / '));
 if(st===5)console.log('type',e.subtype_flag(5,pos[0][0],pos[0][1]));
}
