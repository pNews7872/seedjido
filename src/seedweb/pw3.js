const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('file://' + process.cwd() + '/biome-seed-finder.html'); await p.waitForTimeout(2500);
  for (const fast of [false, true]) {
    if (fast) await p.check('#fast');
    await p.fill('#target','3'); await p.click('#go'); await p.waitForTimeout(20000);
    console.log('fast', fast, 'checked', await p.textContent('#checked'), 'rate', await p.textContent('#rate'), 'found', await p.textContent('#found'), await p.$$eval('tr.row .seed', r => r.map(x=>x.textContent)));
    if (!(await p.isDisabled('#stop'))) await p.click('#stop');
    await p.fill('#start','0');
  }
  await p.screenshot({ path: 'shot3.png' });
  await b.close();
})();
