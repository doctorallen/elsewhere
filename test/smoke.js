'use strict';
// The game played headlessly in Chrome, sideways on a phone: it boots without
// an error, the opening plays through to Mrs. Pell's doorstep, and each quest
// is played to its end by its own bot (`q.bot()`: the controls for this step),
// the talks answered with their first answer and the narration read, until
// the handoff starts the next; the log and the pack fill as it goes, and a
// reload in the middle of a quest brings it back. `node test/smoke.js <id>`
// plays one quest alone (?quest=<id>). Screenshots go to test/out. It runs on
// Tycho's test kit: puppeteer-core with the Chrome in $CHROME (as CI does), or
// the game's Playwright.
const fs = require('fs'), path = require('path');
if (!process.env.CHROME && fs.existsSync('/Applications/Google Chrome.app')) process.env.CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tk = require('../vendor/tycho/dist/testkit.cjs');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
const ONLY = process.argv[2] || null;
const ORDER = ['road', 'pell', 'frogs', 'lighthouse'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// put into the page: the game stepped by hand, its screens answered
const HELPERS = `
window.T_ = {
  screens() {
    if (Narrate.open) {
      if (Narrate.typing) { $('narrateInput').value = 'Wren'; $('narrateAsk').requestSubmit(); }
      else Narrate.next();
      return true;
    }
    if (Talk.open) { Talk.pick(0); return true; }
    if (Log.open) { Log.hide(); return true; }
    return false;
  },
  id() { return Shell.cur ? Shell.cur.def.id : Save.data.over ? 'over' : null; },
  // steps until the quest under way is another (or max steps); every 20th
  // step a screen is answered, so a talk is read the way a player would
  play(max) {
    const from = this.id();
    for (let i = 0; i < max; i++) {
      if (i % 20 === 0) this.screens();
      const c = Shell.cur;
      if (c && c.q && c.q.bot && Pad.C) Pad.C.bot = Shell.modal() ? null : c.q.bot() || null;
      Shell.step(1 / 60);
      if (this.id() !== from) return { to: this.id(), steps: i };
    }
    return { to: this.id(), steps: max, stuck: true, at: Shell.cur && Shell.cur.q && Shell.cur.q.where ? Shell.cur.q.where() : null };
  },
};
true`;

tk.run('smoke', async () => {
  const failures = [];
  fs.mkdirSync(OUT, { recursive: true });
  const server = await tk.serve(ROOT);
  const kit = await tk.launch({});
  try {
    const page = await kit.page(tk.PHONE_WIDE), errors = tk.errorsOf(page);
    const url = server.url + (ONLY ? `?quest=${ONLY}` : '');
    await page.goto(url);
    for (let i = 0; i < 50 && !(await page.evaluate(() => !!(window.Game && Game.ready))); i++) await sleep(200);
    if (!ONLY) { await page.evaluate(() => Save.wipe()); await page.reload(); for (let i = 0; i < 50 && !(await page.evaluate(() => !!(window.Game && Game.ready))); i++) await sleep(200); }
    await page.evaluate(HELPERS);
    const E = (fn, arg) => page.evaluate(fn, arg);
    const shot = (n) => page.screenshot({ path: path.join(OUT, `${n}.png`) });
    const list = ONLY ? [ONLY] : ORDER;
    for (const id of list) {
      const at = await E(() => T_.id());
      if (at !== id) { failures.push(`expected ${id} under way, found ${at}`); break; }
      await sleep(300); await shot(`${id}-start`);
      // a little way in: a picture, then a reload that must bring it back
      let r = await E(() => T_.play(400));
      await sleep(200); await shot(`${id}-in`);
      if (!ONLY && r.to === id) {
        const before = await E(() => { Save.write(); return JSON.stringify(Save.data.q); });
        await page.reload();
        for (let i = 0; i < 50 && !(await page.evaluate(() => !!(window.Game && Game.ready))); i++) await sleep(200);
        await page.evaluate(HELPERS);
        const after = await E(() => ({ id: T_.id(), q: JSON.stringify(Save.data.q) }));
        if (after.id !== id) failures.push(`${id}: a reload came back to ${after.id}`);
        else if (before !== after.q) console.log(`  (${id}: its state after a reload differs a little: ${before.slice(0, 80)} / ${after.q.slice(0, 80)})`);
      }
      if (r.to === id) r = await E(() => T_.play(30000));
      console.log(`${id}: ${r.stuck ? 'stuck' : 'done'} after ${r.steps} steps, then ${r.to}${r.at ? ' (at ' + JSON.stringify(r.at) + ')' : ''}`);
      await sleep(300); await shot(`${id}-end`);
      if (r.stuck) { failures.push(`${id}: never finished (at ${JSON.stringify(r.at)})`); break; }
      if (ONLY) {
        const done = await E(() => Save.data.done.map((d) => d.id));
        if (id !== 'road' && !done.includes(id)) failures.push(`${id}: finished, but isn't in the log as done`);
      }
    }
    if (!ONLY && !failures.length) {
      const S = await E(() => ({ done: Save.data.done.map((d) => d.id), pack: Save.data.pack.map((p) => p.id), main: Save.data.main, lantern: Save.data.lantern, over: !!Save.data.over }));
      console.log('  log:', S.done.join(', '), '· pack:', S.pack.join(', '));
      if (!S.main || !S.lantern) failures.push('the opening gave no Lantern or main quest');
      if (S.done.join() !== 'pell,frogs,lighthouse') failures.push('the log has ' + S.done.join());
      if (S.pack.length !== 3) failures.push('the pack has ' + S.pack.length + ' things');
      if (!S.over) failures.push('the slice did not reach its end card');
      await E(() => { Narrate.close(); Log.show('quests'); }); await sleep(300); await shot('log');
      await E(() => Log.show('pack')); await sleep(300); await shot('pack');
    }
    for (const e of errors) failures.push('page error: ' + e);
  } finally { await kit.close(); server.close(); }
  return failures;
});
