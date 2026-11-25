const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1360, height: 1000 } });
  p.on('pageerror', e => console.log('pageerror', e.message));
  p.on('console', m => { if (m.type()==='error' && !m.text().includes('TUNNEL')) console.log('console', m.text()); });
  await p.goto('file://' + process.cwd() + '/biome-seed-finder.html'); await p.waitForTimeout(3000);
  console.log('rows', await p.$$eval('tr.row .seed', r => r.map(x=>x.textContent)));
  // structure search: deselect biomes, select village + ancient city, radius 800
  await p.click('#chips button[title="pale_garden"]'); await p.click('#chips button[title="mangrove_swamp"]');
  await p.click('#schips button:has-text("마을")'); await p.click('#schips button:has-text("고대 도시")');
  await p.fill('#radius','800'); await p.fill('#target','5');
  await p.click('#go'); await p.waitForTimeout(12000);
  console.log('struct search', await p.textContent('#checked'), await p.textContent('#rate'), await p.textContent('#found'), await p.$$eval('tr.row .seed', r => r.map(x=>x.textContent)));
  await p.screenshot({ path: 'shot4a.png', fullPage: false });
  await p.click('#tabMap'); await p.waitForTimeout(6000);
  await p.screenshot({ path: 'shot4b.png' });
  console.log(await p.textContent('#nearList'));
  await b.close();
})();
