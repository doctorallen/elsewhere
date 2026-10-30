'use strict';
// The quests as declared, in Node (no page): every quest declares every
// field, the ways line up (a handoff leaves by a way its quest offers and
// arrives by one the next accepts), every quest can be reached from the
// opening, and every quest but the last can be left. The graph is printed.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const files = [...html.matchAll(/src="(quests\/[^"]+)"/g)].map((m) => m[1]);
// the shell's registry, as js/shell.js has it, read from there
const shell = fs.readFileSync(path.join(ROOT, 'js/shell.js'), 'utf8');
const reg = shell.slice(shell.indexOf('const QUEST_FIELDS'), shell.indexOf('const Shell'));
const box = { Tycho: require(path.join(ROOT, 'vendor/tycho/dist/tycho.cjs')), Tyrell: require(path.join(ROOT, 'vendor/tycho/dist/tyrell.cjs')), console };
vm.createContext(box);
vm.runInContext(reg + '\nthis.Elsewhere = Elsewhere; this.QUEST_FIELDS = QUEST_FIELDS;', box);
const fails = [];
for (const f of files) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), box, { filename: f }); } catch (e) { fails.push(`${f}: ${e.message}`); }
}
const { quests, ways } = box.Elsewhere, ids = Object.keys(quests);
for (const q of Object.values(quests)) {
  if (typeof q.make !== 'function') fails.push(`${q.id}: make is not a function`);
  for (const k of ['accepts', 'offers', 'checklist']) if (!Array.isArray(q[k])) fails.push(`${q.id}: ${k} is not a list`);
  if (!q.opening) {
    if (!q.checklist.length) fails.push(`${q.id}: an empty checklist`);
    if (!q.souvenir || !q.souvenir.id || !q.souvenir.name || !q.souvenir.rows || !q.souvenir.pal) fails.push(`${q.id}: a souvenir needs an id, a name, rows and a palette`);
    if (!q.controls || !['stick', 'tap', 'none'].includes(q.controls.layout)) fails.push(`${q.id}: controls.layout is stick, tap or none`);
  }
}
for (const w of ways) {
  const a = quests[w.from], b = quests[w.to];
  if (!a || !b) { fails.push(`a handoff names a missing quest: ${w.from} → ${w.to}`); continue; }
  if (!a.offers.includes(w.way)) fails.push(`${w.from} doesn't offer '${w.way}'`);
  if (!b.accepts.includes(w.way)) fails.push(`${w.to} doesn't accept '${w.way}'`);
}
// reached from the opening; left by a handoff (all but one: the end of what's built)
const start = Object.values(quests).find((q) => q.opening);
if (!start) fails.push('no opening');
const seen = new Set(start ? [start.id] : []), queue = start ? [start.id] : [];
while (queue.length) { const id = queue.shift(); for (const w of ways) if (w.from === id && !seen.has(w.to)) { seen.add(w.to); queue.push(w.to); } }
for (const id of ids) if (!seen.has(id)) fails.push(`${id} can't be reached from the opening`);
const ends = ids.filter((id) => !ways.some((w) => w.from === id));
if (ends.length > 1) fails.push(`more than one quest can't be left: ${ends.join(', ')}`);
for (const w of ways) console.log(`  ${w.from} —${w.way}→ ${w.to}`);
if (ends.length) console.log(`  ${ends[0]} —${quests[ends[0]].offers.join('/')}→ (the end of what's built)`);
if (fails.length) { console.log('quests: FAIL'); for (const f of fails) console.log('  ' + f); process.exit(1); }
console.log(`quests: ok (${ids.length})`);
