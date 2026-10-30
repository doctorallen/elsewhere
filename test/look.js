'use strict';
// Pictures of a quest as it plays, for looking at while building one:
// `node test/look.js <id> 200 600 1200` plays ?quest=<id> with its bot (the
// talks answered, the narration read) and takes a screenshot after each
// number of steps, into test/out/look-<id>-<steps>.png. `--portrait` holds
// the phone upright.
const fs = require('fs'), path = require('path');
if (!process.env.CHROME && fs.existsSync('/Applications/Google Chrome.app')) process.env.CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tk = require('../vendor/tycho/dist/testkit.cjs');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
const args = process.argv.slice(2), portrait = args.includes('--portrait'), [id, ...at] = args.filter((a) => a !== '--portrait');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
tk.run('look', async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await tk.serve(ROOT), kit = await tk.launch({});
  try {
    const page = await kit.page(portrait ? tk.PHONE : tk.PHONE_WIDE), errors = tk.errorsOf(page);
    await page.goto(server.url + '?quest=' + id);
    for (let i = 0; i < 50 && !(await page.evaluate(() => !!(window.Game && Game.ready))); i++) await sleep(200);
    let done = 0;
    for (const n of at.map(Number)) {
      await page.evaluate((k) => {
        for (let i = 0; i < k; i++) {
          if (i % 20 === 0) { if (Narrate.open) { if (Narrate.typing) { $('narrateInput').value = 'Wren'; $('narrateAsk').requestSubmit(); } else Narrate.next(); } else if (Talk.open) Talk.pick(0); }
          const c = Shell.cur; if (c && c.q && c.q.bot && Pad.C) Pad.C.bot = Shell.modal() ? null : c.q.bot() || null;
          Shell.step(1 / 60);
        }
      }, n - done);
      done = n; await sleep(250);
      await page.screenshot({ path: path.join(OUT, `look-${id}-${n}${portrait ? '-p' : ''}.png`) });
      console.log(n, JSON.stringify(await page.evaluate(() => Shell.cur && Shell.cur.q && Shell.cur.q.where ? Shell.cur.q.where() : Shell.cur && Shell.cur.def.id)));
    }
    for (const e of errors) console.log('page error: ' + e);
  } finally { await kit.close(); server.close(); }
  return [];
});
