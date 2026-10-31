'use strict';
// ---------------------------------------------------------------------------
// The frog stall: a pond village of frogs, on the isometric grid, outlined and
// flat in eight inks, the bank and the pond running on past the frame. Old Ribbit's cook has gone to his sister's,
// so you run the noodle stall for one lunch rush: frogs hop up to the counter
// on their lily pads, you take their orders, cook at the pot, the steamer or
// the kettle, and drag the bowl to them. Everyone has a usual; remember it
// and serve them before they ask, and they love you for it. The turn: the
// Mayor's usual is a fly, and the fly has a name. The way out is a raft at
// the end of the bank, at dusk.
//
// The rules are all in the world's own flat coordinates; only the pictures and
// the taps go through `iso` and `unIso`.
//
// Tap where to go, tap a frog to take its order, tap a pot to cook, drag the
// bowl from your hands to a frog (or tap the frog) to serve it. The frogs are
// Tyrell people: lunch is a need that rises, their usual a variable, and
// regard for you goes up when you get it right; the Mayor, Old Ribbit and
// Horace (the fly) talk through Voice.
// ---------------------------------------------------------------------------
(() => {
  const W = 400, H = 300, TILE = 8, COLS = W / TILE, ROWS = Math.ceil(H / TILE);
  // seconds of lunch rush, and when the Mayor comes
  const RUSH = 170, MAYOR_AT = 55;
  const DISHES = { noodles: 'noodles', dumplings: 'dumplings', tea: 'tea', fly: 'a fly' };
  const STATIONS = [
    { id: 'pot', dish: 'noodles', x: 150, y: 80, sx: 150, sy: 100 },
    { id: 'steamer', dish: 'dumplings', x: 194, y: 80, sx: 194, sy: 100 },
    { id: 'kettle', dish: 'tea', x: 236, y: 80, sx: 236, sy: 100 },
  ];
  // where frogs sit at the counter (on lily pads in the cove), and where you stand to serve them
  const SPOTS = [{ x: 150, y: 158, sx: 150, sy: 116 }, { x: 190, y: 158, sx: 190, sy: 116 }, { x: 230, y: 158, sx: 230, sy: 116 }];
  // the solids: the back counter with its pots, the front counter, the rail in front of it, the cellar door
  const SOLIDS = [{ x0: 120, y0: 72, x1: 258, y1: 90 }, { x0: 116, y0: 126, x1: 244, y1: 136 }, { x0: 104, y0: 134, x1: 244, y1: 146 }, { x0: 30, y0: 92, x1: 44, y1: 100 }];
  const DOOR = { x: 37, y: 98 }, RAFT = { x: 356, y: 204 }, START = { x: 52, y: 112 };
  // the frogs: their usual, their look, their home pad, how hungry they start
  const FROGS = [
    { id: 'pip', name: 'Pip', usual: 'tea', skin: '#9cc84a', hat: 'bow', home: [64, 222], lunch: 0.62 },
    { id: 'bram', name: 'Bram', usual: 'noodles', skin: '#4f8a3a', hat: 'cap', home: [140, 268], lunch: 0.55 },
    { id: 'nettle', name: 'Nettle', usual: 'dumplings', skin: '#7a8a34', hat: 'flower', home: [214, 246], lunch: 0.5 },
    { id: 'dorrit', name: 'Dorrit', usual: 'noodles', skin: '#3aa08a', hat: 'beret', home: [282, 272], lunch: 0.38 },
    { id: 'sedge', name: 'Sedge', usual: 'dumplings', skin: '#8a6a3e', hat: 'straw', home: [350, 236], lunch: 0.28 },
    { id: 'mayor', name: 'Mayor Quillon', usual: 'fly', skin: '#b08a2e', hat: 'tophat', home: [104, 248], lunch: 0.1, mayor: true },
  ];
  const RIBBIT = { id: 'ribbit', name: 'Old Ribbit', skin: '#7a9a56', hat: 'kerchief' };
  // what they say when served
  const SAYS = {
    right: ['Lovely.', 'Just the thing.', 'Ah, that hits the spot.', 'Perfect.'],
    remembered: ['You remembered!', 'Without even asking!', 'Oh, you know me already.'],
    wrong: ["This isn't what I asked for. (They eat it anyway.)", 'Hm. Not my usual. (They eat it all.)'],
    left: ["I'll come back when it's quieter.", 'Too long a wait, dear.'],
  };

  // ---- the pond's shape, from the seed -----------------------------------
  // the bank runs on past every edge of the picture: only its south side is shore
  const shore = (x, s) => 184 + Math.sin(x / 37 + s) * 6 + Math.sin(x / 13 + s * 2) * 3;
  const cove = (x, y) => ((x - 190) / 88) ** 2 + ((y - 178) / 36) ** 2 < 1;
  const isLand = (x, y, s) => y < shore(x, s) && !cove(x, y);
  const onDeck = (x, y) => x >= 112 && x <= 262 && y >= 62 && y <= 140;

  // ---- the view: the world on the 2:1 grid, and back again ----------------
  const K = 0.7, FLY_Z = 24;
  const iso = (x, y, z = 0) => [(x - y) * K, (x + y) * K / 2 - z];
  const unIso = (ix, iy) => { const a = ix / K, b = iy * 2 / K; return [(a + b) / 2, (b - a) / 2]; };
  // how much of it is painted: the pond and the bank, well past the frame
  const GX = -470, GY = -150, GW = 1040, GH = 660;

  // ---- the eight inks, by day and at dusk ----------------------------------
  const D = 0, M = 1, G = 2, L = 3, R = 4, T = 5, B = 6, O = 7;
  const DAY = ['#0c2c34', '#1f7a6a', '#8cc84c', '#f0f4a8', '#d8483a', '#b87a3c', '#2a5aa0', '#f08a30'];
  const DUSK = ['#1c1430', '#4a3a70', '#b0a050', '#ffe0a0', '#d8503a', '#8a5a48', '#6a4a90', '#f0a040'];

  // ---- sprites ------------------------------------------------------------
  const FROG = ['...kkk........kkk...', '..kLLLk......kLLLk..', '..kLkkLk....kLkkLk..', '.kgLkkLgkkkkgLkkLgk.', '.kggLLggggggggLLggk.', 'kggggggggggggggggggk', 'kggggggggggggggggggk', 'kgMggggggggggggggMgk', 'kggMMMMMMMMMMMMMMggk', '.kggLLLLLLLLLLLLggk.', '.kMgLLLLLLLLLLLLgMk.', 'kgggkLLLLLLLLLLkgggk', 'kkkkk.kkkkkkkk.kkkkk'];
  const HOP = [...FROG.slice(0, 11), '.kggkLLLLLLLLkggk.'.padStart(19, '.'), '..kk.kkkkkkkk.kk..'.padStart(19, '.')];
  // a frog's hat, drawn on top of its head: everyone's the same green otherwise
  function hat(S, kind) {
    const y = 12, x = 12;
    if (kind === 'bow') { S.orect(x - 5, y - 3, 5, 4, R); S.orect(x + 1, y - 3, 5, 4, R); S.rect(x, y - 2, 1, 2, L); }
    else if (kind === 'cap') { S.orect(x - 5, y - 4, 11, 5, R); S.orect(x + 5, y - 1, 5, 2, R); }
    else if (kind === 'flower') { S.orect(x + 3, y - 4, 7, 6, L); S.rect(x + 5, y - 2, 3, 2, O); }
    else if (kind === 'beret') { S.odisc(x, y - 2, 7, 3, O); S.px(x, y - 6, D); }
    else if (kind === 'straw') { S.orect(x - 9, y - 1, 19, 3, O); S.orect(x - 5, y - 5, 11, 5, O); S.rect(x - 4, y - 2, 9, 1, R); }
    else if (kind === 'tophat') { S.orect(x - 8, y - 2, 17, 3, D); S.orect(x - 5, y - 8, 11, 7, D); S.rect(x - 4, y - 3, 9, 1, O); }
    else if (kind === 'kerchief') { S.orect(x - 7, y - 3, 15, 4, R); S.px(x - 3, y - 2, L); S.px(x + 3, y - 2, L); }
  }
  function frogSprite(def, pose, pal) {
    const S = new Ink.Sheet(24, 24);
    S.rows(pose === 'hop' ? HOP : FROG, 2, 10, { k: D, L, g: G, M });
    hat(S, def.hat);
    return { c: S.print(pal), e: null, w: 24, h: 24, ax: 12, ay: 21 };
  }
  // the dishes, as little pictures for the bubbles and your hands
  const DISH_ROWS = {
    noodles: [['..ssss...', '.s.s.s...', '.wwwwwww.', 'BnnynnyB.', 'BBnnnnBB.', '.BBBBBB..', '..BBBB...'], { s: L, w: L, n: O, y: G, B: R }],
    dumplings: [['.........', '..dd.dd..', '.dDDdDDd.', '.dDDdDDd.', 'GGGGGGGGG', '.GgGgGgG.', '..GGGGG..'], { d: O, D: L, G: T, g: O }],
    tea: [['..s.s....', '...s.s...', '.CCCCC...', '.CtttCcc.', '.CtttC.c.', '.CCCCCc..', '..CCC....'], { s: L, C: B, c: B, t: T }],
    fly: [['.ww.ww...', '.wwkww...', '..kkk....', '..kkk....', '...k.....', '.........', '.........'], { w: L, k: D }],
  };
  const flyRows = [['ww.ww', '.kkk.', '.kkk.', '..k..'], ['.....', 'wkkkw', '.kkk.', '..k..']];

  // ---- the pictures, painted once for each palette ------------------------
  // the pad under a frog: a dark rim, flat green, a highlight, a notch of water
  function pad(S, x, y, r) {
    S.disc(x, y, r, r * 0.62, D); S.disc(x, y - 1, r - 1, r * 0.62 - 1, G); S.disc(x - 3, y - 3, r * 0.5, r * 0.25, L);
    S.poly([[x, y], [x + r + 2, y + 3], [x + r, y + 9]], B);
    for (let a = 0.8; a < 6; a += 0.9) S.line(x, y, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.48, M);
  }
  function paintGround(sd) {
    const S = new Ink.Sheet(GW, GH); S.ox = GX; S.oy = GY;
    const land = new Uint8Array(GW * GH);
    for (let py = 0; py < GH; py++) for (let px = 0; px < GW; px++) { const [x, y] = unIso(px + GX, py + GY); land[py * GW + px] = isLand(x, y, sd) ? 1 : 0; }
    for (let py = 4; py < GH - 1; py++) for (let px = 1; px < GW - 1; px++) {
      const i = py * GW + px;
      if (land[i]) S.d[i] = land[i - 1] && land[i + 1] && land[i - GW] && land[i + GW] ? G : D;
      else S.d[i] = land[i - GW] ? D : land[i - GW * 2] || land[i - GW * 3] || land[i - GW * 4] ? O : B;
    }
    // ripples on the water, tufts and a few flowers on the bank: sparse, and in rows
    const R2 = new Tycho.seed.Rng(sd + 41);
    for (let j = 0; j < 42; j++) for (let i = 0; i < 36; i++) {
      const ix = GX + i * 32 + (j & 1) * 16, iy = GY + j * 16 + 6, [x, y] = unIso(ix, iy);
      if (isLand(x, y - 10, sd) || isLand(x, y + 10, sd)) continue;
      S.rect(ix, iy, 6, 1, M); S.rect(ix + 6, iy + 1, 4, 1, M);
    }
    for (let i = 0; i < 260; i++) {
      const ix = R2.f(GX + 8, GX + GW - 8), iy = R2.f(GY + 8, GY + GH - 8), [x, y] = unIso(ix, iy);
      if (!isLand(x, y + 8, sd) || !isLand(x, y, sd) || onDeck(x, y)) continue;
      if (i % 9 === 0) { S.rect(ix, iy, 3, 3, L); S.px(ix + 1, iy + 1, i % 2 ? R : O); } else S.tuft(ix, iy, M);
    }
    // pads: the counter's, the frogs' homes, Ribbit's, and more out on the pond
    const pads = SPOTS.map((p) => [p.x, p.y + 2, 15]).concat(FROGS.map((f) => [f.home[0], f.home[1] + 2, f.mayor ? 17 : 15]), [[300, 224, 15]]);
    for (let i = 0; i < 46; i++) { const x = R2.f(-30, 470), y = R2.f(210, 420), r = R2.f(8, 13); if (!pads.some((p) => Math.hypot(p[0] - x, p[1] - y) < 34)) pads.push([x, y, r]); }
    pads.sort((a, b) => a[0] + a[1] - b[0] - b[1]);
    for (const [x, y, r] of pads) { const [ix, iy] = iso(x, y); pad(S, Math.round(ix), Math.round(iy), r); }
    // reeds where the bank meets the water
    for (let x = -80; x < 500; x += R2.f(18, 44)) {
      const y = shore(x, sd) + 2; if (cove(x, y - 6) || (x > 96 && x < 286)) continue;
      const [ix, iy] = iso(x, y); S.rect(ix, iy - 13, 1, 13, M); S.rect(ix - 1, iy - 17, 3, 5, T); S.rect(ix + 4, iy - 9, 1, 9, M); S.rect(ix + 3, iy - 13, 3, 5, T);
    }
    // the deck
    const I = new Ink.Iso(S, iso);
    I.box(112, 62, 0, 150, 78, 3, [T, D, D]);
    for (let y = 75; y < 140; y += 13) I.line(112, y, 3, 262, y, 3, D);
    [[150, 62], [214, 75], [132, 88], [236, 88], [176, 101], [120, 114], [214, 127]].forEach(([x, y]) => I.line(x, y, 3, x, y + 13, 3, D));
    return S;
  }
  // the back of the stall (the counter, the three pots, the awning over them)
  // and the counter at the front: a body walks behind these, so they're apart
  const BACK = { x: -150, y: -60, w: 330, h: 220 }, FRONT = { x: -120, y: 60, w: 300, h: 130 };
  function paintBack() {
    const S = new Ink.Sheet(BACK.w, BACK.h); S.ox = BACK.x; S.oy = BACK.y;
    const I = new Ink.Iso(S, iso);
    I.box(120, 72, 3, 138, 18, 13, [O, T, D]);
    for (const [x, y] of [[106, 60], [270, 60]]) I.box(x, y, 3, 3, 3, 46, [O, T, D]);
    const pot = (st, fill, mark) => {
      const [ix, iy0] = iso(st.x, st.y, 16), iy = iy0 - 3;
      if (st.id === 'kettle') { S.odisc(ix, iy, 10, 7, B); S.rect(ix - 3, iy - 8, 7, 2, D); S.opoly([[ix + 8, iy - 3], [ix + 16, iy - 9], [ix + 18, iy - 6], [ix + 10, iy + 1]], B); return; }
      S.odisc(ix, iy, 11, 7, D); S.disc(ix, iy - 1, 8, 4, fill); mark(ix, iy);
    };
    pot(STATIONS[0], L, (ix, iy) => { for (const [a, b] of [[-5, -2], [0, 0], [-2, -3]]) S.rect(ix + a, iy + b, 6, 1, O); });
    pot(STATIONS[1], B, (ix, iy) => { for (const [a, b] of [[-5, -2], [1, -3], [4, 0], [-1, 0]]) S.rect(ix + a, iy + b, 3, 2, L); });
    pot(STATIONS[2]);
    for (const [x, y] of [[106, 94], [270, 94]]) I.box(x, y, 3, 3, 3, 46, [O, T, D]);
    const n = 8, w = 172 / n;
    for (let i = 0; i < n; i++) { const x = 104 + i * w; S.opoly([iso(x, 96, 48), iso(x + w, 96, 48), iso(x + w, 56, 62), iso(x, 56, 62)], i & 1 ? L : R); }
    S.opoly([iso(276, 96, 48), iso(276, 56, 62), iso(276, 56, 48)], T);
    return S;
  }
  function paintFront() {
    const S = new Ink.Sheet(FRONT.w, FRONT.h); S.ox = FRONT.x; S.oy = FRONT.y;
    new Ink.Iso(S, iso).box(116, 126, 3, 128, 14, 7, [O, T, D]);
    return S;
  }
  // the raft, and the cellar door you came through, standing on its own in the reeds
  function paintRaft() {
    const S = new Ink.Sheet(60, 44); S.ox = -30; S.oy = -30;
    const I = new Ink.Iso(S, iso);
    I.box(-16, -22, 0, 32, 44, 3, [T, D, D]);
    for (const y of [-11, 0, 11]) I.line(-16, y, 3, 16, y, 3, D);
    S.rect(0, -24, 1, 20, D); S.opoly([[1, -24], [11, -10], [1, -10]], L);
    return S;
  }
  function paintDoor() {
    const S = new Ink.Sheet(40, 52); S.ox = -20; S.oy = -44;
    const I = new Ink.Iso(S, iso);
    I.box(-3, -18, 0, 6, 36, 40, [T, T, D]);
    I.right(3, -13, 0, 26, 33, D);
    I.right(3, -13, 0, 12, 33, M); S.rect(...iso(3, -3, 16), 2, 2, O);
    return S;
  }
  // every picture in one palette
  function art(pal, sheets) {
    const A = { ground: sheets.ground.print(pal), back: sheets.back.print(pal), front: sheets.front.print(pal), raft: sheets.raft.print(pal), door: sheets.door.print(pal), frog: {}, dish: {}, fly: flyRows.map((r) => Ink.sprite(r, { w: L, k: D }, pal, 2, 2).c) };
    for (const f of FROGS.concat([RIBBIT])) A.frog[f.id] = { sit: frogSprite(f, 'sit', pal), hop: frogSprite(f, 'hop', pal) };
    for (const d of Object.keys(DISH_ROWS)) A.dish[d] = Ink.sprite(DISH_ROWS[d][0], DISH_ROWS[d][1], pal, 0, 0).c;
    A.you = Ink.traveler(pal, { k: D, h: O, H: R, s: L, c: B, C: M, r: R, l: M, g: O, G: L });
    return A;
  }

  // ---- the quest ----------------------------------------------------------
  Elsewhere.quest({
    id: 'frogs',
    title: 'The frog stall',
    ask: "My cook's gone to his sister's and lunch is in ten minutes. Would you mind?",
    view: 'iso', hold: 'any', px: 180,
    accepts: ['cellar'], offers: ['water'],
    souvenir: {
      id: 'froghat', name: "A frog's hat",
      rows: ['....hhhh....', '...hHHHHh...', '...hHHHHh...', '...rrrrrr...', '.hhhhhhhhhh.', 'hHHHHHHHHHHh', '.hhhhhhhhhh.'],
      pal: { h: '#a8762e', H: '#e8c070', r: '#c83a32' },
    },
    checklist: ['Put on the apron', 'Feed the lunch rush', "Remember someone's usual", "The Mayor's order"],
    controls: { layout: 'tap' },
    talkLook: 'pond',
    sounds: {
      plop: { g: 0.25, gap: 0.08, fn: (S, o, t) => { Tycho.audio.tone(S, o, t, { f: 520, f2: 180, glide: 0.09, w: 'sine', a: 0.003, d: 0.06, g: 0.7 }); } },
      sizzle: { g: 0.18, gap: 0.3, fn: (S, o, t) => { Tycho.audio.noise(S, o, t, { f: 5200, ft: 'highpass', q: 0.6, a: 0.05, hold: 0.5, d: 0.2, g: 0.35 }); } },
      ding: { g: 0.3, gap: 0.1, fn: (S, o, t) => { Tycho.audio.tone(S, o, t, { f: 1318.5, w: 'triangle', a: 0.002, d: 0.25, g: 0.6, send: 0.3 }); Tycho.audio.tone(S, o, t + 0.07, { f: 1760, w: 'sine', a: 0.002, d: 0.3, g: 0.4, send: 0.3 }); } },
      buzz: { g: 0.12, gap: 0.6, fn: (S, o, t) => { Tycho.audio.tone(S, o, t, { f: 210, w: 'sawtooth', a: 0.02, hold: 0.3, d: 0.08, g: 0.4, lp: 1600, vib: [28, 18] }); } },
      pluck: { g: 0.16, gap: 0, pri: true, fn: (S, o, t, p) => { Tycho.audio.tone(S, o, t, { f: p.f, w: 'triangle', a: 0.002, d: 0.16, g: 0.6, send: 0.25 }); } },
    },
    score: { bpm: 104, beats: 4, root: 261.63, chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], w: 'triangle', lp: 1500, g: 0.28 },
    make(ctx, way, saved) {
      const sd = ctx.seed % 100000;
      const sheets = { ground: paintGround(sd), back: paintBack(), front: paintFront(), raft: paintRaft(), door: paintDoor() };
      const art1 = art(DAY, sheets);
      let art2 = null;

      // where a body can stand, a tile at a time, and the space it moves in
      const water = new Uint8Array(COLS * ROWS), walk = new Uint8Array(COLS * ROWS);
      for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
        const cx = tx * TILE + 4, cy = ty * TILE + 4, i = ty * COLS + tx;
        water[i] = isLand(cx, cy, sd) || onDeck(cx, cy) ? 0 : 1;
        walk[i] = !water[i] && !SOLIDS.some((b) => b.x0 < cx + 4 && b.x1 > cx - 4 && b.y0 < cy + 4 && b.y1 > cy - 4) ? 1 : 0;
      }
      const grid = new Tycho.grid.Grid({ w: COLS, h: ROWS, layers: [{ name: 'water', data: water, edge: 1 }] });
      const space = new Tycho.collide.Space().tiles(new Tycho.collide.Tiles(grid, 0, { size: TILE, solid: [0, 1] })).boxes(SOLIDS);
      const astar = new Tycho.path.AStar(COLS, ROWS, { cap: 5000 });
      const walkable = (x, y) => walk[y * COLS + x] === 1;

      // the frogs' minds
      const world = ctx.world({ start: 11 * 60 + 50, minutesPerSecond: 0.5 }, (w) => {
        w.need({ id: 'lunch', rise: 0.9, start: 0.3 });
        w.place({ id: 'pads', tags: ['home'], region: 'pond' });
        w.place({ id: 'stall', region: 'pond' });
        w.link('pads', 'stall', 2);
        w.action({ id: 'bask', label: 'basking on a pad', at: 'home', minutes: 30, base: 0.3, pose: 'sit' });
        w.defineInput('served', (frog, level) => { const p = w.get(frog); if (p) w.mind.setLevel(p, 'lunch', level); });
        for (const f of FROGS) w.person(f.id, { name: f.name, home: 'pads', needs: { lunch: f.lunch }, vars: { usual: f.usual, visits: 0 }, tags: ['frog'] });
        w.person('ribbit', { name: 'Old Ribbit', home: 'pads', tags: ['frog'] });
        w.person('horace', { name: 'Horace', home: 'pads', tags: ['fly'] });
        // (every talk here is one person's: each thread says whose)
        const v = w.voice;
        v.approach({ id: 'warm', base: 1 });
        // Old Ribbit, who hands you the apron
        v.thread({ id: 'apron', opens: true, if: ['person=ribbit', '!fact.apron'], beats: {
          start: { text: "There you are! My cook's gone to his sister's and lunch is in ten minutes. You've got hands. Would you mind?", answers: [
            { say: 'I can cook a bit.', approach: 'warm', then: ['fact.apron=1'], to: 'how' },
            { say: "I'm meant to be carrying a lantern somewhere.", to: 'lantern' } ] },
          lantern: { text: 'Bring it. You can see into the pots.', answers: [{ say: '...All right.', then: ['fact.apron=1'], to: 'how' }] },
          how: { text: 'Apron. Three pots: noodles in the big one, dumplings in the steamer, tea in the kettle. Everyone has a usual. Learn them, and they will love you for it.', end: true },
        } });
        v.thread({ id: 'busy', opens: true, if: ['person=ribbit', 'fact.apron'], beats: { start: { text: "Don't stand there chatting. They're hopping up already.", end: true } } });
        // the Mayor
        v.thread({ id: 'order', opens: true, if: ['person=mayor', '!fact.flyOrdered'], beats: {
          start: { text: 'Ah. The new cook. I shall have my usual.', answers: [{ say: 'And what is your usual, Mayor?', approach: 'warm', to: 'fly' }] },
          fly: { text: 'A fly. Fresh, with a little pondweed. Ribbit has never once managed it in eleven years, but I live in hope.', then: ['fact.flyOrdered=1'], answers: [{ say: 'One fly, coming up.', to: 'buzz' }] },
          buzz: { who: 'aside', text: 'Somewhere over the stall, something buzzes.', end: true },
        } });
        v.thread({ id: 'waiting', opens: true, if: ['person=mayor', 'fact.flyOrdered'], beats: { start: { text: 'I am still waiting on my fly.', end: true } } });
        // Horace
        v.thread({ id: 'horace', opens: true, if: ['person=horace', '!fact.horace'], beats: {
          start: { text: "Before you do anything you'll regret: the name's Horace.", answers: [{ say: 'Horace?', to: 'plea' }] },
          plea: { text: 'Horace. I have a wife, forty-one children and a standing appointment with a particular windowsill. The Mayor has ordered me every day for eleven years. Nobody has ever caught me. That is what makes it a usual.', answers: [
            { say: 'Then off you go, Horace.', approach: 'warm', then: ['fact.horace=1'], to: 'thanks' },
            { say: 'Sorry, Horace. Orders are orders.', then: ['fact.horace=2'], to: 'caught' } ] },
          thanks: { text: 'Decent of you. Give him the noodles. He likes the noodles. He will never say so.', end: true },
          caught: { who: 'aside', text: 'Horace sighs, and settles into the bowl with great dignity.', end: true },
        } });
      });
      const fellow = world.fellowship;

      // the quest's state: plain JSON, all of it saved
      const fresh = () => ({
        phase: 'arrive', t: 0, px: START.x, py: START.y, face: 1, walked: 0,
        holding: null, cooking: null, served: 0, remembered: 0, asked: 0, cooks: 0, left: 0,
        frogs: Object.fromEntries(FROGS.map((f) => [f.id, { st: 'home', x: f.home[0], y: f.home[1], spot: -1, wait: 0, ordered: false, want: f.usual, away: 0, hop: null, eat: 0 }])),
        learned: {}, horace: 0, fly: null, mayorDone: false, ribbit: { x: 82, y: 104, hop: null }, dusk: 0, tut: Tycho.guide.fresh(), said: false,
      });
      const s = Object.assign(fresh(), saved || {});
      // (saved between the rush and dusk: the words are said, it's dusk)
      if (s.phase === 'after') s.phase = 'dusk';
      // the moment to moment, not saved
      let path = [], goal = null, stuck = 0, away = false, drag = null, anim = 0, botCD = 0, beat = 0, beatAt = 0, later = null;
      const cam = { x: -999, y: -999 }, body = { x: s.px, y: s.py }, steam = [], ripples = [];

      // the first minute's guide: what to do next, under the view
      const guide = new Tycho.guide.Guide({
        state: () => s.tut,
        steps: [
          { text: 'Tap a frog at the counter to take its order.', done: () => s.asked > 0 || s.served > 0 },
          { text: 'Tap the pot that makes it.', done: () => s.cooks > 0 },
          { text: 'Drag the bowl from your hands to the frog.', done: () => s.served > 0 },
          { text: 'Remember their usuals: serve a regular before they ask.', done: () => s.remembered > 0 || s.t > 80 },
        ],
      });

      // ---- moving ----
      const tileOf = (x, y) => [Math.max(0, Math.min(COLS - 1, Math.floor(x / TILE))), Math.max(0, Math.min(ROWS - 1, Math.floor(y / TILE)))];
      function goTo(x, y, g) {
        const [sx, sy] = tileOf(body.x, body.y), [tx, ty] = tileOf(x, y);
        const tiles = astar.find(sx, sy, tx, ty, { walkable, snap: 6 });
        if (!tiles) { goal = null; path = []; return false; }
        path = tiles.map(([a, b]) => [a * TILE + 4, b * TILE + 4]);
        if (walk[ty * COLS + tx] && path.length) path[path.length - 1] = [x, y];
        goal = g || { kind: 'walk' }; stuck = 0;
        return true;
      }
      function moveAlong(dt) {
        if (!path.length) return false;
        const [x, y] = path[0], dx = x - body.x, dy = y - body.y, d = Math.hypot(dx, dy), sp = 74 * dt;
        if (d < 1.2) { path.shift(); return true; }
        const k = Math.min(1, sp / d), ox = body.x, oy = body.y;
        Tycho.move.topdown(space, body, dx * k, dy * k, 3.5);
        const moved = Math.hypot(body.x - ox, body.y - oy);
        s.walked += moved;
        if (Math.abs(dx - dy) > 0.5) s.face = dx - dy > 0 ? 1 : -1;
        away = dx + dy < -0.5;
        if (moved < Math.min(sp, d) * 0.2) { stuck += dt; if (stuck > 0.4) { path.shift(); stuck = 0; } } else stuck = 0;
        return true;
      }

      // ---- the frogs ----
      const def = (id) => FROGS.find((f) => f.id === id);
      const spotFree = (i) => !FROGS.some((f) => s.frogs[f.id].spot === i);
      function hop(o, x, y, dur) { o.hop = { x0: o.x, y0: o.y, x1: x, y1: y, t: 0, dur }; ctx.snd.cue('plop'); }
      const knownWant = (id) => { const f = s.frogs[id]; return f.ordered ? f.want : s.learned[id] || null; };
      // who comes to the counter: the hungry, when there's a pad free
      function arrivals() {
        if (s.phase !== 'rush' || s.t > RUSH) return;
        for (let k = 0; k < FROGS.length; k++) {
          const d = FROGS[k], f = s.frogs[d.id];
          if (f.st !== 'home' || f.away > 0) continue;
          const ready = d.mayor ? s.t >= MAYOR_AT && !s.mayorDone : world.needOf(d.id, 'lunch') > 0.6;
          if (!ready) continue;
          for (let j = 0; j < SPOTS.length; j++) {
            const i = (k + j) % SPOTS.length;
            if (!spotFree(i)) continue;
            f.spot = i; f.st = 'coming'; f.ordered = false; f.wait = 0;
            f.want = d.mayor ? (s.horace === 1 ? 'noodles' : 'fly') : d.usual;
            hop(f, SPOTS[i].x, SPOTS[i].y, 1.6);
            world.setVar(d.id, 'visits', (world.get(d.id).vars.visits || 0) + 1);
            return;
          }
        }
      }
      const patience = (id) => (def(id).mayor ? 1e9 : 34 + Math.max(0, fellow.regard(id, 'player')) * 40);
      function leave(id, happy) {
        const d = def(id), f = s.frogs[id];
        f.st = 'leaving'; f.spot = -1; f.ordered = false; f.away = happy ? 22 : 14;
        hop(f, d.home[0], d.home[1], 1.8);
      }
      function stepFrogs(dt) {
        for (const d of FROGS) {
          const f = s.frogs[d.id];
          if (f.hop) {
            f.hop.t += dt;
            if (f.hop.t >= f.hop.dur) { f.x = f.hop.x1; f.y = f.hop.y1; f.hop = null; if (f.st === 'coming') f.st = 'waiting'; else if (f.st === 'leaving') f.st = 'home'; ripples.push({ x: f.x, y: f.y + 3, t: 0 }); }
            else { const k = f.hop.t / f.hop.dur; f.x = f.hop.x0 + (f.hop.x1 - f.hop.x0) * k; f.y = f.hop.y0 + (f.hop.y1 - f.hop.y0) * k; }
            continue;
          }
          if (f.st === 'home' && f.away > 0) f.away -= dt;
          if (f.st === 'waiting') {
            f.wait += dt;
            if (f.wait > patience(d.id)) {
              s.left++; fellow.adjust(d.id, 'player', -0.03, 'kept waiting');
              ctx.toast(`${d.name}: "${SAYS.left[s.left % SAYS.left.length]}"`);
              leave(d.id, false);
            }
          }
          if (f.st === 'eating') { f.eat -= dt; if (f.eat <= 0) leave(d.id, true); }
        }
        const r = s.ribbit;
        if (r.hop) { r.hop.t += dt; const k = Math.min(1, r.hop.t / r.hop.dur); r.x = r.hop.x0 + (r.hop.x1 - r.hop.x0) * k; r.y = r.hop.y0 + (r.hop.y1 - r.hop.y0) * k; if (k >= 1) r.hop = null; }
      }

      // ---- what a tap or a drag does ----
      // (a tap is a point on the picture: what's tapped is what's drawn there)
      const near = (x, y, z, ix, iy, r) => { const [a, b] = iso(x, y, z); return Math.hypot(a - ix, b - iy) < r; };
      const frogAt = (ix, iy, r = 15) => FROGS.find((d) => { const f = s.frogs[d.id]; return (f.st === 'waiting' || f.st === 'eating') && near(f.x, f.y, 9, ix, iy, r); });
      const handAt = () => { const [a, b] = iso(body.x, body.y); return [a + 7 * s.face, b - 16]; };
      const flyStand = () => [Math.max(126, Math.min(240, s.fly.x)), 108];
      function onTap(x, y) {
        if (s.phase === 'arrive' && near(s.ribbit.x, s.ribbit.y, 9, x, y, 18)) { goTo(s.ribbit.x + 12, s.ribbit.y + 4, { kind: 'ribbit' }); return; }
        if (s.phase === 'dusk' && near(RAFT.x, RAFT.y, 6, x, y, 26)) { goTo(RAFT.x - 14, RAFT.y - 32, { kind: 'raft' }); return; }
        if (s.fly && !s.fly.leaving && near(s.fly.x, s.fly.y, FLY_Z, x, y, 16)) { const [hx, hy] = flyStand(); goTo(hx, hy, { kind: 'horace' }); return; }
        if (s.phase === 'rush') {
          const d = frogAt(x, y);
          if (d) { const f = s.frogs[d.id]; if (f.st === 'waiting') { const sp = SPOTS[f.spot]; goTo(sp.sx, sp.sy, { kind: 'frog', id: d.id }); } return; }
          const st = STATIONS.find((q) => near(q.x, q.y, 20, x, y, 15));
          if (st) { goTo(st.sx, st.sy, { kind: 'cook', id: st.id }); return; }
        }
        const [wx, wy] = unIso(x, y);
        goTo(wx, wy, { kind: 'walk' });
      }
      function onEvents(evs) {
        for (const e of evs) {
          const x = e.x + cam.x, y = e.y + cam.y;
          if (e.kind === 'down') { const [hx, hy] = handAt(); drag = { x, y, on: !!s.holding && Math.hypot(x - hx, y - hy) < 14 }; }
          else if (e.kind === 'move' && drag) { drag.x = x; drag.y = y; }
          else if (e.kind === 'up') {
            const d = drag; drag = null;
            if (d && d.on && !e.tap) {
              const fr = frogAt(x, y, 18);
              if (fr && s.frogs[fr.id].st === 'waiting') { const sp = SPOTS[s.frogs[fr.id].spot]; goTo(sp.sx, sp.sy, { kind: 'frog', id: fr.id }); }
              continue;
            }
            if (e.tap !== false) onTap(x, y);
          }
        }
      }

      // ---- arriving somewhere ----
      function arrive(g) {
        if (g.kind === 'ribbit') talkRibbit();
        else if (g.kind === 'cook') { const st = STATIONS.find((q) => q.id === g.id); s.cooking = { dish: st.dish, t: 1.1, at: st.id }; ctx.snd.cue('sizzle'); }
        else if (g.kind === 'frog') atFrog(g.id);
        else if (g.kind === 'horace') talkHorace();
        else if (g.kind === 'raft') leaveByRaft();
      }
      function atFrog(id) {
        const d = def(id), f = s.frogs[id];
        if (f.st !== 'waiting') return;
        if (d.mayor && !world.fact('flyOrdered')) {
          ctx.prompt(null);
          ctx.talk('mayor', { name: d.name, noDrop: true, noBye: true, words: { greet: 'Ah.', bye: 'Good day.' }, onEnd: () => {
            if (world.fact('flyOrdered')) { f.ordered = true; f.want = 'fly'; s.fly = s.fly || { x: 200, y: 64, t: 0 }; }
          } });
          return;
        }
        if (s.holding) { serve(id); return; }
        if (!f.ordered) { f.ordered = true; s.asked++; s.learned[id] = f.want; ctx.snd.cue('tap'); }
      }
      function serve(id) {
        const d = def(id), f = s.frogs[id], dish = s.holding;
        s.holding = null; s.served++;
        ctx.snd.cue('ding');
        if (d.mayor) { serveMayor(dish); return; }
        const right = dish === f.want;
        if (right && !f.ordered) {
          s.remembered++; fellow.adjust(id, 'player', 0.12, 'remembered my usual');
          ctx.toast(`${d.name}: "${SAYS.remembered[s.remembered % SAYS.remembered.length]}"`); ctx.tick(2);
        } else if (right) { fellow.adjust(id, 'player', 0.06, 'got my usual right'); ctx.toast(`${d.name}: "${SAYS.right[s.served % SAYS.right.length]}"`); }
        else { fellow.adjust(id, 'player', -0.01, 'got my order wrong'); ctx.toast(`${d.name}: "${SAYS.wrong[s.served % SAYS.wrong.length]}"`); }
        world.input('served', [id, right ? 0.04 : 0.3]);
        s.learned[id] = f.want;
        f.st = 'eating'; f.eat = 3.2; f.dish = dish;
      }
      function serveMayor(dish) {
        const d = def('mayor'), f = s.frogs.mayor;
        s.mayorDone = true; f.st = 'eating'; f.eat = 4; f.dish = dish;
        world.input('served', ['mayor', 0.05]);
        const lines = dish === 'fly'
          ? [{ who: d.name, text: 'At last. Eleven years.' }, { who: d.name, text: '(He eats it. There is a long pause.) It was better as a hope.' }]
          : s.horace === 1 && dish === 'noodles'
            ? [{ who: d.name, text: 'Noodles. I ordered the fly.' }, { who: d.name, text: '(He eats them all.) ...These are rather good, actually. Same again tomorrow.' }, { text: 'Far off over the reeds, something buzzes, pleased with itself.' }]
            : [{ who: d.name, text: `This is ${DISHES[dish]}. It is not a fly.` }, { who: d.name, text: '(He eats it anyway, with great dignity.)' }];
        fellow.adjust('mayor', 'player', dish === 'fly' || dish === 'noodles' ? 0.1 : 0.02, 'lunch');
        ctx.prompt(null);
        ctx.lines(lines, () => ctx.tick(3));
      }
      function talkRibbit() {
        ctx.prompt(null);
        ctx.talk('ribbit', {
          name: RIBBIT.name, noDrop: true, noBye: true, words: { greet: 'Hm?', bye: 'Off you go.' },
          onEnd: () => { if (world.fact('apron') && s.phase === 'arrive') startRush(); },
        });
      }
      function startRush() {
        s.phase = 'rush'; ctx.tick(0);
        const r = s.ribbit; r.hop = { x0: r.x, y0: r.y, x1: 300, y1: 222, t: 0, dur: 2.2 };
        ctx.snd.cue('plop');
      }
      function talkHorace() {
        if (!s.fly) return;
        ctx.snd.cue('buzz'); ctx.prompt(null);
        ctx.talk('horace', {
          name: 'Horace', noDrop: true, noBye: true, words: { greet: 'Bzz.', bye: 'Bzz.' },
          onEnd: () => {
            const h = world.fact('horace');
            if (!h || !s.fly) return;
            s.horace = h;
            if (h === 1) { s.fly.leaving = true; s.frogs.mayor.want = 'noodles'; }
            else { s.fly = null; s.holding = 'fly'; s.cooking = null; }
          },
        });
      }
      function endRush() {
        s.phase = 'after';
        for (const d of FROGS) { const f = s.frogs[d.id]; if (f.st === 'waiting' || f.st === 'eating' || f.st === 'coming') { f.hop = null; leave(d.id, true); } }
        s.holding = null; s.cooking = null; s.fly = null; path = []; goal = null;
        ctx.tick(1);
        const r = s.ribbit; r.hop = { x0: r.x, y0: r.y, x1: 300, y1: 112, t: 0, dur: 2 };
        const n = s.served, R = RIBBIT.name;
        const verdict = n >= 12 ? 'Not bad at all, for someone with no webbing.' : n >= 6 ? 'Not bad, for someone with no webbing.' : 'Well. Nobody starved.';
        // (said once Ribbit has hopped over)
        ctx.prompt(null);
        later = { at: 2.2, fn: () => ctx.lines([
          { who: R, text: "That's lunch. " + verdict },
          { who: R, text: 'Every cook at this stall gets one of these. Mind it in the rain.' },
          { text: 'He puts a very small hat on your head. It stays, somehow.' },
          { who: R, text: "The raft at the end of the bank goes across the pond. There's a lighthouse on the far side. Dark for years, that one. Mind how you go." },
        ], () => ctx.narrate(['The afternoon goes in washing-up.', 'By the time the last bowl is dry, the pond has gone gold.'], { bg: 'dim', onEnd: () => { s.phase = 'dusk'; ctx.save(); } })) };
      }
      function leaveByRaft() {
        if (!s.said) { s.said = true; ctx.note('A hat, a fly called Horace, and a raft. The Spire is still that way, roughly. I should really get back to that.'); }
        s.phase = 'gone';
        ctx.done('water');
      }

      // ---- each step ----
      function step(dt) {
        anim += dt;
        if (later) { later.at -= dt; stepFrogs(dt); if (later.at <= 0) { const f = later.fn; later = null; f(); } return; }
        world.tick(dt);
        onEvents(ctx.pad.events());
        if (s.phase === 'gone') return;
        if (s.phase === 'rush') s.t += dt;
        if (s.phase === 'arrive' && !goal && Math.hypot(body.x - s.ribbit.x, body.y - s.ribbit.y) < 30) { talkRibbit(); return; }
        if (s.cooking) { s.cooking.t -= dt; if (s.cooking.t <= 0) { s.holding = s.cooking.dish; s.cooking = null; s.cooks++; ctx.snd.cue('tap'); } }
        else if (goal && !moveAlong(dt)) { const g = goal; goal = null; arrive(g); }
        s.px = body.x; s.py = body.y;
        arrivals();
        stepFrogs(dt);
        // the fly: round and round the stall, or off over the reeds
        if (s.fly) {
          s.fly.t += dt;
          if (s.fly.leaving) { s.fly.x += 60 * dt; s.fly.y -= 40 * dt; if (s.fly.y < -20) s.fly = null; }
          else { s.fly.x = 192 + Math.sin(s.fly.t * 0.9) * 46 + Math.sin(s.fly.t * 3.1) * 6; s.fly.y = 100 + Math.sin(s.fly.t * 1.7) * 9 + Math.cos(s.fly.t * 4.3) * 4; if (s.fly.t % 3 < dt) ctx.snd.cue('buzz'); }
        }
        if (s.phase === 'rush' && (s.t > RUSH + 40 || (s.t > RUSH && !FROGS.some((d) => ['coming', 'waiting'].includes(s.frogs[d.id].st)) && !(s.fly && !s.fly.leaving)))) endRush();
        if (s.phase === 'dusk') s.dusk = Math.min(1, s.dusk + dt / 3);
        // the guide's line under the view
        let tip = null;
        if (s.phase === 'arrive') tip = 'Tap Old Ribbit to talk.';
        else if (s.phase === 'rush' && guide.active()) { guide.tick(); tip = guide.active() ? guide.read('text') : null; }
        else if (s.phase === 'rush' && s.fly && !s.fly.leaving && !s.horace) tip = 'Catch the fly: tap it.';
        else if (s.phase === 'dusk') tip = 'Tap the raft at the end of the bank.';
        ctx.prompt(ctx.busy() ? null : tip);
        // a few plucked notes over the score while the rush is on
        if (s.phase === 'rush' && anim - beatAt > 60 / 104) {
          beatAt = anim; beat++;
          const mel = [12, 16, 19, 16, 14, 17, 21, 17, 12, 19, 24, 19, 14, 17, 19, 14];
          if (beat % 2 === 0) ctx.snd.cue('pluck', { f: Tycho.audio.hz(mel[(beat >> 1) % mel.length], 261.63) });
        }
        for (const r of ripples) r.t += dt;
        while (ripples.length && ripples[0].t > 0.8) ripples.shift();
        if (s.cooking && Tycho.seed.fxRand.f() < 0.3) { const st = STATIONS.find((q) => q.id === s.cooking.at); steam.push({ x: st.x + Tycho.seed.fxRand.f(-5, 5), y: st.y, z: 26, t: 0 }); }
        for (const p of steam) { p.t += dt; p.z += 16 * dt; }
        while (steam.length && steam[0].t > 1) steam.shift();
      }

      // ---- drawing ----
      function camera(g) {
        const vw = ctx.view.w, vh = ctx.view.h;
        // (in the rush, halfway between you and the middle of the stall, so the counter stays in view)
        const [fx, fy] = iso(s.phase === 'rush' ? (body.x + 190) / 2 : body.x, s.phase === 'rush' ? (body.y + 128) / 2 : body.y);
        const fit = (v, lo, size, to) => (v >= size ? lo + (size - v) / 2 : Math.max(lo, Math.min(lo + size - v, to - v / 2)));
        const tx = fit(vw, GX, GW, fx), ty = fit(vh, GY, GH, fy - 22);
        cam.x += (tx - cam.x) * 0.12; cam.y += (ty - cam.y) * 0.12;
        if (Math.abs(cam.x - tx) > 160 || Math.abs(cam.y - ty) > 160) { cam.x = tx; cam.y = ty; }
        g.setTransform(1, 0, 0, 1, -Math.round(cam.x), -Math.round(cam.y));
      }
      function bubble(g, A, pal, x, y, dish, k, ask) {
        g.fillStyle = pal[D]; g.fillRect(x - 8, y - 9, 16, 12); g.fillStyle = pal[L]; g.fillRect(x - 7, y - 8, 14, 10); g.fillRect(x - 1, y + 3, 2, 2);
        if (dish) g.drawImage(A.dish[dish], x - 5, y - 7);
        else { g.fillStyle = ask ? pal[R] : pal[M]; g.fillRect(x - 1, y - 7, 2, 5); g.fillRect(x - 1, y - 1, 2, 2); }
        if (k != null) { g.fillStyle = pal[D]; g.fillRect(x - 7, y + 5, 14, 2); g.fillStyle = k > 0.5 ? pal[G] : k > 0.25 ? pal[O] : pal[R]; g.fillRect(x - 7, y + 5, Math.max(1, Math.round(14 * k)), 2); }
      }
      const put = (g, sp, x, y, z = 0) => { const [ix, iy] = iso(x, y, z); g.drawImage(sp.c, Math.round(ix - sp.ax), Math.round(iy - sp.ay)); };
      function draw(g) {
        const dusk = s.phase === 'dusk' || s.phase === 'gone', pal = dusk ? DUSK : DAY, A = dusk ? (art2 = art2 || art(DUSK, sheets)) : art1;
        const vw = ctx.view.w, vh = ctx.view.h;
        g.fillStyle = pal[B]; g.fillRect(0, 0, vw, vh);
        camera(g);
        g.drawImage(A.ground, GX, GY);
        // glints on the water
        g.fillStyle = pal[L];
        for (let i = 0; i < 44; i++) { const x = Tycho.seed.hash(i, 3, sd) * 500 - 50, y = Tycho.seed.hash(i, 7, sd) * 200 + 215; if (Math.sin(anim * 1.6 + i * 1.3) > 0.65) { const [ix, iy] = iso(x, y); g.fillRect(Math.round(ix), Math.round(iy), 3 + (i % 2), 1); } }
        for (const r of ripples) { g.globalAlpha = 1 - r.t / 0.8; const rr = 5 + r.t * 12, [ix, iy] = iso(r.x, r.y); g.fillRect(Math.round(ix - rr), Math.round(iy), Math.round(rr * 2), 1); }
        g.globalAlpha = 1;
        // what stands, back to front
        const items = [];
        items.push({ y: DOOR.y, fn: () => { const [ix, iy] = iso(DOOR.x, DOOR.y); g.drawImage(A.door, Math.round(ix - 20), Math.round(iy - 44)); } });
        items.push({ y: 91, fn: () => g.drawImage(A.back, BACK.x, BACK.y) });
        items.push({ y: 141, fn: () => g.drawImage(A.front, FRONT.x, FRONT.y) });
        for (const d of FROGS.concat([RIBBIT])) {
          const f = d === RIBBIT ? s.ribbit : s.frogs[d.id], z = f.hop ? Math.sin(Math.PI * Math.min(1, f.hop.t / f.hop.dur)) * 14 : 0;
          const sp = A.frog[d.id][f.hop ? 'hop' : 'sit'], bob = f.hop ? 0 : Math.round(Math.sin(anim * 2 + d.id.length) * 0.4);
          items.push({ y: f.y, fn: () => {
            if (z > 1) { const [ix, iy] = iso(f.x, f.y); g.fillStyle = pal[M]; g.fillRect(Math.round(ix - 7), Math.round(iy - 1), 14, 2); }
            put(g, sp, f.x, f.y, z - bob);
            // Ribbit fishes through the rush
            if (d === RIBBIT && s.phase === 'rush' && !f.hop) { const [ix, iy] = iso(f.x, f.y); g.fillStyle = pal[D]; for (let i = 0; i < 12; i++) g.fillRect(Math.round(ix + 8 + i), Math.round(iy - 12 - i), 1, 1); g.fillStyle = pal[L]; g.fillRect(Math.round(ix + 20), Math.round(iy - 24), 1, 20); }
          } });
        }
        if (dusk) items.push({ y: RAFT.y, fn: () => { const [ix, iy] = iso(RAFT.x, RAFT.y); g.drawImage(A.raft, Math.round(ix - 30), Math.round(iy - 30 + Math.sin(anim * 1.4))); } });
        items.push({ y: body.y, fn: () => {
          const going = goal && path.length, step2 = Math.floor(s.walked / 9) & 1, side = s.face < 0 ? 'l' : 'r';
          const P = (away ? (going && step2 ? A.you.awayWalk : A.you.away) : going && step2 ? A.you.walk : A.you.stand)[side];
          const [ix, iy] = iso(body.x, body.y), px = Math.round(ix), py = Math.round(iy);
          Figure.draw(g, P, px, py);
          // the apron, once it's on
          if (s.phase !== 'arrive' && !away) { g.fillStyle = pal[L]; g.fillRect(px - 1 + s.face, py - 11, 5, 6); g.fillStyle = pal[D]; g.fillRect(px - 1 + s.face, py - 5, 5, 1); }
          // the Lantern: on the belt while the hands are busy, in hand otherwise
          const L2 = A.you.lantern;
          if (s.holding || s.cooking) Figure.draw(g, L2, px - 9 * s.face, py - 12);
          else Figure.draw(g, L2, px + 7 * s.face, py - 11);
          if (s.holding && !(drag && drag.on)) { const [hx, hy] = handAt(); g.drawImage(A.dish[s.holding], Math.round(hx - 4), Math.round(hy - 4)); }
        } });
        if (s.fly) items.push({ y: s.fly.y + 30, fn: () => { const [ix, iy] = iso(s.fly.x, s.fly.y, FLY_Z); g.drawImage(A.fly[(anim * 20 | 0) % 2], Math.round(ix - 2), Math.round(iy - 2)); } });
        items.sort((a, b) => a.y - b.y);
        for (const it of items) it.fn();
        // steam over the pot, and how far the cooking's got
        g.fillStyle = pal[L];
        for (const p of steam) { const [ix, iy] = iso(p.x, p.y, p.z); g.fillRect(Math.round(ix), Math.round(iy), 2, 2); }
        if (s.cooking) { const st = STATIONS.find((q) => q.id === s.cooking.at), [ix, iy] = iso(st.x, st.y, 34); g.fillStyle = pal[D]; g.fillRect(Math.round(ix - 8), Math.round(iy), 16, 3); g.fillStyle = pal[O]; g.fillRect(Math.round(ix - 8), Math.round(iy), Math.round(16 * (1 - s.cooking.t / 1.1)), 3); }
        // the bubbles: what each frog wants once you've asked (a ghost of their usual
        // if you've learned it), and how long they'll wait
        for (const d of FROGS) {
          const f = s.frogs[d.id];
          if (f.st !== 'waiting') continue;
          const k = d.mayor ? null : Math.max(0, 1 - f.wait / patience(d.id)), [ix, iy] = iso(f.x, f.y);
          bubble(g, A, pal, Math.round(ix), Math.round(iy - 30), f.ordered ? f.want : null, k, !f.ordered);
          if (!f.ordered && s.learned[d.id]) { g.globalAlpha = 0.5; g.drawImage(A.dish[s.learned[d.id]], Math.round(ix + 8), Math.round(iy - 40)); g.globalAlpha = 1; }
        }
        if (drag && drag.on && s.holding) { g.globalAlpha = 0.85; g.drawImage(A.dish[s.holding], Math.round(drag.x - 4), Math.round(drag.y - 4)); g.globalAlpha = 1; }
        // the stall's lanterns, lit at dusk
        if (dusk) { g.fillStyle = pal[L]; for (const [x, y] of [[106, 94], [270, 94]]) { const [ix, iy] = iso(x, y, 44); g.fillRect(Math.round(ix) - 2, Math.round(iy), 5, 6); } }
        g.setTransform(1, 0, 0, 1, 0, 0);
      }

      // ---- the tests' player: taps and drags, as a thumb would ----
      function bot() {
        if (botCD-- > 0) return null;
        botCD = 8;
        if (goal || s.cooking || later) return null;
        const tap = (x, y, z = 0) => { const [ix, iy] = iso(x, y, z); ctx.pad.push({ kind: 'down', x: ix - cam.x, y: iy - cam.y }); ctx.pad.push({ kind: 'up', x: ix - cam.x, y: iy - cam.y, tap: true }); };
        const dragTo = (x, y, z = 0) => { const [hx, hy] = handAt(), [ix, iy] = iso(x, y, z); ctx.pad.push({ kind: 'down', x: hx - cam.x, y: hy - cam.y }); ctx.pad.push({ kind: 'move', x: (hx + ix) / 2 - cam.x, y: (hy + iy) / 2 - cam.y }); ctx.pad.push({ kind: 'up', x: ix - cam.x, y: iy - cam.y, tap: false }); };
        if (s.phase === 'arrive') { tap(s.ribbit.x, s.ribbit.y, 9); return null; }
        if (s.phase === 'dusk') { tap(RAFT.x, RAFT.y, 6); return null; }
        if (s.phase !== 'rush') return null;
        if (s.fly && !s.fly.leaving && !s.horace) { tap(s.fly.x, s.fly.y, FLY_Z); return null; }
        const waiting = FROGS.filter((d) => s.frogs[d.id].st === 'waiting');
        const mayor = waiting.find((d) => d.mayor);
        if (mayor && !world.fact('flyOrdered')) { tap(s.frogs.mayor.x, s.frogs.mayor.y, 9); return null; }
        const wantOf = (d) => (d.mayor ? (s.horace ? s.frogs.mayor.want : null) : knownWant(d.id));
        if (s.holding) {
          const to = waiting.find((d) => wantOf(d) === s.holding) || (s.holding === 'fly' ? mayor : null);
          if (to) { const f = s.frogs[to.id]; dragTo(f.x, f.y, 9); return null; }
        }
        // cook for someone whose want is known (a regular served before they ask), else take an order
        const known = waiting.find((d) => wantOf(d) && wantOf(d) !== 'fly');
        if (known) { const st = STATIONS.find((q) => q.dish === wantOf(known)); tap(st.x, st.y, 20); return null; }
        const ask = waiting.find((d) => !d.mayor && !s.frogs[d.id].ordered);
        if (ask) { tap(s.frogs[ask.id].x, s.frogs[ask.id].y, 9); return null; }
        if (Math.hypot(body.x - 190, body.y - 108) > 10) goTo(190, 108, { kind: 'walk' });
        return null;
      }

      return {
        step, draw,
        idle(dt) { anim += dt; },
        save() { s.px = body.x; s.py = body.y; return JSON.parse(JSON.stringify(s)); },
        end() { path = []; goal = null; ctx.prompt(null); },
        bot,
        where() { return { phase: s.phase, t: Math.round(s.t), served: s.served, remembered: s.remembered, holding: s.holding, at: [Math.round(body.x), Math.round(body.y)], goal: goal && goal.kind, horace: s.horace, frogs: FROGS.map((d) => d.id + ':' + s.frogs[d.id].st).join(' ') }; },
      };
    },
  });
  Elsewhere.handoff('frogs', 'water', 'lighthouse');
})();
