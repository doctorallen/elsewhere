'use strict';
// ---------------------------------------------------------------------------
// The shell: what crosses worlds, and the frame every quest runs inside.
//
// A quest is one declaration, registered with `Elsewhere.quest({...})` from
// inside its own closure (a quest declares no globals). The shell starts it
// (its view, controls, sound and title card), hands it a `ctx`, steps and
// draws it, saves it, and when it's done puts its souvenir in the pack,
// writes it in the log and follows its handoff to the next. The quest owns
// its world and nothing else; the shell owns the Lantern, the pack, the log,
// the player's name and the save, and never reaches inside a quest.
//
// A quest's fields:
//   id, title, ask        who wants what, in a line
//   view, hold, px        'iso' | 'side' | 'top' | 'room' | 'text'; which way up the
//                         phone goes; its short side in pixels (180)
//   accepts, offers       the ways in it can take, and out it can give
//   souvenir              { id, name, rows, pal }: what it leaves in the pack
//   checklist             the log's lines for it, ticked by ctx.tick(i)
//   controls              Pad's declaration: { layout, a, b }
//   talkLook              the talk box's look ('serif', 'pond', 'night')
//   sounds, score         its cues, and its music (Snd)
//   make(ctx, way, saved) its live state: { step(dt), draw(g), save(), end(),
//                         idle(dt) while a screen is up, bot(T) for the tests }
// ---------------------------------------------------------------------------
const QUEST_FIELDS = ['id', 'title', 'ask', 'view', 'hold', 'accepts', 'offers', 'souvenir', 'checklist', 'controls', 'make'];
const Elsewhere = {
  quests: {},
  // the handoffs, written by hand for the slice: { from, way, to }
  ways: [],
  quest(def) {
    const miss = QUEST_FIELDS.filter((k) => def[k] === undefined);
    if (miss.length) throw new Error(`quest ${def.id || '?'} is missing ${miss.join(', ')}`);
    if (this.quests[def.id]) throw new Error(`quest ${def.id} is declared twice`);
    this.quests[def.id] = def;
    return def;
  },
  handoff(from, way, to) { this.ways.push({ from, way, to }); },
  // where a way out of a quest leads (null: nowhere yet)
  next(from, way) { const h = this.ways.find((w) => w.from === from && w.way === way); return h ? h.to : null; },
};

const Shell = {
  // the quest under way: { def, q, ctx, world, done }
  cur: null,
  t: 0, frame: 0,
  fading: null,
  toasts: null,
  titleAt: -99, wasModal: false,
  init() {
    this.toasts = new Tycho.ui.Toasts({
      box: () => $('toasts'), redraw: true, html: true, most: 3, life: 4, fadeAt: 3.4, merge: 2,
      clock: () => this.t, cls: (kind) => 'toast ' + (kind || ''),
    });
  },
  // a screen is up, or the phone's the wrong way: the quest waits
  modal() { return Talk.open || Log.open || Narrate.open || !!this.fading || View.wrongWay(); },
  toast(text, kind) { this.toasts.show(kind === 'quest' ? text : Log.esc(text), kind); },
  questToast(kind, title) { this.toast(`<small>${Log.esc(kind)}</small>${Log.esc(title)}`, 'quest'); },
  prompt(text) { const el = $('prompt'); el.hidden = !text; if (text && el.textContent !== text) el.textContent = text; },
  // starts a quest: by a way in, fresh, or from its saved state
  begin(id, way, saved, resumed) {
    this.end();
    const def = Elsewhere.quests[id], S = Save.data;
    if (!def) throw new Error('no quest ' + id);
    if (!resumed) { S.quest = id; S.way = way; S.checks = def.checklist.map(() => false); S.q = null; S.minds = null; }
    document.body.dataset.look = def.talkLook || '';
    View.setup({ px: def.px, hold: def.hold });
    Pad.start(def.controls);
    Snd.add(def.sounds); Snd.play(def.score || null);
    const ctx = this.ctx(def, resumed ? S.minds : null);
    this.cur = { def, ctx, q: null, world: null, done: false };
    this.cur.q = def.make(ctx, way, resumed ? saved || null : null);
    if (!def.opening) {
      this.title(def.title);
      if (!resumed) { S.unread = true; Snd.cue('quest'); }
    }
    Log.refresh();
    Save.write();
  },
  title(name) {
    const el = $('titlecard');
    $('titleKind').textContent = 'Side quest'; $('titleName').textContent = name;
    el.hidden = true; void el.offsetWidth; el.hidden = false; this.titleAt = this.t;
  },
  // lets the quest under way go: everything it made goes with it
  end() {
    const c = this.cur;
    if (!c) return;
    if (c.q && c.q.end) c.q.end();
    Pad.stop();
    if (Talk.open) { Talk.o = null; Talk.close(); }
    if (Narrate.open) { Narrate.o = null; Narrate.close(); }
    this.prompt(null);
    this.cur = null;
  },
  // the quest's state and its people into the save
  stash() {
    const S = Save.data, c = this.cur;
    if (!c || c.done) return;
    S.q = c.q && c.q.save ? c.q.save() : null;
    S.minds = c.world ? TychoMinds.stash(c.world) : null;
  },
  // what a quest is given
  ctx(def, minds) {
    const S = Save.data, id = def.id, self = this;
    return {
      id, def,
      seed: Tycho.seed.hashString(S.seed + ':' + id),
      rng: (name = '') => new Tycho.seed.Rng(Tycho.seed.hashString(S.seed + ':' + id + ':' + name)),
      view: View, pad: Pad, snd: Snd, figure: Figure,
      get name() { return S.name || 'Wren'; },
      setName(n) { S.name = n || 'Wren'; },
      get lantern() { return S.lantern; },
      giveLantern() { S.lantern = true; Log.refresh(); },
      // the main quest goes in the log
      openMain() { S.main = true; S.unread = true; Log.refresh(); self.questToast('Main quest', MAIN_QUEST.title); Snd.cue('quest'); },
      pack: { has: (thing) => S.pack.some((p) => p.id === thing), list: () => S.pack.slice() },
      tick(i) {
        if (S.checks[i]) return;
        S.checks[i] = true; S.unread = true; Log.refresh();
        self.toast('☑ ' + def.checklist[i]);
      },
      ticked: (i) => !!S.checks[i],
      // the player's own line in the log
      note(text) { (S.notes[id] = S.notes[id] || []).push(text); S.unread = true; Log.refresh(); self.toast(text, 'note'); },
      // the quest's people: a Tyrell world, declared, and put back as saved
      world(opts, declare) {
        const w = Tyrell.create(Object.assign({ seed: S.seed + ':' + id }, opts));
        declare(w);
        if (minds) TychoMinds.restore(w, minds);
        self.cur.world = w;
        return w;
      },
      talk(who, o) { Talk.start(self.cur.world, who, o); },
      lines(list, onEnd, o) { Talk.lines(list, onEnd, o); },
      narrate(lines, o) { Narrate.play(lines, o); },
      toast: (text, kind) => self.toast(text, kind),
      // a line said in passing, that doesn't stop anything
      say: (text) => self.toast(text, 'say'),
      prompt: (text) => self.prompt(text),
      fade: (fn) => self.fadeTo(fn),
      busy: () => self.modal(),
      done: (way) => self.finish(def, way),
      save: () => Save.write(),
    };
  },
  // a quest is over: the souvenir, the log, the handoff
  finish(def, way) {
    const S = Save.data, c = this.cur;
    if (!c || c.done) return;
    c.done = true;
    if (!def.opening) {
      S.done.push({ id: def.id, title: def.title, souvenir: def.souvenir ? def.souvenir.name : null });
      if (def.souvenir) { S.pack.push({ id: def.souvenir.id, name: def.souvenir.name, from: def.title }); this.questToast('Kept', def.souvenir.name); Snd.cue('souvenir'); }
      S.unread = true;
    }
    const next = Elsewhere.next(def.id, way);
    S.q = null; S.minds = null;
    if (next) { const nd = Elsewhere.quests[next]; S.quest = next; S.way = way; S.checks = nd.checklist.map(() => false); }
    else { S.quest = null; S.over = true; }
    Save.store.write();
    this.fadeTo(() => (next ? this.begin(next, way) : this.over()));
  },
  // the end of what's built: a card, and the log
  over() {
    this.end();
    Snd.play(null);
    View.setup({});
    Narrate.play([
      'The boat drifts on, past the last of the light.',
      'Somewhere behind you, a long way back, the Lantern Road is where you left it.',
      { text: 'To be continued', title: true, hold: 4 },
    ], { bg: 'black', onEnd: () => Log.show('quests') });
  },
  // fade out, do something (the next quest), fade in
  fadeTo(fn) { if (!this.fading) this.fading = { out: true, fn }; },
  step(dt) {
    this.t += dt; this.frame++;
    Pad.update();
    Narrate.tick(dt);
    const f = this.fading;
    if (f) {
      if (f.out) { View.fade = Math.min(1, View.fade + dt * 2.2); if (View.fade >= 1) { f.out = false; f.fn(); } }
      else { View.fade = Math.max(0, View.fade - dt * 1.6); if (View.fade <= 0) this.fading = null; }
    }
    const c = this.cur, modal = this.modal();
    // (the controls step aside while a screen is up)
    if (modal !== this.wasModal) { document.body.classList.toggle('modal', modal); this.wasModal = modal; if (modal) this.prompt(null); }
    if (c && c.q) { if (!modal) c.q.step(dt); else if (c.q.idle) c.q.idle(dt); }
    // (the title card goes once it's been read, or as soon as a talk opens)
    if (this.t - this.titleAt > 3.7 || Talk.open) $('titlecard').hidden = true;
    if (this.t - Save.last > 10 && !this.modal() && c && !c.done) Save.write();
  },
  draw(dt = 0) {
    const g = View.g, c = this.cur;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (c && c.q) c.q.draw(g, dt);
    else { g.fillStyle = '#000'; g.fillRect(0, 0, View.w, View.h); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    View.finish();
    this.toasts.tick();
  },
};
