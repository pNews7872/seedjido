const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('file://' + process.cwd() + '/biome-seed-finder.html'); await p.waitForTimeout(2500);
  console.log('rows', await p.$$eval('tr.row .seed', r => r.map(x=>x.textContent)));
  await p.click('#tabMap'); await p.waitForTimeout(5000);
  const box = await p.$eval('#bigmap', c => { const r = c.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  // pan by mouse drag
  await p.mouse.move(box[0]+400, box[1]+300); await p.mouse.down(); await p.mouse.move(box[0]+250, box[1]+250, {steps: 5}); await p.mouse.up();
  await p.waitForTimeout(1500);
  await p.mouse.move(box[0]+300, box[1]+300);
  console.log(await p.textContent('#cursorInfo'), '|', await p.textContent('#hiddenNote'));
  await p.screenshot({ path: 'shot5.png' });
  // zoom out a lot
  for (let i=0;i<5;i++) await p.click('#zout'); await p.waitForTimeout(3000);
  console.log('zoomed out note:', await p.textContent('#hiddenNote'));
  await p.screenshot({ path: 'shot5b.png' });
  await b.close();
})();
