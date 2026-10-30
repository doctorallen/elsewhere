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
// The room is painted once, flat and dithered in cold iron and night blues,
// in its true colors; each frame it's darkened by a light map (an ambient
// near black, the window's night, the Lantern's warm pool, the lamp once
// it's lit) multiplied over it, so only what the Lantern touches shows. The
// lighthouse is one Tyrell person with a long file of things to talk about
// (Voice); the first answer of every beat moves the quest on, and the others
// are richer detours.
// ---------------------------------------------------------------------------
(() => {
  const C = Tycho.color, rgb = C.rgb;
  const ramp = (a, n = 7) => C.rampOf(a.map(rgb), n, 0.5, 0.25);
  // the room's materials, dark to light
  const IRON = ramp(['#10131c', '#2c3342', '#5a6476', '#8a94a6']);
  const PLATE = ramp(['#0c0e14', '#22283a', '#46506a']);
  const COPPER = ramp(['#1e120e', '#5a3622', '#9a6236', '#c88a52']);
  const GLASS = ramp(['#0e1e24', '#2e5a62', '#78b4b0', '#d4f4ec'], 9);
  const WOOD = ramp(['#1c100a', '#4a2a18', '#7a4c2c', '#a06a3e']);
  const PAPER = ramp(['#6a6250', '#b8ac90', '#ece2c8']);
  const SKY = ramp(['#010208', '#060b1e', '#101a36', '#1e2c4c'], 9);
  const SEA = ramp(['#000104', '#030812', '#081626', '#12263e'], 9);
  const BRASS = ramp(['#2a1e0a', '#6a5224', '#b8963e', '#e8cc78']);
  // the player and the Lantern in this world: a little bigger, inked in night blue
  const STYLE = { key: 'lighthouse', h: 26, flat: true, ink: '#03040c', glass: '#ffd890' };
  // the room in its own px: the floor at y 0, x from -150 to 150
  const RX0 = -150, RY0 = -178, RW = 300, RH = 222;
  const WIN = { x0: -126, x1: 126, y0: -118, y1: -34, sea: -66 };
  const LENS = { x: 0, y: -72 };
  const DESK = -94, HATCH = 72, LEFT = -104;
  // ordered dither: the night's grain, 4 × 4
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const dith = (x, y, k = 0.12) => (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * k;
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (t) => t * t * (3 - 2 * t);
  // the lens: a glass beehive, its half-width at y (none outside it)
  const lensHalf = (y) => { const k = (y - LENS.y) / 44; return Math.abs(k) > 1 ? -1 : 19 + 6 * Math.cos(k * Math.PI / 2) - (Math.abs(k) > 0.92 ? 6 : 0); };
  const lensRings = (x, y, bright) => {
    const ring = Math.floor((y - LENS.y + 60) / 4), r = Math.hypot(x, (y - LENS.y) * 1.3);
    if (bright) return cl((r < 13 ? 0.95 - r / 40 : 0.4 + (ring & 1 ? 0.3 : 0)) - Math.abs(x) / 90 + dith(x, y, 0.1));
    let v = r < 13 ? 0.45 + (Math.floor(r / 3) & 1 ? 0.22 : 0) - x / 60 : 0.32 + (ring & 1 ? 0.18 : 0) - x / 70 + dith(x, y, 0.18);
    if (Math.abs(x) === 10 || Math.abs(x) === 20) v -= 0.25;
    return cl(v);
  };

  // the room, painted once: its picture in true color, and its glow (stars)
  function paintRoom(seed) {
    const P = new Tycho.paint.Pix(RW, RH, RX0, RY0, { flat: true });
    const R = new Tycho.seed.Rng(seed);
    const X1 = RX0 + RW - 1, Y1 = RY0 + RH - 1;
    // the iron walls round the lamp room
    P.area(RX0, RY0, X1, Y1, IRON, (x, y) => cl(0.28 + dith(x, y) + (Math.abs(x) > 128 ? -0.08 : 0) + ((x + 400) % 34 < 2 ? -0.1 : 0)));
    // the dome overhead: copper ribs, a brass ring where it meets the glass
    P.area(-140, RY0, 140, WIN.y0 - 7, COPPER, (x, y) => cl(0.36 + (y - RY0) / 160 + dith(x, y) - (((x + 300) % 28) < 2 ? 0.22 : 0) - Math.abs(x) / 600), { inside: (x, y) => y > RY0 + 30 - Math.sqrt(Math.max(0, 140 * 140 - x * x)) * 0.2 });
    P.area(-140, WIN.y0 - 6, 140, WIN.y0 - 1, BRASS, (x, y) => cl(0.45 + (y === WIN.y0 - 6 ? 0.3 : 0) + dith(x, y)));
    // the windows: the night outside, sky over sea, a faint horizon
    P.area(WIN.x0, WIN.y0, WIN.x1, WIN.sea - 1, SKY, (x, y) => cl(0.2 + (y - WIN.y0) / (WIN.sea - WIN.y0) * 0.6 + dith(x, y, 0.2)));
    P.area(WIN.x0, WIN.sea, WIN.x1, WIN.y1, SEA, (x, y) => cl(0.62 - (y - WIN.sea) / 40 + dith(x, y, 0.22) + (((x * 7 + y * 13) % 23) === 0 ? 0.2 : 0)));
    for (let x = WIN.x0; x <= WIN.x1; x++) P.put(x, WIN.sea, SEA[6]);
    // the window's iron: diamond panes and posts
    for (let y = WIN.y0; y <= WIN.y1; y++) for (let x = WIN.x0; x <= WIN.x1; x++) {
      if ((x - y + 600) % 26 === 0 || (x + y + 600) % 26 === 0) P.put(x, y, IRON[1]);
      if (Math.abs(((x + 600) % 63) - 31) > 29) P.put(x, y, IRON[(x + 600) % 63 === 1 ? 3 : 1]);
    }
    P.block(WIN.x0 - 4, WIN.y1 + 1, WIN.x1 + 4, WIN.y1 + 4, IRON, { base: 0.5 });
    // the wall under the windows: plates and rivets, a brass rail
    P.area(-140, WIN.y1 + 5, 140, -1, PLATE, (x, y) => cl(0.45 + dith(x, y) + (((x + 600) % 40) === 0 ? -0.2 : 0) + ((x + 600) % 40 === 4 && (y + 600) % 8 === 2 ? 0.35 : 0)));
    for (let x = -140; x <= 140; x++) { P.put(x, -18, BRASS[5]); P.put(x, -17, BRASS[2]); }
    // the floor: iron plate, and the hatch with the stairs going down
    P.area(-150, 0, 149, 6, IRON, (x, y) => cl((y === 0 ? 0.7 : 0.38) + dith(x, y) + ((x + y * 3) % 9 === 0 ? 0.08 : 0)));
    P.area(-150, 7, 149, Y1, PLATE, (x, y) => cl(0.12 - (y - 7) / 120 + dith(x, y, 0.08)));
    P.area(HATCH + 6, 0, HATCH + 40, Y1, PLATE, () => 0);
    for (let i = 0; i < 7; i++) {
      const sx = HATCH + 8 + i * 4, sy = 3 + i * 6;
      P.area(sx, sy, sx + 14, sy + 2, IRON, (x, y) => cl((y === sy ? 0.55 : 0.25) - i * 0.05 + dith(x, y)));
    }
    for (const px of [HATCH + 4, HATCH + 42]) P.area(px, -20, px + 1, 0, BRASS, (x) => (x === px ? 0.7 : 0.35));
    for (let x = HATCH + 4; x <= HATCH + 43; x++) { P.put(x, -20, BRASS[5]); P.put(x, -19, BRASS[2]); }
    // the lens on its pedestal, with the clockwork's door
    P.block(-18, -33, 18, -29, IRON, { base: 0.55 });
    P.block(-12, -29, 12, -1, IRON, { base: 0.4, panels: [8, 10] });
    P.area(-5, -22, 4, -10, BRASS, (x, y) => cl(0.35 + (x === -5 || y === -22 ? 0.3 : 0) + dith(x, y)));
    P.area(-26, LENS.y - 46, 26, -34, GLASS, (x, y) => lensRings(x, y, false), { inside: (x, y) => Math.abs(x) <= lensHalf(y) });
    P.area(-20, LENS.y - 48, 20, LENS.y - 44, BRASS, (x, y) => cl(0.5 + (y === LENS.y - 48 ? 0.3 : 0) + dith(x, y)));
    // the keeper's desk, his log open on it, and a chair
    P.block(DESK - 18, -23, DESK + 20, -20, WOOD, { base: 0.6 });
    P.block(DESK - 16, -20, DESK + 18, -13, WOOD, { base: 0.4 });
    for (const lx of [DESK - 16, DESK + 16]) P.block(lx, -13, lx + 2, 0, WOOD, { base: 0.35 });
    P.area(DESK - 2, -18, DESK + 3, -16, BRASS, () => 0.6);
    P.area(DESK - 10, -26, DESK + 8, -24, PAPER, (x, y) => cl(0.62 + dith(x, y) - (x === DESK - 1 ? 0.5 : 0) - ((y === -25 && (x * 5) % 3 === 0) ? 0.35 : 0)));
    const ch = DESK + 30;
    P.block(ch - 6, -12, ch + 5, -10, WOOD, { base: 0.55 });
    P.block(ch + 3, -30, ch + 5, -12, WOOD, { base: 0.45 });
    P.block(ch - 6, -28, ch + 5, -26, WOOD, { base: 0.45 });
    for (const lx of [ch - 6, ch + 3]) P.block(lx, -10, lx + 1, 0, WOOD, { base: 0.3 });
    // the stars, on the glow picture
    for (let i = 0; i < 46; i++) {
      const x = R.i(WIN.x0 + 1, WIN.x1 - 1), y = R.i(WIN.y0 + 1, WIN.sea - 6);
      if ((x - y + 600) % 26 && (x + y + 600) % 26 && Math.abs(((x + 600) % 63) - 31) <= 29) P.put(x, y, [170, 190, 230], R.f(0.25, 0.8));
    }
    return P.canvases();
  }
  // what stands in front of the windows (the lens and its pedestal), in
  // black: the window's night doesn't light it, only the Lantern does
  function paintMask() {
    const [c, g] = Tycho.sprite.canvas(RW, RH);
    g.fillStyle = '#000';
    for (let y = LENS.y - 48; y <= -1; y++) {
      const hw = y < -34 ? lensHalf(y) : y < -29 ? 18 : 12;
      if (hw >= 0) g.fillRect(Math.round(-hw) - RX0, y - RY0, Math.round(hw * 2) + 1, 1);
    }
    return c;
  }
  // the lens, lit: its rings in warm light, added over the room
  function paintLensGlow() {
    const P = new Tycho.paint.Pix(56, 100, -28, LENS.y - 50, { flat: true });
    const WARM = ramp(['#3a1e06', '#c87a2a', '#ffd890', '#fff8e4'], 9);
    P.area(-26, LENS.y - 46, 26, -34, WARM, (x, y) => lensRings(x, y, true), { inside: (x, y) => Math.abs(x) <= lensHalf(y) });
    return P.canvases().c;
  }
  // the beam: a long cone, its apex at the left, fading out
  function paintBeam() {
    const [c, g] = Tycho.sprite.canvas(320, 64);
    const gr = g.createLinearGradient(0, 0, 320, 0);
    gr.addColorStop(0, 'rgba(255,236,190,0.9)'); gr.addColorStop(0.5, 'rgba(255,220,160,0.28)'); gr.addColorStop(1, 'rgba(255,220,160,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 30); g.lineTo(320, 0); g.lineTo(320, 64); g.lineTo(0, 34); g.closePath(); g.fill();
    return c;
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
    view: 'room', hold: 'any', px: 180,
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
      const room = paintRoom(ctx.seed), mask = paintMask(), lensGlow = paintLensGlow(), beam = paintBeam();
      // the light map, redrawn every frame (a picture of its own on the GPU)
      const [Lc, Lg] = Tycho.sprite.canvas(8, 8); Lc.gpuLive = true;
      // where things stand: arrive, climb, talk1, log, talk2, lighting, ship, thanks, leave, gone
      const s = Object.assign({ stage: 'arrive', x: HATCH + 20, y: 30, t: 0, lit: 0, ship: 0 }, saved || {});
      if (s.stage === 'arrive' || s.stage === 'climb' || s.stage === 'talk1') { s.stage = 'arrive'; s.x = HATCH + 20; s.y = 30; }
      if (s.stage === 'gone') s.stage = 'leave';
      let face = -1, walked = 0, beamA = 0, waveIn = 1.5, started = false, cam = 0;
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
          const fy = Math.min(H - 26, Math.round(H * 0.5 + 70));
          // the camera: the whole room if it fits, else following the player
          const half = W / 2, target = W >= RW ? 0 : Tycho.math.clamp(s.x, RX0 + half, RX0 + RW - half);
          cam += (target - cam) * 0.08; if (Math.abs(target - cam) < 0.3) cam = target;
          const ox = Math.round(W / 2 - cam), oy = fy;
          beamA += (dt || 0) * 0.55 * lit;
          g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
          g.drawImage(room.c, ox + RX0, oy + RY0);
          // the player, and the Lantern: in hand, or on the floor beside them
          const px = ox + Math.round(s.x), py = oy + Math.round(s.y);
          let lx, ly;
          if (seated()) {
            Figure.draw(g, Figure.pose(STYLE, 'sit', true), px, py);
            const L = Figure.lantern(STYLE); Figure.draw(g, L, px - 14, py - L.h + 1);
            lx = px - 14; ly = py - L.h * 0.45;
          } else {
            const left = face < 0, moving = s.stage === 'climb' || Math.abs(pad.move.x) > 0.15;
            const spr = s.y > 0 ? Figure.pose(STYLE, 'climb' + (Math.floor(walked / 6) & 1), left) : moving ? Figure.walk(STYLE, walked, left) : Figure.pose(STYLE, 'stand', left);
            // (on the stairs the floor hides the legs: drawn clipped to above it)
            if (s.y > 0) { g.save(); g.beginPath(); g.rect(0, 0, W, oy + 1); g.clip(); }
            Figure.draw(g, spr, px, py);
            const L = Figure.lantern(STYLE), hx = px + spr.hx, hy = py + spr.hy;
            Figure.draw(g, L, hx, hy);
            if (s.y > 0) g.restore();
            lx = hx; ly = hy + L.h * 0.5;
          }
          // the light map: near black, the window's night, the Lantern's pool, the lamp
          if (Lc.width !== W || Lc.height !== H) { Lc.width = W; Lc.height = H; }
          const amb = [12 + 120 * lit, 15 + 104 * lit, 28 + 70 * lit].map(Math.round);
          Lg.globalCompositeOperation = 'source-over';
          Lg.fillStyle = `rgb(${amb[0]},${amb[1]},${amb[2]})`; Lg.fillRect(0, 0, W, H);
          Lg.globalCompositeOperation = 'lighter';
          Lg.fillStyle = `rgb(${Math.round(88 + 117 * lit)},${Math.round(98 + 107 * lit)},${Math.round(132 + 78 * lit)})`;
          Lg.fillRect(ox + WIN.x0, oy + WIN.y0, WIN.x1 - WIN.x0 + 1, WIN.y1 - WIN.y0 + 1);
          Lg.globalCompositeOperation = 'source-over'; Lg.globalAlpha = 0.88 * (1 - lit);
          Lg.drawImage(mask, ox + RX0, oy + RY0); Lg.globalAlpha = 1;
          Lg.globalCompositeOperation = 'lighter';
          const fl = fx.f(-2, 2), R0 = 78 + fl;
          const lgr = Lg.createRadialGradient(lx, ly, 0, lx, ly, R0);
          lgr.addColorStop(0, 'rgb(255,214,150)'); lgr.addColorStop(0.35, 'rgb(150,112,72)'); lgr.addColorStop(1, 'rgb(0,0,0)');
          Lg.fillStyle = lgr; Lg.fillRect(lx - R0, ly - R0, R0 * 2, R0 * 2);
          const cx = ox + LENS.x, cy = oy + LENS.y;
          if (lit > 0) {
            const R1 = 40 + 420 * lit;
            const gr = Lg.createRadialGradient(cx, cy, 0, cx, cy, R1);
            gr.addColorStop(0, 'rgb(255,240,200)'); gr.addColorStop(0.5, `rgb(${Math.round(200 * lit)},${Math.round(170 * lit)},${Math.round(120 * lit)})`); gr.addColorStop(1, 'rgb(0,0,0)');
            Lg.fillStyle = gr; Lg.fillRect(cx - R1, cy - R1, R1 * 2, R1 * 2);
          } else if (s.stage === 'lighting') {
            // the first spark, deep in the glass
            const k = Math.min(1, s.t / 2) * (0.6 + fx.f(0, 0.4)), R1 = 26;
            const gr = Lg.createRadialGradient(cx, cy, 0, cx, cy, R1);
            gr.addColorStop(0, `rgb(${Math.round(200 * k)},${Math.round(140 * k)},${Math.round(70 * k)})`); gr.addColorStop(1, 'rgb(0,0,0)');
            Lg.fillStyle = gr; Lg.fillRect(cx - R1, cy - R1, R1 * 2, R1 * 2);
          }
          g.globalCompositeOperation = 'multiply'; g.drawImage(Lc, 0, 0);
          // what glows: the stars (fainter once the lamp's lit), the Lantern
          g.globalCompositeOperation = 'lighter';
          if (room.e) { g.globalAlpha = 1 - lit * 0.7; g.drawImage(room.e, ox + RX0, oy + RY0); g.globalAlpha = 1; }
          g.globalCompositeOperation = 'source-over';
          Figure.halo(g, lx, ly, 14 + fl, 'rgba(255,200,110,', 0.45);
          // the sea's glints, a few at a time
          g.globalCompositeOperation = 'lighter';
          g.fillStyle = lit > 0 ? 'rgba(255,220,160,0.35)' : 'rgba(90,120,170,0.35)';
          for (let i = 0, n = 4 + Math.round(10 * lit); i < n; i++) g.fillRect(ox + fx.i(WIN.x0 + 2, WIN.x1 - 2), oy + fx.i(WIN.sea + 2, WIN.y1 - 2), fx.i(1, 3), 1);
          // the ship, far out, its lights turning in: green, then red and green
          if (s.ship > 0) {
            const k = ease(s.ship), sx = Math.round(ox - 108 + 40 * k), sy = oy + WIN.sea + 1 + Math.round(2 * k);
            g.fillStyle = 'rgba(255,240,210,0.95)'; g.fillRect(sx, sy - 4, 1, 1);
            g.fillStyle = 'rgba(90,255,140,0.9)'; g.fillRect(sx + 2, sy - 1, 1, 1);
            if (k > 0.55) { g.fillStyle = 'rgba(255,90,70,0.9)'; g.fillRect(sx - 2, sy - 1, 1, 1); }
            g.fillStyle = 'rgba(255,210,150,0.5)'; g.fillRect(sx - 3, sy, 7, 1);
          }
          if (lit > 0) {
            // the lens alight, turning: its rings shimmer as the panels pass
            g.globalAlpha = lit * (0.65 + 0.35 * Math.cos(beamA * 4)); g.drawImage(lensGlow, ox - 28, oy + LENS.y - 50); g.globalAlpha = 1;
            // the beam, sweeping round: seen out over the sea through the windows
            const sx = Math.sin(beamA), toward = Math.cos(beamA);
            g.save();
            g.beginPath(); g.rect(ox + WIN.x0, oy + WIN.y0, WIN.x1 - WIN.x0 + 1, WIN.y1 - WIN.y0 + 1); g.clip();
            g.globalAlpha = lit * (0.35 + 0.4 * Math.max(0, -toward));
            g.translate(cx, cy - 2); g.scale(sx * 1.1, 1);
            g.drawImage(beam, 0, -32);
            g.restore();
            // and, as it faces you, the glare
            const glare = Math.pow(Math.max(0, toward), 6) * lit;
            if (glare > 0.01) Figure.halo(g, cx, cy, 120, 'rgba(255,236,190,', 0.55 * glare);
            Figure.halo(g, cx, cy, 34, 'rgba(255,230,170,', 0.5 * lit);
          }
          g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
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
