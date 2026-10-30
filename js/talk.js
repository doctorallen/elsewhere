'use strict';
// ---------------------------------------------------------------------------
// The talk: one box at the bottom of the screen for every conversation in
// every world, over Tyrell's Voice. A quest says who (a person in its world),
// their name, and the words Voice leaves to the game (a greeting, a goodbye:
// `words`, by topic; a string, a list taken in turn, or a function). The box
// shows the lines and the answers on offer, and calls `onEnd` when the talk
// is over. `Talk.lines` shows lines that aren't a conversation (a sign, a
// thought, the narrator) the same way, with Next.
// The answers can be picked with a tap, or 1 to 4 on a keyboard.
// ---------------------------------------------------------------------------
const Talk = {
  open: false, view: null, o: null, world: null,
  // what's been said in this talk, for the box
  said: [],
  init() {
    addEventListener('keydown', (e) => {
      if (!this.open || e.repeat) return;
      const n = +e.key;
      if (n >= 1 && n <= 9) { const b = $('talkAnswers').children[n - 1]; if (b && !b.disabled) { e.preventDefault(); b.click(); } }
      if (e.code === 'Escape') { const bs = [...$('talkAnswers').children]; const last = bs[bs.length - 1]; if (last) last.click(); }
    });
  },
  // a conversation with `who` in `world`: o = { name, words, bye, onEnd }
  start(world, who, o = {}) {
    this.world = world; this.o = o; this.said = []; this.open = true; Pad.block();
    $('talk').hidden = false;
    this.show(world.voice.start(who));
  },
  answer(i) {
    Snd.cue('tap');
    this.show(this.world.voice.answer(i));
  },
  show(view) {
    this.view = view;
    for (const l of view.lines) this.said.push(this.line(l));
    const box = $('talkLines'), o = this.o, esc = Log.esc;
    box.innerHTML = this.said.map((l, i) => `<p class="${l.cls}${i < this.said.length - view.lines.length ? ' old' : ''}">${l.who ? `<b>${esc(l.who)}</b>` : ''}${esc(l.text)}</p>`).join('');
    box.scrollTop = box.scrollHeight;
    const ans = $('talkAnswers');
    ans.innerHTML = '';
    if (view.ended) { this.button(ans, 'Go on', 'quiet', () => this.close()); return; }
    // (a talk can leave out "let it lie" and goodbye: o.noDrop, o.noBye, as long as something else is offered)
    const shown = view.answers.filter((a) => !((a.kind === 'drop' && o.noDrop) || (a.kind === 'bye' && o.noBye && view.answers.some((b) => b.kind !== 'bye' && b.kind !== 'drop'))));
    shown.forEach((a, k) => {
      const label = a.label || a.say || (a.kind === 'drop' ? 'Let it lie' : a.kind === 'bye' ? o.bye || 'Goodbye' : '…');
      const b = this.button(ans, label, a.kind === 'drop' || a.kind === 'bye' ? 'quiet' : '', () => this.answer(a.i), k + 1);
      b.disabled = a.ok === false;
    });
  },
  button(box, text, cls, fn, n) {
    const b = document.createElement('button');
    b.className = cls; b.innerHTML = (n ? `<kbd>${n}</kbd>` : '') + Log.esc(text);
    b.onclick = fn; box.appendChild(b);
    return b;
  },
  // a line from Voice, in words: its text, or the quest's words for its topic
  line(l) {
    const o = this.o || {};
    if (l.who === 'note') return { cls: 'note', who: '', text: 'You learned something.' };
    let text = l.text;
    if (text == null) {
      const w = (o.words || {})[l.key];
      if (typeof w === 'function') text = w(l, this.world);
      else if (Array.isArray(w)) { const k = (this.count = (this.count || 0) + 1); text = w[k % w.length]; }
      else text = w;
    }
    if (text == null) text = '…';
    text = String(text).replace(/\{name\}/g, Save.data.name || 'you');
    if (l.who === 'you') return { cls: 'you', who: Save.data.name || 'You', text };
    if (l.who === 'aside') return { cls: 'aside', who: '', text };
    return { cls: 'them', who: o.name || '', text };
  },
  // lines that aren't a conversation: [{ who, text } or a string], then onEnd
  lines(list, onEnd, o = {}) {
    this.world = null; this.o = Object.assign({ onEnd }, o); this.view = null; this.open = true; Pad.block();
    $('talk').hidden = false;
    let i = 0;
    const next = () => {
      if (i >= list.length) { this.close(); return; }
      const l = typeof list[i] === 'string' ? { text: list[i] } : list[i];
      i++;
      const cls = l.who === 'you' ? 'you' : l.who ? 'them' : 'aside', who = l.who === 'you' ? Save.data.name || 'You' : l.who || '';
      this.said = [{ cls, who, text: String(l.text).replace(/\{name\}/g, Save.data.name || 'you') }];
      $('talkLines').innerHTML = `<p class="${cls}">${who ? `<b>${Log.esc(who)}</b>` : ''}${Log.esc(this.said[0].text)}</p>`;
      const ans = $('talkAnswers'); ans.innerHTML = '';
      if (l.choices) l.choices.forEach((c, k) => this.button(ans, c.say, '', () => { Snd.cue('tap'); if (c.then) c.then(); next(); }, k + 1));
      else this.button(ans, i >= list.length ? (o.done || 'Go on') : 'Next', 'quiet', () => { Snd.cue('tap'); next(); }, 1);
    };
    next();
  },
  close() {
    const o = this.o, view = this.view;
    if (this.world && view && !view.ended) this.world.voice.end();
    this.open = false; this.view = null; this.world = null; this.o = null;
    $('talk').hidden = true; Pad.block();
    if (o && o.onEnd) o.onEnd(view);
  },
  // for a test: pick the answer whose words or id match, or the n-th
  pick(m) {
    const bs = [...$('talkAnswers').children];
    const b = typeof m === 'number' ? bs[m] : bs.find((x) => x.textContent.toLowerCase().includes(String(m).toLowerCase()));
    if (b && !b.disabled) { b.click(); return true; }
    return false;
  },
};
