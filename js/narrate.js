'use strict';
// ---------------------------------------------------------------------------
// Narration: words in the middle of the screen, a line at a time, over the
// quest's picture (the cold open's voice, a card between scenes). A tap or a
// key moves on; each line moves on by itself after a while too. A line can
// ask for a word (`ask`: the player's name). `bg` darkens what's behind:
// 'black', 'dim' or nothing.
// ---------------------------------------------------------------------------
const Narrate = {
  open: false, list: null, i: 0, t: 0, o: null, typing: false,
  init() {
    const el = $('narrate');
    el.addEventListener('pointerdown', (e) => { if (!this.typing && !e.target.closest('#narrateAsk')) this.next(); });
    addEventListener('keydown', (e) => { if (this.open && !this.typing && !e.repeat && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) { e.preventDefault(); this.next(); } });
    $('narrateAsk').addEventListener('submit', (e) => {
      e.preventDefault();
      const l = this.list[this.i - 1], v = $('narrateInput').value.trim().replace(/\s+/g, ' ').slice(0, 14);
      $('narrateInput').blur(); this.typing = false; $('narrateAsk').hidden = true;
      if (l && l.ask) l.ask(v);
      this.next();
    });
  },
  // lines: strings or { text, title, hold, ask(value), value }; o: { bg, onEnd }
  play(lines, o = {}) {
    this.list = lines; this.i = 0; this.o = o; this.open = true; Pad.block();
    const el = $('narrate'); el.hidden = false; el.className = o.bg || '';
    this.next();
  },
  next() {
    if (!this.open) return;
    const el = $('narrateText');
    if (this.i >= this.list.length) { this.close(); return; }
    const l = typeof this.list[this.i] === 'string' ? { text: this.list[this.i] } : this.list[this.i];
    this.i++; this.t = 0; this.hold = l.hold || Math.max(3.2, l.text.length * 0.07);
    el.className = l.title ? 'title out' : 'out';
    el.textContent = l.text.replace(/\{name\}/g, Save.data.name || 'Lanternbearer');
    requestAnimationFrame(() => { el.className = l.title ? 'title' : ''; });
    $('narrateMore').hidden = !!l.ask;
    if (l.ask) { this.typing = true; $('narrateAsk').hidden = false; const inp = $('narrateInput'); inp.value = l.value || ''; setTimeout(() => inp.focus(), 50); }
    if (l.cue) Snd.cue(l.cue);
  },
  // every frame: lines move on by themselves (not one that asks)
  tick(dt) { if (this.open && !this.typing) { this.t += dt; if (this.t > this.hold) this.next(); } },
  close() {
    const o = this.o;
    this.open = false; this.list = null; $('narrate').hidden = true; Pad.block();
    if (o && o.onEnd) o.onEnd();
  },
};
