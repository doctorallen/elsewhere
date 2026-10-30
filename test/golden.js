'use strict';
// A golden per quest: its first frame, painted from its seed (the run's seed
// is the same every time), with the loop held and the sparkle's randomness
// (Tycho.seed.fxRand) pinned, hashed and compared with test/golden.json. A
// change to a quest's painting, its sprites or the player's figure shows up
// here; when it's meant, `npm run golden:update` writes the new hashes.
const fs = require('fs'), path = require('path');
if (!process.env.CHROME && fs.existsSync('/Applications/Google Chrome.app')) process.env.CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tk = require('../vendor/tycho/dist/testkit.cjs');
const ROOT = path.join(__dirname, '..'), FILE = path.join(__dirname, 'golden.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
tk.run('golden', async () => {
  const server = await tk.serve(ROOT), kit = await tk.launch({}), values = {}, failures = [];
  try {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const ids = [...html.matchAll(/src="quests\/([^/]+)\//g)].map((m) => m[1]);
    for (const id of ids) {
      const page = await kit.page({ width: 844, height: 390, mobile: true, scale: 1 }), errors = tk.errorsOf(page);
      const hold = () => { window.ELSEWHERE_HOLD = true; };
      if (page.evaluateOnNewDocument) await page.evaluateOnNewDocument(hold); else await page.addInitScript(hold);
      await page.goto(server.url + '?quest=' + id);
      for (let i = 0; i < 50 && !(await page.evaluate(() => !!(window.Game && Game.ready))); i++) await sleep(100);
      await page.evaluate(tk.PAGE);
      values[id] = await page.evaluate(() => {
        const R = Tycho.seed.fxRand;
        R.f = (a = 1, b) => (b === undefined ? a * 0.5 : (a + b) / 2); R.i = (a, b) => Math.floor((a + b) / 2); R.pick = (l) => l[0];
        Shell.draw();
        const c = View.cv;
        return c.width + 'x' + c.height + ':' + TK.hash(c.getContext('2d').getImageData(0, 0, c.width, c.height).data);
      });
      for (const e of errors) failures.push(`${id}: page error: ${e}`);
      await page.close();
    }
  } finally { await kit.close(); server.close(); }
  return failures.concat(tk.golden(FILE, values, { update: process.argv.includes('--update') }));
});
