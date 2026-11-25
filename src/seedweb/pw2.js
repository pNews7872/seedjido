const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('file://' + process.cwd() + '/biome-seed-finder.html'); await p.waitForTimeout(2500);
  console.log('rows', await p.$$eval('tr.row .seed', r => r.map(x=>x.textContent)));
  // select only dappled forest
  await p.click('button.chip[title="pale_garden"]'); await p.click('button.chip[title="mangrove_swamp"]'); await p.click('button.chip[title="dappled_forest"]');
  await p.click('#go'); await p.waitForTimeout(8000);
  console.log('found', await p.textContent('#found'), await p.$$eval('tr.row .seed', r => r.map(x=>x.textContent)).then(a=>a.slice(0,5)));
  await b.close();
})();
