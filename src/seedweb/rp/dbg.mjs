console.log('start');
import('./run263.mjs').then(()=>console.log('done')).catch(e=>console.log('ERR',e.stack));
process.on('exit',c=>console.log('exit',c));
