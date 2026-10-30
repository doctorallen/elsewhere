'use strict';
// ---------------------------------------------------------------------------
// The quest log: the running joke, and a real, useful screen. The quest
// under way is at the top with its checklist, the finished ones under it,
// newest first, each with its souvenir, and the main quest at the bottom,
// its progress bar at zero and a line under it that drifts from urgent to
// resigned as the side quests pile up above it. The pack is the other page:
// the souvenirs, which do nothing.
// ---------------------------------------------------------------------------
const MAIN_QUEST = { title: 'Carry the Lantern to the Spire', from: 'The Last Lantern' };
// the main quest's flavor line, by how many side quests are done
const MAIN_FLAVOR = [
  'The Hollow is spreading. The valley has days, not weeks.',
  'The dark is said to be spreading.',
  'The dark is said to be spreading. Probably.',
  'Somebody should probably look into the Hollow.',
  'The Spire will keep.',
  'Is it still spreading? Nobody has said.',
  'The Spire is that way. Roughly.',
];
const Log = {
  open: false, tab: 'quests',
  init() {
    $('bLog').onclick = () => { Snd.cue('page'); this.show(); };
    $('logClose').onclick = () => this.hide();
    for (const b of document.querySelectorAll('#log nav button')) b.onclick = () => { this.tab = b.dataset.tab; Snd.cue('page'); this.draw(); };
    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyL' || e.code === 'Tab') { e.preventDefault(); if (this.open) this.hide(); else if (!Shell.modal()) this.show(); }
      if (e.code === 'Escape' && this.open) this.hide();
    });
  },
  // the log's button, once there's a log
  refresh() {
    const S = Save.data;
    $('bLog').hidden = !S.main;
    $('bLog').classList.toggle('new', !!S.unread);
    if (this.open) this.draw();
  },
  show(tab) {
    if (tab) this.tab = tab;
    this.open = true; Save.data.unread = false; Pad.block();
    $('log').hidden = false; this.draw(); this.refresh();
  },
  hide() { this.open = false; $('log').hidden = true; Pad.block(); },
  draw() {
    for (const b of document.querySelectorAll('#log nav button')) b.classList.toggle('on', b.dataset.tab === this.tab);
    const body = $('logBody');
    body.innerHTML = this.tab === 'pack' ? this.packHtml() : this.questsHtml();
    if (this.tab === 'pack') for (const c of body.querySelectorAll('canvas[data-thing]')) this.thingPicture(c, c.dataset.thing);
    body.scrollTop = 0;
  },
  questsHtml() {
    const S = Save.data, out = [], esc = Log.esc;
    const cur = S.quest && Elsewhere.quests[S.quest];
    if (cur && !cur.opening) {
      const ticks = S.checks || [];
      out.push(`<div class="entry side"><small>Side quest</small><h3>${esc(cur.title)}</h3><p>${esc(cur.ask)}</p><ul>${cur.checklist.map((c, i) => `<li class="${ticks[i] ? 'ticked' : ''}">${esc(c)}</li>`).join('')}</ul>${this.notesHtml(cur.id)}</div>`);
    }
    for (let i = S.done.length - 1; i >= 0; i--) {
      const d = S.done[i];
      out.push(`<div class="entry done"><small>Side quest · done</small><h3>${esc(d.title)}</h3>${d.souvenir ? `<p>Kept: ${esc(d.souvenir)}</p>` : ''}${this.notesHtml(d.id)}</div>`);
    }
    if (S.main) {
      const n = Math.min(S.done.length, MAIN_FLAVOR.length - 1);
      out.push(`<div class="entry main"><small>Main quest · ${esc(MAIN_QUEST.from)}</small><h3>${esc(MAIN_QUEST.title)}</h3><div class="bar"><i></i></div><p class="flavor">${esc(MAIN_FLAVOR[n])}</p></div>`);
    }
    return out.join('') || '<p class="empty">Nothing yet.</p>';
  },
  notesHtml(id) { const n = Save.data.notes[id]; return n && n.length ? n.map((t) => `<p class="mine">“${Log.esc(t)}”</p>`).join('') : ''; },
  packHtml() {
    const S = Save.data, out = [];
    if (S.lantern) out.push(`<div class="thing"><canvas data-thing="lantern" width="16" height="16"></canvas>The Last Lantern<small>Old Aster's</small></div>`);
    for (const t of S.pack) out.push(`<div class="thing"><canvas data-thing="${Log.esc(t.id)}" width="16" height="16"></canvas>${Log.esc(t.name)}<small>${Log.esc(t.from)}</small></div>`);
    return out.length ? `<div class="pack">${out.join('')}</div>` : '<p class="empty">Nothing in the pack.</p>';
  },
  // a souvenir's little picture: the quest that gave it drew it (`souvenir.rows`)
  thingPicture(cv, id) {
    let spr = null;
    if (id === 'lantern') spr = Figure.lantern({ key: 'pack', h: 40 }).c;
    else for (const q of Object.values(Elsewhere.quests)) if (q.souvenir && q.souvenir.id === id && q.souvenir.rows) spr = Tycho.sprite.spriteFrom(q.souvenir.rows, q.souvenir.pal);
    if (!spr) return;
    cv.width = spr.width; cv.height = spr.height;
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(spr, 0, 0);
  },
  esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); },
};
