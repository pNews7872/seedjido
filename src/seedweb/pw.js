const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('console', m => console.log('console', m.type(), m.text()));
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('file://' + process.cwd() + '/biome-seed-finder.html');
  await p.waitForTimeout(2500);
  console.log('rows', await p.$$eval('tr.row', r => r.length));
  await p.click('#go'); await p.waitForTimeout(25000);
  console.log('checked', await p.textContent('#checked'), 'rate', await p.textContent('#rate'), 'found', await p.textContent('#found'));
  console.log(await p.$$eval('tr.row .seed', r => r.map(x => x.textContent)));
  await p.screenshot({ path: 'shot.png', fullPage: true });
  await b.close();
})();
