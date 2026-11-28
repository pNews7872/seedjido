import {JRandom} from './jigsaw.mjs'; import fs from 'fs';
const D=JSON.parse(fs.readFileSync('village_1_16.json'));
const j=D.T['village/plains/town_centers/plains_meeting_point_1'].j;
const rotPos=(x,y,z,r)=>r===0?[x,y,z]:r===1?[-z,y,x]:r===2?[-x,y,-z]:[z,y,-x];
const pos=[-752,69,-416], r=3;
const P=j.map(q=>{const p=rotPos(q[0],q[1],q[2],r);return [p[0]+pos[0],p[2]+pos[2],q[7].split('/').pop()];});
console.log(P.map((p,i)=>i+':'+p.join(',')).join(' '));
// world order by junction source (x,z): 
const W=[[-749,-422],[-745,-421],[-744,-417],[-748,-416],[-750,-418],[-743,-420],[-752,-421],[-746,-417],[-747,-425],[-751,-417]];
const order=W.map(([x,z])=>P.findIndex(p=>p[0]===x&&p[1]===z)); console.log('world order idx',order.join(','));
function shuf(list,rnd){for(let i=list.length;i>1;i--){const k=rnd.nextInt(i);const t=list[i-1];list[i-1]=list[k];list[k]=t;}return list;}
const seed=12345n;
for(let k=0;k<3000;k++){const rnd=new JRandom(0n);rnd.setLargeFeatureSeed(seed,-47,-26);for(let q=0;q<k;q++)rnd.nextInt(2);
 const l=shuf([...Array(11).keys()],rnd); if(order.every((o,i)=>l[i]===o)) console.log('match skip',k,l.join(','));}
{const rnd=new JRandom(0n);rnd.setLargeFeatureSeed(seed,-47,-26);rnd.nextInt(4);rnd.nextInt(3); console.log('ours',shuf([...Array(11).keys()],rnd).join(','));}
for(let k=0;k<8;k++){const rnd=new JRandom(0n);rnd.setLargeFeatureSeed(seed,-47,-26);rnd.nextInt(4);rnd.nextInt(3);shuf([...Array(11).keys()],rnd);for(let q=0;q<k;q++)rnd.nextInt(2);console.log('extra',k,'rot order',shuf([0,1,2,3],rnd).join(','));}
