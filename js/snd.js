'use strict';
// ---------------------------------------------------------------------------
// Sound, made in code on Tycho's audio engine. The shell has a few cues of
// its own (a tap, a page of the log, a souvenir); each quest brings its own
// cues (`sounds`) and its score (`score`): chords played as slow, wide pads,
// a bar at a time, while the quest runs. Nothing plays before the first tap.
// ---------------------------------------------------------------------------
const SND_RAND = new Tycho.audio.Rand(0x51de7e57);
const SND_CUES = {
  tap: { g: 0.25, gap: 0.05, fn: (S, o, t) => { Tycho.audio.tone(S, o, t, { f: 880, w: 'triangle', a: 0.002, d: 0.04, g: 0.5 }); } },
  page: { g: 0.3, gap: 0.08, fn: (S, o, t) => { Tycho.audio.noise(S, o, t, { f: 3200, f2: 1400, glide: 0.12, q: 0.8, a: 0.01, d: 0.06, g: 0.6 }); } },
  quest: { g: 0.35, gap: 0.3, fn: (S, o, t) => {
    [0, 4, 7, 12].forEach((s, i) => Tycho.audio.tone(S, o, t + i * 0.09, { f: Tycho.audio.hz(s, 523.25), w: 'triangle', a: 0.005, d: 0.35, g: 0.45, send: 0.4 }));
  } },
  souvenir: { g: 0.35, gap: 0.3, fn: (S, o, t) => {
    [12, 7, 16].forEach((s, i) => Tycho.audio.tone(S, o, t + i * 0.12, { f: Tycho.audio.hz(s, 392), w: 'sine', a: 0.005, d: 0.5, g: 0.5, send: 0.5 }));
  } },
  // one note of a score's chord: a slow, wide pad
  pad: { g: 0.22, gap: 0, pri: true, fn: (S, o, t, p) => {
    Tycho.audio.stack(S, o, t, { f: p.f, w: p.w || 'sawtooth', n: 3, spread: 16, lp: p.lp || 900, lp2: (p.lp || 900) * 1.6, sweep: p.len * 0.5, a: p.len * 0.35, hold: p.len * 0.35, d: p.len * 0.3, g: p.g || 0.6, send: 0.6 });
  } },
};
const Snd = {
  S: null,
  score: null, bar: 0, next: 0,
  init() {
    this.S = new Tycho.audio.Engine({
      cues: SND_CUES, rand: SND_RAND,
      mix: { master: 0.8, music: 0.7, sfx: 0.9, space: 0.35, voices: 16, gap: 0.04, near: [80, 420], panW: 260, panMax: 0.7 },
      listener: () => null,
    }).listen();
  },
  cue(name, o) { if (this.S) this.S.cue(name, o || {}); },
  // a quest's own cues, added under their names
  add(cues) { Object.assign(SND_CUES, cues || {}); },
  // a score: { bpm, beats (a bar), root (Hz), chords: [[semitones...]...], w, lp, g }
  play(score) { this.score = score || null; this.bar = 0; this.next = 0; },
  tick(dt) {
    const S = this.S, sc = this.score;
    if (S) S.tick(dt);
    if (!S || !S.ctx || !sc || S.ctx.state !== 'running') return;
    const now = S.ctx.currentTime, len = (60 / sc.bpm) * sc.beats;
    if (this.next < now) this.next = now + 0.05;
    // the next bar, a little ahead of time
    while (this.next < now + 0.3) {
      const ch = sc.chords[this.bar % sc.chords.length];
      if (ch) for (const s of ch) S.play('pad', { f: Tycho.audio.hz(s, sc.root || 220), len: len * 1.15, w: sc.w, lp: sc.lp, g: sc.g }, this.next);
      this.bar++; this.next += len;
    }
  },
};
