import fs from 'fs';
const sc=JSON.parse(fs.readFileSync('/tmp/reg/scan.json')); const pred=JSON.parse(fs.readFileSync('/tmp/reg/pred.json'));
const inBox=(c,q,y0,y1)=>c[0]>=q[0]-9&&c[0]<=q[0]+8&&c[2]>=q[2]-9&&c[2]<=q[2]+8&&c[1]>=y0&&c[1]<=y1;
const sm=pred[3].filter(q=>sc.lavaSky.some(c=>inBox(c,q,q[1]-6,q[1]+1)));
console.log('surface pred',pred[3].length,'matched',sm.length);
const all=sc.lavaIn.concat(sc.lavaSky);
const um=pred[2].filter(q=>all.some(c=>inBox(c,q,q[1]-6,q[1]+1)));
console.log('under pred',pred[2].length,'matched',um.length);
// how many actual underground lake-like clusters (n>=20) exist
console.log('actual in clusters',sc.lavaIn.length, 'n>=20', sc.lavaIn.filter(c=>c[3]>=20).length,'sky n>=20',sc.lavaSky.filter(c=>c[3]>=20).length);
