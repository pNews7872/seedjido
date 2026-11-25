import fs from 'fs'; import {block} from './blk.mjs';
const m=new WebAssembly.Module(fs.readFileSync('/home/claude/seedweb/seed3.wasm'));
const p=new Proxy({},{get:()=>()=>0});const e=new WebAssembly.Instance(m,{wasi_snapshot_preview1:p,env:p}).exports;
const s=BigInt.asUintN(64,-1764505425291978715n); e.set_seed(Number(s&0xffffffffn),Number(s>>32n),e.mc_wd());
const L=JSON.parse(fs.readFileSync('/tmp/reg/dlists.json'));
const cat={mineshaft:/rail|oak_planks|oak_fence|cobweb|dark_oak|spruce_fence|spruce_planks/,trial:/tuff_brick|copper_block|cut_copper|copper_grate|copper_bulb|waxed|chiseled_tuff|polished_tuff|trial_spawner|vault/,geode:/amethyst|calcite|smooth_basalt|budding/,water:/^water$/,lava:/^lava$/};
async function classify(d){ const [x,y,z]=d; const found=new Set(); let airMismatch=0;
  for(let dx=-6;dx<=6;dx++)for(let dz=-6;dz<=6;dz++)for(let dy=-2;dy<=5;dy++){const r=await block(x+dx,y+dy,z+dz); for(const [k,re] of Object.entries(cat)) if(re.test(r)) found.add(k);
    if(Math.max(Math.abs(dx),Math.abs(dz))===5&&(dy===0||dy===1)&&(r==='air'||r==='cave_air')&&e.dbg_block(x+dx,y+dy,z+dz)===0) airMismatch++;}
  return [...found].join('+')||(airMismatch?'terrain-mismatch':'other'); }
for(const [lab,list] of [['FN',L.fnList],['FP',L.fpList]]){const h={};for(const d of list.slice(0,120)){const c=await classify(d);h[c]=(h[c]||0)+1;}console.log(lab,h);}
