'use strict';
// ---------------------------------------------------------------------------
// The dev panel, with ?dev in the address (or the backquote key once it's
// been shown): jump to any quest by any way in, finish the one under way by
// any of its ways out, put anything in the pack, see the save, start over.
// `?quest=<id>&way=<way>` in the address starts a quest at once (a fresh
// save of its own, so the real one isn't touched).
// ---------------------------------------------------------------------------
const Dev = {
  flags: null,
  init() {
    this.flags = new Tycho.dev.Flags('elsewhere.dev', {}).load();
    const on = this.flags.shown();
    $('bDev').hidden = !on;
    $('bDev').onclick = () => this.toggle();
    addEventListener('keydown', (e) => { if (e.code === 'Backquote' && this.flags.shown()) this.toggle(); });
  },
  // a quest asked for in the address
  asked() {
    const p = new URLSearchParams(location.search), id = p.get('quest');
    return id && Elsewhere.quests[id] ? { id, way: p.get('way') || Elsewhere.quests[id].accepts[0] } : null;
  },
  toggle() { const el = $('dev'); el.hidden = !el.hidden; if (!el.hidden) this.draw(); },
  draw() {
    const el = $('dev'), S = Save.data, c = Shell.cur;
    const qs = Object.values(Elsewhere.quests);
    el.innerHTML = `<h4>Quest under way</h4><pre>${Log.esc(S.quest || '(none)')} by ${Log.esc(S.way || '-')}\nchecks ${JSON.stringify(S.checks)}</pre>` +
      (c ? `<h4>Finish it by</h4>${c.def.offers.map((w) => `<button data-finish="${w}">${w}</button>`).join('')}` : '') +
      `<h4>Jump to</h4>${qs.map((q) => q.accepts.map((w) => `<button data-jump="${q.id}|${w}">${q.id} ← ${w}</button>`).join('')).join('<br>')}` +
      `<h4>Pack</h4>${qs.filter((q) => q.souvenir).map((q) => `<button data-give="${q.id}">+ ${Log.esc(q.souvenir.name)}</button>`).join('')}` +
      `<h4>Save</h4><button data-wipe="1">Start over</button><pre>${Log.esc(JSON.stringify(Object.assign({}, S, { q: S.q ? '…' : null, minds: S.minds ? '…' : null }), null, 1))}</pre>`;
    Tycho.ui.bind(el, {
      finish: (w) => { this.toggle(); Shell.cur.ctx.done(w); },
      jump: (v) => { const [id, w] = v.split('|'); this.toggle(); Shell.fadeTo(() => Shell.begin(id, w)); },
      give: (id) => { const q = Elsewhere.quests[id]; S.pack.push({ id: q.souvenir.id, name: q.souvenir.name, from: q.title }); Log.refresh(); this.draw(); },
      wipe: () => { Save.wipe(); location.reload(); },
    });
  },
};
