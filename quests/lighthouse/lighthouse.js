'use strict';
// ---------------------------------------------------------------------------
// Nobody's lighthouse: the lamp room at the top of a lighthouse at night, one
// room, nearly black, and a conversation. The lighthouse wants to know why
// the ships stopped coming. Over a few talks, and a page of its old keeper's
// log, it works out that it stopped lighting its lamp years ago and never
// noticed. Then it remembers how, and lights it itself; the Lantern only sits
// on the floor beside you while it does. A ship far out turns in. It gives
// you a match you didn't need, and your boat is at the foot of the stairs.
//
// It's on the isometric grid, the room cut away at the top of its striped tower
// with the sea running out past the frame. The picture is painted once and
// printed in three palettes: night, nearly black, where only the Lantern's
// pool shows the lit print through it; then the lamp catching, a palette at a
// time, with no light map at all. The lighthouse is one Tyrell person with a long file of things to talk about
// (Voice); the first answer of every beat moves the quest on, and the others
// are richer detours.
// ---------------------------------------------------------------------------
(() => {
  // the room, on the 2:1 grid, up on its tower in the open sea: a square of
  // floor 84 across, walled in glass on the far two sides, cut away on the near
  const iso = (u, v, z = 0) => [u - v, (u + v) / 2 - z];
  const DESK = -94, HATCH = 72, LEFT = -104;
  // the one way across the room: from the desk, round the front of the lens, to the hatch
  const walkAt = (t) => { const a = (1 - t) ** 2, b = 2 * t * (1 - t), c = t * t; return [14 * a + 66 * b + 71 * c, 54 * a + 84 * b + 16 * c]; };
  const pathT = (x) => Math.max(0, Math.min(1, (x - LEFT) / (HATCH - 4 - LEFT)));
  const ease = (t) => t * t * (3 - 2 * t);

  // ---- the eight inks: the picture is printed in each of three palettes, ----
  // so the night is a real limit and the lamp catching is a palette stepping up
  const D = 0, M = 1, S = 2, L = 3, Y = 4, T = 5, R = 6, B = 7;
  const NIGHT = ['#03040c', '#0a1230', '#1c2a48', '#54607a', '#3a3a40', '#2a1c20', '#3a2420', '#0c1a3a'];
  const KINDLE = ['#05061a', '#142a5c', '#46688a', '#b0a878', '#a88838', '#6e3c22', '#94462a', '#1a4478'];
  const LIT = ['#060a24', '#1e3a78', '#7aa0c0', '#fff0a8', '#ffc84a', '#b0602c', '#e0642c', '#2c6ab0'];

  const ROOM = { x: -210, y: -44, w: 420, h: 314 };
  function paintRoom() {
    const P = new Ink.Sheet(ROOM.w, ROOM.h); P.ox = ROOM.x; P.oy = ROOM.y;
    const I = new Ink.Iso(P, iso);
    // the rocks, the foam, the striped tower going down to them
    P.opoly(Ink.curve([[-76, 132], [-50, 114], [-10, 106], [50, 110], [86, 124], [80, 140], [40, 148], [-50, 148]]), T);
    P.opoly(Ink.curve([[-60, 134], [-32, 122], [0, 128], [-24, 144]]), M); P.opoly(Ink.curve([[36, 132], [62, 124], [74, 136], [48, 144]]), M);
    [[-78, 140], [-40, 112], [54, 110], [88, 134]].forEach(([x, y]) => { P.rect(x, y, 9, 2, L); P.rect(x + 2, y - 1, 5, 1, L); });
    const band = (x, y) => (((y - Math.abs(x) * 0.5) | 0) >> 4) & 1 ? L : R;
    I.left(18, 66, -88, 48, 88, band); I.right(66, 18, -88, 48, 88, (x, y) => (band(x, y) === L ? S : T));
    // the floor and its boards, the glass walls, their copper rail
    I.box(0, 0, -6, 84, 84, 6, [M, T, D]);
    for (const v of [14, 28, 42, 56, 70]) I.line(0, v, 0, 84, v, 0, D);
    I.left(0, 0, 0, 84, 34, D); I.right(0, 0, 0, 84, 34, D);
    for (let i = 0; i < 3; i++) {
      const u = 3 + i * 27;
      I.left(u, 0, 5, 24, 26, B); P.opoly([iso(u, 0, 31), iso(u + 24, 0, 31), iso(u + 24, 0, 14), iso(u, 0, 14)], M);
      I.right(0, u, 5, 24, 26, B); P.opoly([iso(0, u, 31), iso(0, u + 24, 31), iso(0, u + 24, 14), iso(0, u, 14)], M);
    }
    I.top(-2, -2, 88, 3, 34, T); I.top(-2, -2, 3, 88, 34, T);
    // the pedestal, the keeper's desk and log, the hatch and its stairs
    I.box(28, 28, 0, 28, 28, 5, [S, T, D]);
    I.box(6, 58, 0, 7, 20, 9, [T, T, D]);
    const k = iso(10, 68, 9); P.opoly([[k[0] - 7, k[1]], [k[0], k[1] - 3], [k[0] + 7, k[1]], [k[0], k[1] + 3]], L);
    I.top(64, 10, 14, 12, 0, D); I.line(66, 14, 0, 76, 14, 0, T); I.line(66, 18, 0, 76, 18, 0, T);
    return P;
  }
  // the great lens: bands of glass round a core, a sheet of its own so the beam passes behind it
  const LENS = { w: 80, h: 80, cx: 40, base: 74, z: 58 };
  function paintLens() {
    const P = new Ink.Sheet(LENS.w, LENS.h), k = 0.58, top = LENS.base - 100 * k, at = (x, y) => [LENS.cx + x * k, top + y * k];
    const shape = Ink.curve([at(0, 0), at(28, 8), at(40, 52), at(28, 100), at(-28, 100), at(-40, 52), at(-28, 8)]);
    P.poly(shape, Y); P.disc(LENS.cx, top + 52 * k, 22 * k, 30 * k, L);
    for (let y = 12; y < 98; y += 14) { const e = Math.abs(y - 52) / 48, w = (40 - e * e * 13) * k; P.path(Ink.curve([[LENS.cx - w, top + y * k], [LENS.cx, top + (y + 3) * k], [LENS.cx + w, top + y * k]], false, 4), T); }
    P.path(shape, D, true);
    return P;
  }
  // a ship, far out
  function paintShip() {
    const P = new Ink.Sheet(30, 24);
    P.opoly([[1, 17], [28, 17], [23, 23], [6, 23]], D); P.rect(14, 1, 1, 16, D); P.opoly([[16, 3], [26, 15], [16, 15]], L); P.rect(4, 19, 2, 2, R);
    return P;
  }
  // the Lantern's pool: a disc with a fat dithered edge, 140 across, in two sizes for the flicker
  function paintPool(r) {
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], P = new Ink.Sheet(140, 140);
    for (let y = 0; y < 140; y++) for (let x = 0; x < 140; x++) { const t = (Math.hypot(x - 70, (y - 70) * 1.2) / r - 0.62) / 0.38; if (t < 0 || (t < 1 && BAYER[((y >> 1) & 3) * 4 + ((x >> 1) & 3)] / 16 > t)) P.px(x, y, 0); }
    return P.print(['#ffffff']);
  }

  // the lighthouse's file: what it talks about
  function people(w) {
    w.place({ id: 'lamp-room', region: 'point' });
    w.person('lighthouse', { name: 'The lighthouse', home: 'lamp-room' });
    const v = w.voice;
    v.approach({ id: 'gentle', base: 1 });
    v.approach({ id: 'ask', base: 0 });
    v.approach({ id: 'honest', lands: (ctx) => (ctx.world.fact('read') ? 2 : -1) });
    v.approach({ id: 'jest', lands: (ctx) => (Number(ctx.world.fact('warm') || 0) >= 2 ? 1 : -1) });
    // warmth: how far you've got with it, a point for each subject talked through
    v.warmth = (ctx) => Math.min(3, Number(ctx.world.fact('warm') || 0));
    v.patience = () => 30;
    // the first talk: it speaks first, as you come up the stairs
    v.thread({ id: 'arrive', opens: true, if: ['!fact:met'], about: ['ships'], beats: {
      start: { text: 'Oh. A light, coming up the stairs. For a moment I thought — no. No, you\'re a person. With a lamp.', answers: [
        { say: 'Hello. I came in on a boat.', approach: 'gentle', to: 'boat' },
        { say: 'Who said that?', approach: 'ask', to: 'who' },
      ] },
      who: { text: 'The lighthouse. Who else would be up here? I\'ve stood on this rock a hundred and forty years. You came in on a boat?', answers: [
        { say: 'A small one. It drifted.', approach: 'gentle', to: 'boat' },
      ] },
      boat: { text: 'A boat. There used to be ships. Big ones, with bells. Colliers. The mail packet, every Thursday. They came round the point at night and I watched every one of them in.', then: ['learn:ships=true'], answers: [
        { say: 'What happened to them?', approach: 'ask', to: 'stopped' },
        { say: 'I expect they found a shorter way.', approach: 'jest', to: [{ landed: 'badly', to: 'sore' }, { to: 'stopped' }] },
      ] },
      sore: { text: 'Perhaps. Perhaps they did.', answers: [
        { say: 'Sorry. Tell me.', approach: 'gentle', to: 'stopped' },
      ] },
      stopped: { text: 'That\'s just it. I don\'t know. One by one they stopped coming. The packet, then the colliers, then everyone. I\'d like to know why. You\'ve been out there. Did you see any?', answers: [
        { say: 'Not one. The sea was empty all the way.', approach: 'honest', to: 'empty' },
        { say: 'Only a frog, in a rowing boat.', approach: 'jest', to: 'frog' },
      ] },
      frog: { text: 'A frog. I\'ll take that as a figure of speech.', answers: [
        { say: 'It wasn\'t, but fine. No ships.', to: 'empty' },
      ] },
      empty: { text: 'Empty. Hm. Well. Look about, if you like. Abernethy\'s book is on the desk; he wrote down every night. Mind the hatch, it\'s a long way down.', then: ['fact:met=true', 'fact:warm+=1'], answers: [
        { say: 'I\'ll have a look.', approach: 'gentle', to: 'bye' },
      ] },
    } });
    // the turn: the log, and what it says
    v.thread({ id: 'book', label: 'Abernethy\'s log', weight: 10, if: ['fact:read', '!fact:turned'], about: ['keeper', 'light'], approach: 'gentle', beats: {
      start: { text: 'Abernethy\'s book. He wrote in it every night. I liked the sound of the pen.', answers: [
        { say: 'The last page says "Lamp lit, 29 October." Then nothing.', approach: 'honest', to: 'last' },
        { say: 'He wrote that it runs itself now.', approach: 'ask', to: 'runs' },
      ] },
      runs: { text: 'It does. I do. I\'ve been lit every night since; I\'d know if I hadn\'t.', answers: [
        { say: 'When did you last see your own light on the water?', approach: 'gentle', to: 'last' },
      ] },
      last: { text: 'The twenty-ninth. Yes. The wind was in the west. That was — that was a long time ago, wasn\'t it.', answers: [
        { say: 'It\'s dark up here. The lamp isn\'t lit.', approach: 'honest', to: 'dark' },
        { say: 'Years, I think.', approach: 'gentle', to: 'dark' },
      ] },
      dark: { text: 'No, I — look at the lens. Tell me what you see in it.', answers: [
        { say: 'Cold glass. Just my Lantern in it, very small.', approach: 'honest', to: 'turn' },
      ] },
      turn: { text: 'Oh. Oh, I see. They didn\'t stop coming. There was nothing to come to. I went out, and I didn\'t notice. How does a light not notice?', then: ['fact:turned=true', 'learn:dark=true', 'fact:warm+=1'], answers: [
        { say: 'Can you remember how it\'s done?', approach: 'gentle', to: 'thread:how' },
        { say: 'It happens. I\'ve been carrying this one a long while and haven\'t got anywhere either.', approach: 'gentle', warmth: 2, soft: true, to: 'kin' },
      ] },
      kin: { text: 'Then we\'re a pair, you and I.', then: ['fact:kin=true'], answers: [
        { say: 'Can you remember how it\'s done?', approach: 'gentle', to: 'thread:how' },
      ] },
    } });
    v.thread({ id: 'how', label: 'Lighting the lamp', weight: 10, if: ['fact:turned', '!fact:lit'], about: ['light'], beats: {
      start: { text: 'How it\'s done. Abernethy trimmed the wick first. Then he wound the clockwork, so the lens would turn. Then the match. He always said the match was the easy part.', answers: [
        { say: 'Should I use my Lantern?', approach: 'ask', to: 'not' },
        { say: 'Where are the matches?', approach: 'ask', to: 'not' },
      ] },
      not: { text: 'No. Keep your lamp; it\'s going somewhere. And I don\'t think it\'s a match I\'m missing. I think it\'s the wanting to be seen. I stopped wanting it when the ships stopped. Or the other way round. Sit with me a moment?', then: ['learn:wanting=true'], answers: [
        { say: 'I\'ll sit.', approach: 'gentle', to: 'sit' },
      ] },
      sit: { who: 'aside', text: 'You sit on the cold iron by the lens and set the Lantern down beside you. For a long while nothing happens. Then, deep in the glass, something catches.', then: ['fact:lit=true', 'fact:warm+=1'], answers: [
        { say: 'Watch.', to: 'bye' },
      ] },
    } });
    // the last talk: the ship
    v.thread({ id: 'after', opens: true, if: ['fact:lit', '!fact:thanked'], beats: {
      start: { text: 'Look. Out past the point. Do you see?', answers: [
        { say: 'A ship. It\'s turning in.', approach: 'gentle', to: 'ship' },
      ] },
      ship: { text: 'It\'s turning in. It\'s turning in! Here — the desk drawer. Abernethy\'s matches. Take one. You didn\'t need it, and neither did I, but somebody ought to have it.', then: ['fact:thanked=true'], answers: [
        { say: 'Thank you.', approach: 'gentle', to: 'go' },
        { say: 'Keep the light on.', approach: 'gentle', to: 'go' },
      ] },
      go: { text: 'Your boat\'s at the foot of the stairs. The tide\'s turned; it\'ll take you out. And thank you for coming up. Most people only look.', answers: [
        { say: 'Goodnight.', to: 'bye' },
      ] },
    } });
    // the rest of its file, at the hub, for anyone who asks
    v.thread({ id: 'keeper', label: 'The keeper', weight: 2, if: ['fact:met'], about: ['keeper'], approach: 'ask', beats: {
      start: { text: 'Abernethy. Forty-one years. He talked to me, you know. Mostly about his leg, and the stairs, and the Thursday packet.', then: ['learn:keeper=Abernethy', 'fact:warm+=1'], answers: [
        { say: 'Did you talk back?', approach: 'gentle', to: 'back' },
        { say: 'Where did he go?', approach: 'ask', to: 'went' },
      ] },
      back: { text: 'Not so he\'d hear. I was a lighthouse about it.', end: true },
      went: { text: 'Down the stairs, the last time. Slowly. His sister\'s, I think, inland. Somewhere you can\'t hear the sea.', end: true },
    } });
    v.thread({ id: 'weather', label: 'The weather', weight: 1.5, if: ['fact:met'], about: ['sea'], beats: {
      start: { text: 'West, light, a long swell from the south. The same as yesterday. I keep track. Somebody should.', answers: [
        { say: 'Will it hold?', approach: 'ask', to: 'hold' },
      ] },
      hold: { text: 'It always holds, until it doesn\'t. That\'s the whole of the weather.', end: true },
    } });
    v.thread({ id: 'lamp', label: 'My Lantern', weight: 1.2, if: ['fact:met'], about: ['light'], beats: {
      start: { text: 'That\'s a nice lamp. Small, but honest. Where\'s it going?', answers: [
        { say: 'To the Spire, eventually.', approach: 'honest', to: 'spire' },
        { say: 'Nowhere, lately.', approach: 'jest', to: 'nowhere' },
      ] },
      spire: { text: 'I don\'t know it. Is it a light? Then I hope somebody keeps it. Lights should be kept.', end: true },
      nowhere: { text: 'Ah. I know that one.', end: true },
    } });
    v.thread({ id: 'sea', label: 'The sea', weight: 1, if: ['fact:met'], about: ['sea'], beats: {
      start: { text: 'It\'s the same sea it always was. That\'s the trouble with it, and the comfort.', answers: [
        { say: 'Do you ever get tired of it?', approach: 'ask', to: 'tired' },
      ] },
      tired: { text: 'Tired? I\'m a hundred and forty years of looking at it. I\'d miss it the way you\'d miss your own hands.', end: true },
    } });
  }
  // what the lighthouse says that Voice leaves to the game
  const WORDS = {
    greet: (l, w) => (w.fact('lit') ? 'Mm? Look at it go.' : w.fact('read') ? 'You\'ve been reading. What did he write?' : w.fact('met') ? 'Still here? The book\'s on the desk.' : 'Hello?'),
    bye: (l, w) => (w.fact('thanked') ? 'Goodnight, then.' : w.fact('lit') ? 'Watch with me.' : w.fact('met') ? 'Mind the hatch.' : 'Goodbye.'),
    close: 'I think I\'ll be quiet a while.',
  };
  // the keeper's log, a page at a time
  const LOG_PAGES = [
    'THE POINT LIGHT. Log of the lamp, kept by J. Abernethy, Keeper.',
    '3 March. Wind SW, fresh. Lamp lit 18:12. Marguerite round the point 21:40. Thursday packet 23:05. Lamp out 06:31.',
    '4 March. Fog. Lamp lit 17:58. Sounded the horn all night. Four colliers in. Lamp out 06:40.',
    'Years of nights, in the same hand, a little shakier each year. Lamp lit. Lamp out. Lamp lit.',
    '29 October. Wind W, light. Lamp lit 18:40. Lamp out 06:02. Leg bad. The stairs are a great many stairs.',
    '30 October. My last night. They are sending nobody after me. They say it runs itself now. Goodbye, old girl. — J.A.',
    'The pages after that are blank. All of them.',
  ];
  // the music once it's lit: the same slow bars, in a major key, fuller
  const SCORE_LIT = { bpm: 52, beats: 4, root: 110, chords: [[0, 7, 16, 19], [5, 12, 16, 21], [7, 14, 19, 23], [0, 7, 12, 16]], w: 'sawtooth', lp: 1500, g: 0.6 };

  Elsewhere.quest({
    id: 'lighthouse',
    title: "Nobody's lighthouse",
    ask: 'Ships used to come round the point every night. Why did they stop?',
    view: 'iso', hold: 'any', px: 180,
    accepts: ['water'], offers: ['boat'],
    souvenir: {
      id: 'match', name: 'A match',
      rows: [
        '.........rr',
        '........rRr',
        '.......wrr.',
        '......ww...',
        '.....ww....',
        '....ww.....',
        '...ww......',
        '..ww.......',
        '.ww........',
        'ww.........',
      ],
      pal: { r: '#b8321e', R: '#f06a4a', w: '#d8b888' },
    },
    checklist: ['Hear about the ships', 'Read the keeper\'s log', 'Ask why the lamp is dark', 'See the lamp lit'],
    controls: { layout: 'stick', b: 'Use' },
    talkLook: 'night',
    people,
    sounds: {
      // a wave on the rocks below: a slow swell of noise, near or far
      wave: { g: 0.55, gap: 0.6, pri: true, where: (o) => ({ g: o.g === undefined ? 1 : o.g, pan: o.pan || 0 }), fn: (S, o, t, p) => {
        const far = p.far || 0;
        Tycho.audio.noise(S, o, t, { ft: 'lowpass', f: 260 + 300 * (1 - far), f2: 700 + 600 * (1 - far), glide: 1.4, q: 0.4, a: 1.5, hold: 0.5, d: 0.9, g: 0.8, send: 0.5 });
        Tycho.audio.noise(S, o, t + 1.2, { f: 1800, q: 0.5, a: 0.4, hold: 0.2, d: 0.7, g: 0.25 * (1 - far), send: 0.6 });
      } },
      // the lamp catching: a breath of flame and a low swell
      flame: { g: 0.6, gap: 1, pri: true, fn: (S, o, t) => {
        Tycho.audio.noise(S, o, t, { f: 400, f2: 2200, glide: 1.2, q: 0.6, a: 0.6, hold: 0.4, d: 1.2, g: 0.7, send: 0.6 });
        Tycho.audio.tone(S, o, t, { f: 110, w: 'sine', a: 1.5, hold: 1.5, d: 2, g: 0.6, send: 0.5 });
      } },
      // a ship's bell, far off
      bell: { g: 0.4, gap: 0.8, pri: true, fn: (S, o, t) => {
        for (const d of [0, 0.9]) {
          Tycho.audio.tone(S, o, t + d, { f: 784, w: 'sine', a: 0.003, d: 1.6, g: 0.5, send: 0.8 });
          Tycho.audio.tone(S, o, t + d, { f: 784 * 2.76, w: 'sine', a: 0.003, d: 0.5, g: 0.12, send: 0.8 });
        }
      } },
    },
    // sparse and sad: a chord every other bar, long rests
    score: { bpm: 42, beats: 4, root: 110, chords: [[0, 7, 15], null, [-4, 3, 12], null, [-2, 5, 14], null, [-5, 2, 10], null], w: 'triangle', lp: 700, g: 0.5 },

    make(ctx, way, saved) {
      const V = ctx.view, pad = ctx.pad, fx = Tycho.seed.fxRand;
      const sheets = { room: paintRoom(), lens: paintLens() }, PAL = [NIGHT, KINDLE, LIT];
      const art = PAL.map((p) => ({ room: sheets.room.print(p), lens: sheets.lens.print(p) }));
      art[2].you = Ink.traveler(LIT, { k: D, h: R, H: T, s: L, c: B, C: M, r: R, l: S, g: Y, G: L });
      const ship = paintShip().print(LIT), pools = [paintPool(62), paintPool(66)];
      // the pool of light, redrawn every frame (a picture of its own on the GPU)
      const [Lc, Lg] = Tycho.sprite.canvas(140, 140); Lc.gpuLive = true;
      // a flat wedge of light, one row of pixels at a time
      function wedge(g, p, H) {
        const y0 = Math.max(0, Math.floor(Math.min(...p.map((q) => q[1])))), y1 = Math.min(H, Math.ceil(Math.max(...p.map((q) => q[1]))));
        for (let y = y0; y < y1; y++) {
          const Y0 = y + 0.5, xs = [];
          for (let i = 0; i < 4; i++) { const a = p[i], b = p[(i + 1) % 4]; if ((a[1] <= Y0 && b[1] > Y0) || (b[1] <= Y0 && a[1] > Y0)) xs.push(a[0] + (Y0 - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
          if (xs.length >= 2) { const a = Math.round(Math.min(...xs)), b = Math.round(Math.max(...xs)); g.fillRect(a, y, b - a, 1); }
        }
      }
      // where things stand: arrive, climb, talk1, log, talk2, lighting, ship, thanks, leave, gone
      const s = Object.assign({ stage: 'arrive', x: HATCH + 20, y: 30, t: 0, lit: 0, ship: 0 }, saved || {});
      if (s.stage === 'arrive' || s.stage === 'climb' || s.stage === 'talk1') { s.stage = 'arrive'; s.x = HATCH + 20; s.y = 30; }
      if (s.stage === 'gone') s.stage = 'leave';
      let face = -1, walked = 0, beamA = 0, waveIn = 1.5, started = false, anim = 0;
      const world = ctx.world({ start: 21 * 60, modules: ['reverie', 'fellowship', 'cityspeak', 'voice'] }, people);
      const fact = (k) => world.fact(k);
      if (s.lit >= 1) ctx.snd.play(SCORE_LIT);

      const talk = () => ctx.talk('lighthouse', { name: 'The lighthouse', words: WORDS, noDrop: true, bye: 'Goodbye', onEnd: afterTalk });
      function afterTalk() {
        if (fact('met') && s.stage === 'talk1') { s.stage = 'log'; ctx.tick(0); }
        if (fact('turned')) ctx.tick(2);
        if (fact('lit') && (s.stage === 'talk2' || s.stage === 'log')) { s.stage = 'lighting'; s.t = 0; }
        if (fact('thanked') && s.stage === 'thanks') {
          s.stage = 'leave';
          ctx.note('A lighthouse remembered what it was for. I ought to remember what mine is for. Soon, probably.');
        }
      }
      function readLog() {
        ctx.lines(LOG_PAGES.map((text) => ({ text })), () => {
          if (!fact('read')) { world.fact('read', true); ctx.tick(1); }
          if (s.stage === 'log') s.stage = 'talk2';
        }, { done: 'Close the book' });
      }
      function goDown() {
        s.stage = 'gone';
        ctx.lines([
          'You go down and down, round and round. The light passes over the stairwell windows every twelve seconds, all the way to the bottom.',
          'The boat is where you left it. The tide has turned, and the sea takes it gently out, past the point, toward the ship.',
        ], () => ctx.done('boat'));
      }
      // what's in reach, and what Use does there
      function reach() {
        if (s.stage === 'leave' && s.x > HATCH - 10) return ['Go down to the boat', goDown];
        if (!['log', 'talk2', 'leave'].includes(s.stage)) return null;
        if (s.x < DESK + 14) return ['Read the log', readLog];
        return ['Talk', talk];
      }
      const seated = () => s.stage === 'lighting' || s.stage === 'ship' || s.stage === 'thanks';

      return {
        step(dt) {
          s.t += dt;
          world.tick(dt);
          // the sea, under everything: a wave every few seconds, near or far,
          // heard from the side of the room you're on
          waveIn -= dt;
          if (waveIn <= 0) { waveIn = fx.f(2.6, 5.2); const far = fx.f(0, 1); ctx.snd.cue('wave', { far, g: 1 - far * 0.6, pan: Tycho.math.clamp(-s.x / 150 + fx.f(-0.3, 0.3), -0.8, 0.8) }); }
          if (s.stage === 'arrive') {
            if (started) return;
            started = true;
            ctx.lines([
              'The pond widens, and widens, and is the sea. The boat drifts a long time in the dark.',
              'It bumps against a stone step at the foot of a lighthouse. There is no light in it.',
              'The stairs go up, round and round. Your Lantern is the only light on them.',
            ], () => { s.stage = 'climb'; s.t = 0; });
            return;
          }
          if (s.stage === 'climb') {
            // up out of the hatch, then a few steps into the room
            if (s.y > 0) { s.y = Math.max(0, s.y - dt * 22); walked += dt * 22; face = -1; }
            else if (s.x > HATCH - 8) { s.x -= dt * 30; walked += dt * 30; face = -1; }
            else { s.stage = 'talk1'; talk(); }
            return;
          }
          if (s.stage === 'lighting') {
            if (s.t > 2 && s.lit === 0) { ctx.snd.cue('flame'); ctx.snd.play(SCORE_LIT); }
            if (s.t > 2) s.lit = Math.max(0.001, ease(Math.min(1, (s.t - 2) / 4)));
            if (s.t > 7) { s.stage = 'ship'; s.t = 0; ctx.tick(3); }
            return;
          }
          if (s.stage === 'ship') {
            s.ship = Math.min(1, s.t / 8);
            if (s.t > 3.5 && s.t - dt <= 3.5) ctx.snd.cue('bell');
            if (s.t > 6) { s.stage = 'thanks'; talk(); }
            return;
          }
          if (s.stage === 'thanks' || s.stage === 'gone') return;
          // a few steps across the one room
          const mx = pad.move.x;
          if (Math.abs(mx) > 0.15) { s.x = Tycho.math.clamp(s.x + mx * 46 * dt, LEFT, HATCH - 4); walked += Math.abs(mx) * 46 * dt; face = mx < 0 ? -1 : 1; }
          const r = reach();
          ctx.prompt(r ? (matchMedia('(hover: none)').matches ? 'Use: ' : 'E: ') + r[0] : null);
          if (pad.take('b') && r) { ctx.prompt(null); r[1](); }
        },
        draw(g, dt) {
          const W = V.w, H = V.h, lit = s.lit;
          const step = lit >= 0.66 ? 2 : lit > 0 ? 1 : 0, pal = PAL[step], A = art[step], you = art[2].you;
          const ox = Math.round(W / 2), oy = Math.round(H * 0.2);
          beamA += (dt || 0) * 0.55 * lit;
          anim += dt || 0;
          // the sea, all the way out: flat, with rows of marks that drift
          g.fillStyle = pal[B]; g.fillRect(0, 0, W, H);
          for (let j = 0; j * 18 < H + 18; j++) for (let i = -1; i * 44 < W + 44; i++) {
            const x = i * 44 + (j & 1) * 22 + Math.round(Math.sin(anim * 0.8 + j) * 3), y = j * 18 + 6;
            g.fillStyle = pal[M]; g.fillRect(x, y, 9, 1); g.fillStyle = pal[S]; g.fillRect(x + 3, y - 1, 4, 1);
          }
          // the ship, far out, turning in
          if (s.ship > 0) { const k = ease(s.ship); g.drawImage(ship, Math.round(ox + Math.min(W / 2 - 34, 150) - (1 - k) * 30), oy + 72 + Math.round(6 * k)); }
          g.drawImage(A.room, ox + ROOM.x, oy + ROOM.y);
          // the beam, sweeping round: two flat wedges, under the lens
          const cx = ox, cy = oy + 16;
          if (lit > 0) {
            g.fillStyle = pal[Y];
            for (const a of [beamA, beamA + Math.PI]) {
              const dx = Math.cos(a), dy = Math.sin(a) * 0.5, px = -dy, py = dx, near = 18, far = 460, sn = 5, sf = 16 + 20 * lit;
              wedge(g, [[cx + dx * near + px * sn, cy + dy * near + py * sn], [cx + dx * far + px * sf, cy + dy * far + py * sf], [cx + dx * far - px * sf, cy + dy * far - py * sf], [cx + dx * near - px * sn, cy + dy * near - py * sn]], H);
            }
          }
          const lensX = ox - LENS.cx, lensY = oy + 41 - LENS.base;
          g.drawImage(A.lens, lensX, lensY);
          // the first spark, deep in the glass
          if (s.stage === 'lighting' && lit === 0) { const n = 1 + (Math.min(1, s.t / 2) * 3 | 0); g.fillStyle = LIT[Y]; g.fillRect(cx - n, cy - n + 2, n * 2, n * 2); }
          // where the traveler is, and where the Lantern is
          const t = pathT(s.x), [u, v] = walkAt(t), [ix, iy] = iso(u, v), px = ox + Math.round(ix), py = oy + Math.round(iy);
          // (which way the path runs on the screen here says which way they're facing)
          const a = walkAt(Math.max(0, t - 0.02)), b = walkAt(Math.min(1, t + 0.02));
          const left = (b[0] - b[1] - a[0] + a[1] > 0) === (face < 0);
          const side = left ? 'l' : 'r', moving = s.stage === 'climb' || Math.abs(pad.move.x) > 0.15;
          const P = seated() ? you.away.r : (moving && Math.floor(walked / 7) & 1 ? you.walk : you.stand)[side];
          const lx = seated() ? px - 15 : px + (left ? -8 : 7), ly = seated() ? py - 7 : py - 11;
          // the Lantern's pool: the lit picture showing through, nothing past it
          if (step < 2) {
            const m = pools[(anim * 7 | 0) % 2], x0 = Math.round(lx) - 70, y0 = Math.round(ly) - 66;
            Lg.globalCompositeOperation = 'source-over'; Lg.clearRect(0, 0, 140, 140);
            Lg.drawImage(art[2].room, ox + ROOM.x - x0, oy + ROOM.y - y0); Lg.drawImage(art[2].lens, lensX - x0, lensY - y0);
            Lg.globalCompositeOperation = 'destination-in'; Lg.drawImage(m, 0, 0);
            g.drawImage(Lc, x0, y0);
          }
          // the traveler: up out of the stairs, standing, or sat by the Lantern on the floor
          const sy = Math.round(s.y);
          if (sy > 0) { const vis = Math.max(0, P.h - sy); if (vis > 0) g.drawImage(P.c, 0, 0, P.w, vis, px - P.ax, py - P.ay, P.w, vis); }
          else Figure.draw(g, P, px, py);
          if (sy <= 0) Figure.draw(g, you.lantern, lx, ly);
        },
        save() { return { stage: s.stage, x: Math.round(s.x), y: Math.round(s.y), lit: s.lit, ship: s.ship, t: Math.round(s.t * 10) / 10 }; },
        end() { ctx.prompt(null); },
        // the tests' player: read the log at the desk, talk by the lens, go down the stairs
        bot() {
          const to = s.stage === 'log' ? DESK + 2 : s.stage === 'talk2' ? -10 : s.stage === 'leave' ? HATCH - 4 : null;
          if (to === null) return null;
          if (Math.abs(s.x - to) > 3) return { x: Math.sign(to - s.x), y: 0 };
          return { x: 0, y: 0, bHit: true };
        },
        where() { return { stage: s.stage, x: Math.round(s.x), lit: s.lit, facts: ['met', 'read', 'turned', 'lit', 'thanked'].filter((k) => fact(k)) }; },
      };
    },
  });
})();
