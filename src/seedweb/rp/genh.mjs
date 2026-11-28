import fs from 'fs';
const a=JSON.parse(fs.readFileSync('t116.json'));
// 틀 정의: [평면 x, z0, z1, y0, y1]  (portal_4는 맨 윗줄이 통째로 없어서 위로 한 칸 늘림, portal_10은 쓰러진 틀)
const F={portal_1:[3,1,4,2,6],portal_2:[5,2,5,4,8],portal_3:[4,2,5,3,7],portal_4:[4,2,5,3,7],portal_5:[2,1,4,3,8],portal_6:[2,0,4,1,5],portal_7:[3,2,5,0,4],portal_8:[5,2,6,3,8],portal_9:[4,3,6,1,5],portal_10:null,giant_portal_1:[5,4,11,3,12],giant_portal_2:[5,4,11,3,12],giant_portal_3:[5,4,11,3,12]};
const order=[...Array.from({length:10},(_,i)=>'portal_'+(i+1)),'giant_portal_1','giant_portal_2','giant_portal_3'];
let h='/* 폐허가 된 차원문 설계도: 크기, 틀(평면 x, z0..z1, y0..y1), 틀 자리에 있는 흑요석 (y,z) — rp/genh.mjs로 만듦 */\n';
h+='static const int RP_T[13][8] = {\n';
const pos=[];
for(const k of order){const t=a[k],f=F[k];let n0=pos.length;
  if(f){const [px,z0,z1,y0,y1]=f;for(const o of t.o){if(o[0]!==px)continue;const [x,y,z]=o;const edge=(z===z0||z===z1||y===y0||y===y1),corner=(z===z0||z===z1)&&(y===y0||y===y1);if(edge&&!corner&&z>=z0&&z<=z1&&y>=y0&&y<=y1)pos.push([y,z]);}}
  h+=`  {${t.s.join(',')}, ${f?f.join(','):'-1,0,0,0,0'}}, /* ${k}: 틀 흑요석 ${pos.length-n0} */\n`;
  F[k+'_n']=[n0,pos.length];}
h+='};\nstatic const int RP_N[13][2] = {'+order.map(k=>`{${F[k+'_n'].join(',')}}`).join(',')+'};\n';
h+='static const signed char RP_P['+pos.length+'][2] = {'+pos.map(p=>`{${p}}`).join(',')+'};\n';
fs.writeFileSync('../rp_tables.h',h);console.log(h.split('\n').slice(0,16).join('\n'));
// 틀 평면 기둥 맨 위가 흑요석이고 높이 3 이하인 곳 (우는 흑요석이 되면 게임이 네더랙으로 덮고, 그 밑 블록도 네더랙·마그마로 바꿈)
const tops=JSON.parse(fs.readFileSync('tops116.json'));
let h2='static const signed char RP_TOPO[13][16] = {\n';
for(const k of order){const row=new Array(16).fill(-1);const t=tops[k]||{};for(const z in t){if(t[z][1]==='obsidian'&&t[z][0]<=3)row[+z]=t[z][0];}h2+=`  {${row.join(',')}}, /* ${k} */\n`;}
h2+='};\n'; fs.appendFileSync('../rp_tables.h',h2);
