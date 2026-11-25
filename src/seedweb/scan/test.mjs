import fs from 'fs';
const code=fs.readFileSync('scanworker.js','utf8');
const msgs=[];globalThis.postMessage=m=>msgs.push(m);
eval(code.replace('onmessage =','globalThis.onmessage ='));
const buf=fs.readFileSync('r.0.0.mca');
await globalThis.onmessage({data:{dim:0,files:[{name:'r.0.0.mca',arrayBuffer:async()=>buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.length)}]}});
console.log(JSON.stringify(msgs[msgs.length-1]));
