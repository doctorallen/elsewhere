'use strict';
// ---------------------------------------------------------------------------
// The frog stall: a pond village of frogs, seen from above, painted in soft
// brush strokes, bright and flat. Old Ribbit's cook has gone to his sister's,
// so you run the noodle stall for one lunch rush: frogs hop up to the counter
// on their lily pads, you take their orders, cook at the pot, the steamer or
// the kettle, and drag the bowl to them. Everyone has a usual; remember it
// and serve them before they ask, and they love you for it. The turn: the
// Mayor's usual is a fly, and the fly has a name. The way out is a raft at
// the end of the bank, at dusk.
//
// Tap where to go, tap a frog to take its order, tap a pot to cook, drag the
// bowl from your hands to a frog (or tap the frog) to serve it. The frogs are
// Tyrell people: lunch is a need that rises, their usual a variable, and
// regard for you goes up when you get it right; the Mayor, Old Ribbit and
// Horace (the fly) talk through Voice.
// ---------------------------------------------------------------------------
(() => {
  const W = 400, H = 300, TILE = 8, COLS = W / TILE, ROWS = Math.ceil(H / TILE);
  // the pond painted past the world's edges, so a tall or wide screen sees water, not a frame
  const MX = 70, MY = 90;
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
  const DOOR = { x: 37, y: 98 }, RAFT = { x: 384, y: 122 }, START = { x: 52, y: 112 };
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
  const cove = (x, y) => ((x - 190) / 88) ** 2 + ((y - 178) / 36) ** 2 < 1;
  const landF = (x, y, s) => 1 - ((x - 200) / 182) ** 2 - ((y - 100) / 72) ** 2 + (Tycho.seed.noise(x / 28, y / 28, s) - 0.5) * 0.22;
  const isLand = (x, y, s) => landF(x, y, s) > 0 && !cove(x, y);
  const onDeck = (x, y) => x >= 112 && x <= 262 && y >= 62 && y <= 140;

  // ---- sprites ------------------------------------------------------------
  const ramp = (hex, n) => Figure.ramp(hex, n);
  // a brighter ramp for the frogs: the pond's light is flat and high
  const bright = (hex, n) => { const c = Tycho.color.rgb(hex); return Tycho.color.rampOf([Tycho.color.mixRgb(c, [20, 30, 16], 0.3), c, Tycho.color.mixRgb(c, [255, 252, 220], 0.55)], n, 0.5, 0.25); };
  const rgb = (hex) => Tycho.color.rgb(hex);
  // a frog, from the front and a little above: sitting, or mid-hop
  function frogSprite(def, pose) {
    const big = def.mayor ? 1.15 : 1, S = Tycho.sprite.Shapes.soft(24, 24, 11);
    S.line = true;
    const cx = 12, by = pose === 'hop' ? 15 : 17, sk = bright(def.skin, 6), belly = bright(Tycho.color.mix(def.skin, '#f4e8b0', 0.6), 5);
    S.ax = 12; S.ay = 21;
    // back legs, then the body, the belly, the front feet
    S.ell(cx - 6 * big, by + 3, 3.4 * big, 2.2, sk); S.ell(cx + 6 * big, by + 3, 3.4 * big, 2.2, sk);
    S.part();
    S.ell(cx, by, 7 * big, (pose === 'hop' ? 6.5 : 5.6) * big, sk);
    S.part(false);
    S.ell(cx, by + 2, 4.4 * big, 3 * big, belly);
    S.part();
    S.ell(cx - 3, by + 5, 1.6, 1, sk); S.ell(cx + 3, by + 5, 1.6, 1, sk);
    S.part();
    // the eyes, up on top
    for (const dx of [-3.6, 3.6]) S.ell(cx + dx * big, by - 4.6 * big, 2.3, 2.3, sk);
    S.part(false);
    for (const dx of [-3.6, 3.6]) { S.px(cx + dx * big, by - 4.8 * big, [250, 248, 230]); S.px(cx + dx * big + 0.6, by - 4.4 * big, [20, 18, 16]); }
    // a smile
    for (let x = -2; x <= 2; x++) S.px(cx + x, by - 0.5 + (Math.abs(x) === 2 ? -0.6 : 0), Tycho.color.mixRgb(rgb(def.skin), [20, 16, 12], 0.6));
    S.part();
    hat(S, def.hat, cx, by - 7 * big);
    return S.done();
  }
  function hat(S, kind, cx, y) {
    if (kind === 'bow') { const r = ramp('#e8508a', 4); S.ell(cx - 2, y + 1.5, 1.6, 1.2, r); S.ell(cx + 2, y + 1.5, 1.6, 1.2, r); S.px(cx, y + 1.5, [250, 220, 230]); }
    else if (kind === 'cap') { const r = ramp('#c84a3a', 4); S.ell(cx, y + 1.2, 4, 2, r); S.box(cx + 1, y + 1.5, cx + 6, y + 2.8, r); }
    else if (kind === 'flower') { for (const [dx, dy] of [[-1.4, 0], [1.4, 0], [0, -1.4], [0, 1.4]]) S.ell(cx + 3 + dx, y + 1 + dy, 1.2, 1.2, ramp('#f0f0ff', 3)); S.px(cx + 3, y + 1, [244, 216, 74]); }
    else if (kind === 'beret') { const r = ramp('#3a3a6a', 4); S.ell(cx - 0.5, y + 1, 5, 2, r); S.px(cx, y - 1.2, r[1]); }
    else if (kind === 'straw') { const r = ramp('#e0b860', 5); S.ell(cx, y + 2, 7, 1.6, r); S.part(); S.ell(cx, y + 0.5, 3.6, 2, r); S.box(cx - 3.4, y + 1, cx + 3.4, y + 1.8, ramp('#c83a32', 3)); }
    else if (kind === 'tophat') { const r = ramp('#2a2430', 5); S.ell(cx, y + 2, 5.6, 1.4, r); S.part(); S.box(cx - 3, y - 5, cx + 3, y + 1.6, r); S.box(cx - 3, y - 0.2, cx + 3, y + 1, ramp('#c8a03a', 3)); }
    else if (kind === 'kerchief') { const r = ramp('#d84a3a', 4); S.ell(cx, y + 1.4, 5, 2.2, r); S.px(cx - 1, y + 0.6, [250, 240, 230]); S.px(cx + 2, y + 1.4, [250, 240, 230]); }
  }
  // the dishes, as little pictures for the bubbles and your hands
  const DISH_ROWS = {
    noodles: [['..ssss...', '.s.s.s...', '.wwwwwww.', 'BnnynnyB.', 'BBnnnnBB.', '.BBBBBB..', '..BBBB...'], { s: '#f4f4f4', w: '#f0d890', n: '#e8c060', y: '#c8e870', B: '#c84a3a' }],
    dumplings: [['.........', '..dd.dd..', '.dDDdDDd.', '.dDDdDDd.', 'GGGGGGGGG', '.GgGgGgG.', '..GGGGG..'], { d: '#e8dcc0', D: '#fff4dc', G: '#a8783a', g: '#c89a5a' }],
    tea: [['..s.s....', '...s.s...', '.CCCCC...', '.CtttCcc.', '.CtttC.c.', '.CCCCCc..', '..CCC....'], { s: '#e8f0f0', C: '#5a9ab8', c: '#5a9ab8', t: '#b8783a' }],
    fly: [['.ww.ww...', '.wwkww...', '..kkk....', '..kkk....', '...k.....', '.........', '.........'], { w: '#d8f0ff', k: '#2a2a30' }],
  };
  const dishSprite = (d) => Tycho.sprite.spriteFrom(DISH_ROWS[d][0], DISH_ROWS[d][1]);
  function stationSprite(id) {
    const S = Tycho.sprite.Shapes.soft(28, 26, 5); S.line = true; S.ax = 14; S.ay = 22;
    if (id === 'pot') { S.ell(14, 14, 10, 8, ramp('#3a3a42', 5)); S.part(); S.ell(14, 12, 8, 5.5, ramp('#e8c870', 5)); S.part(); for (let i = 0; i < 6; i++) S.px(9 + i * 2, 11 + (i % 2), [250, 230, 160]); S.ell(10, 13, 1.5, 1, ramp('#7ab84a', 3)); }
    else if (id === 'steamer') { S.ell(14, 15, 10, 7.5, ramp('#c8a060', 5)); S.part(); S.ell(14, 13, 8.5, 5.5, ramp('#e8cc90', 4)); S.part(); for (let i = 0; i < 6; i++) S.limb(7 + i * 3, 9, 7 + i * 3, 17, 0.6, ramp('#a87a3a', 3)); }
    else { const r = ramp('#4a8ab0', 5); S.ell(14, 15, 7.5, 7, r); S.part(); S.limb(20, 12, 25, 8, 1.4, r); S.part(); S.ell(14, 10, 3, 1.6, ramp('#8ac0d8', 3)); S.px(14, 8, [40, 40, 50]); }
    return S.done();
  }
  function raftSprite() {
    const S = Tycho.sprite.Shapes.soft(36, 26, 9); S.line = true; S.ax = 18; S.ay = 22;
    const r = ramp('#9a6a3a', 5);
    for (let i = 0; i < 6; i++) S.box(4 + i * 5, 6, 8 + i * 5, 21, i % 2 ? r : r.map((c) => Tycho.color.mixRgb(c, [40, 26, 16], 0.15)));
    S.part(); S.box(3, 9, 33, 11, ramp('#6a4a2a', 4)); S.box(3, 16, 33, 18, ramp('#6a4a2a', 4));
    S.part(); S.limb(26, 4, 26, 14, 1, ramp('#d8c8a0', 3));
    return S.done();
  }
  // the cellar door you came through, standing on its own in the reeds
  // (flat, in the brick terrace's style: it's the one thing here from there)
  function doorSprite() {
    const S = Tycho.sprite.Shapes.figure(26, 36, 4); S.ax = 11; S.ay = 33;
    S.box(2, 2, 20, 33, ramp('#7a5a3e', 4)); S.part();
    S.box(5, 5, 17, 33, ramp('#0e0a0c', 3)); S.part();
    S.shape([[17, 5], [24, 3], [24, 34], [17, 33]], ramp('#3a6a4a', 4)); S.part();
    S.px(22, 19, [230, 200, 90]);
    return S.done();
  }
  const flySprites = () => [Tycho.sprite.spriteFrom(['ww.ww', '.kkk.', '.kkk.', '..k..'], { w: '#e8f6ff', k: '#24242c' }), Tycho.sprite.spriteFrom(['.....', 'wkkkw', '.kkk.', '..k..'], { w: '#e8f6ff', k: '#24242c' })];

  // ---- the ground: water, the bank, the deck, the pads, painted once ------
  function paintGround(s) {
    const P = new Tycho.paint.Pix(W + MX * 2, H + MY * 2, -MX, -MY, {});
    const n = (x, y, k) => Tycho.seed.noise(x / k, y / k, s + 3);
    const water = Tycho.color.rampOf(['#1e5a6a', '#3a8c96', '#7ac4c0'], 9);
    P.area(-MX, -MY, W + MX - 1, H + MY - 1, water, (x, y) => Math.max(0.2, Math.min(1, 0.55 + landF(x, y, s) * 0.6 + (n(x, y, 22) - 0.5) * 0.35 - (cove(x, y) ? 0.08 : 0))));
    const grass = Tycho.color.rampOf(['#4a7a2e', '#7ab040', '#c8e070'], 9), sand = Tycho.color.rampOf(['#a8905a', '#d8c08a', '#f0e0b0'], 7);
    P.area(0, 0, W - 1, H - 1, sand, (x, y) => 0.45 + (n(x, y, 9) - 0.5) * 0.5, { inside: (x, y) => isLand(x, y, s) });
    P.area(0, 0, W - 1, H - 1, grass, (x, y) => 0.5 + (n(x, y, 14) - 0.5) * 0.7, { inside: (x, y) => landF(x, y, s) > 0.09 && !(((x - 190) / 96) ** 2 + ((y - 178) / 42) ** 2 < 1) });
    // the deck: planks, east to west
    const wood = Tycho.color.rampOf(['#7a5232', '#b8844a', '#e0b878'], 9);
    P.area(112, 62, 262, 140, wood, (x, y) => 0.55 + ((y - 62) % 7 === 0 ? -0.35 : 0) + ((x + ((y / 7) | 0) * 23) % 31 === 0 ? -0.25 : 0) + (n(x, y, 6) - 0.5) * 0.2);
    // the back counter and the front counter
    P.block(120, 72, 258, 90, Tycho.color.rampOf(['#5a3a22', '#8a5a32', '#c08850'], 7), { base: 0.5 });
    P.block(116, 124, 244, 137, Tycho.color.rampOf(['#6a4228', '#a8703e', '#e0a868'], 7), { base: 0.55 });
    // the awning along the back, red and cream
    P.area(110, 56, 264, 68, Tycho.color.rampOf(['#8a2a22', '#d84a3a', '#f4e0c0'], 7), (x, y) => ((x - 110) % 16 < 8 ? 0.45 : 0.95) - (y > 66 ? 0.3 : 0));
    // lily pads: the counter's, the frogs' homes, Ribbit's, and more
    const pad = Tycho.color.rampOf(['#2e6a2a', '#5aa040', '#a8d870'], 7);
    const R = new Tycho.seed.Rng(s + 41);
    const pads = SPOTS.map((p) => [p.x, p.y + 2, 11]).concat(FROGS.map((f) => [f.home[0], f.home[1] + 2, f.mayor ? 14 : 11]), [[300, 224, 11]]);
    for (let i = 0; i < 70; i++) { const x = R.f(10 - MX, W + MX - 10), y = R.f(10 - MY, H + MY - 10), r = R.f(4, 9); if (landF(x, y, s) < -0.05 && !SPOTS.some((p) => Math.hypot(p.x - x, p.y - y) < 18)) pads.push([x, y, r]); }
    for (const [px, py, r] of pads) {
      const notch = R.f(-3, 3);
      P.area(Math.floor(px - r - 1), Math.floor(py - r), Math.ceil(px + r + 1), Math.ceil(py + r), pad, (x, y) => 0.55 - (x - px) / r * 0.25 - (y - py) / r * 0.2, { inside: (x, y) => ((x - px) / (r + 1)) ** 2 + ((y - py) / (r * 0.8)) ** 2 < 1 && !(Math.abs(Math.atan2(y - py, x - px) - notch) < 0.3 && Math.hypot(x - px, y - py) > 2) });
      if (R.chance(0.3)) { const fx = Math.round(px + R.f(-r / 2, r / 2)), fy = Math.round(py + R.f(-r / 3, r / 3)); P.put(fx, fy, [250, 170, 200]); P.put(fx + 1, fy, [250, 200, 220]); P.put(fx, fy - 1, [250, 200, 220]); P.put(fx + 1, fy - 1, [255, 240, 140]); }
    }
    // reeds along the shore
    const reed = [[40, 72, 30], [70, 100, 50], [120, 160, 80]];
    for (let i = 0; i < 90; i++) {
      const x = R.f(8 - MX, W + MX - 8), y = R.f(20 - MY, H + MY - 30), f = landF(x, y, s);
      if (f > 0 || f < -0.06 || cove(x, y)) continue;
      const hgt = R.i(5, 10);
      for (let k = 0; k < 3; k++) { const rx = Math.round(x + R.f(-3, 3)); for (let j = 0; j < hgt; j++) P.put(rx + (j > hgt * 0.7 ? 1 : 0), Math.round(y) - j, reed[k % 3]); P.put(rx, Math.round(y) - hgt, [110, 70, 40]); P.put(rx, Math.round(y) - hgt - 1, [110, 70, 40]); }
    }
    return P.canvases().c;
  }

  // ---- the quest ----------------------------------------------------------
  Elsewhere.quest({
    id: 'frogs',
    title: 'The frog stall',
    ask: "My cook's gone to his sister's and lunch is in ten minutes. Would you mind?",
    view: 'top', hold: 'any', px: 180,
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
      const ground = paintGround(sd);
      const sprites = { frog: {}, dish: {}, station: {}, raft: raftSprite(), door: doorSprite(), fly: flySprites() };
      for (const f of FROGS.concat([RIBBIT])) sprites.frog[f.id] = { sit: frogSprite(f, 'sit'), hop: frogSprite(f, 'hop') };
      for (const d of Object.keys(DISH_ROWS)) sprites.dish[d] = dishSprite(d);
      for (const st of STATIONS) sprites.station[st.id] = stationSprite(st.id);
      const style = { key: 'frogs', h: 20, flat: false, line: true, coat: '#3e6aa0', scarf: '#d8483a', ink: '#1a2a1a' };

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
      let path = [], goal = null, stuck = 0, drag = null, anim = 0, botCD = 0, beat = 0, beatAt = 0, later = null;
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
        if (Math.abs(dx) > 0.5) s.face = dx > 0 ? 1 : -1;
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
      const frogAt = (x, y, r = 12) => FROGS.find((d) => { const f = s.frogs[d.id]; return (f.st === 'waiting' || f.st === 'eating') && Math.hypot(f.x - x, f.y - 6 - y) < r; });
      const handAt = () => [body.x + 7 * s.face, body.y - 16];
      const flyStand = () => [Math.max(126, Math.min(240, s.fly.x)), 108];
      function onTap(x, y) {
        if (s.phase === 'arrive' && Math.hypot(s.ribbit.x - x, s.ribbit.y - 6 - y) < 16) { goTo(s.ribbit.x + 12, s.ribbit.y + 4, { kind: 'ribbit' }); return; }
        if (s.phase === 'dusk' && Math.hypot(RAFT.x - x, RAFT.y - 8 - y) < 22) { goTo(RAFT.x - 22, RAFT.y - 6, { kind: 'raft' }); return; }
        if (s.fly && !s.fly.leaving && Math.hypot(s.fly.x - x, s.fly.y - y) < 14) { const [hx, hy] = flyStand(); goTo(hx, hy, { kind: 'horace' }); return; }
        if (s.phase === 'rush') {
          const d = frogAt(x, y);
          if (d) { const f = s.frogs[d.id]; if (f.st === 'waiting') { const sp = SPOTS[f.spot]; goTo(sp.sx, sp.sy, { kind: 'frog', id: d.id }); } return; }
          const st = STATIONS.find((q) => Math.hypot(q.x - x, q.y - y) < 14);
          if (st) { goTo(st.sx, st.sy, { kind: 'cook', id: st.id }); return; }
        }
        goTo(x, y, { kind: 'walk' });
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
        if (s.cooking && Tycho.seed.fxRand.f() < 0.3) { const st = STATIONS.find((q) => q.id === s.cooking.at); steam.push({ x: st.x + Tycho.seed.fxRand.f(-5, 5), y: st.y - 6, t: 0 }); }
        for (const p of steam) { p.t += dt; p.y -= 14 * dt; }
        while (steam.length && steam[0].t > 1) steam.shift();
      }

      // ---- drawing ----
      function camera(g) {
        const vw = ctx.view.w, vh = ctx.view.h;
        // (in the rush, halfway between you and the middle of the stall, so the counter stays in view)
        const fx = s.phase === 'rush' ? (body.x + 190) / 2 : body.x, fy = s.phase === 'rush' ? (body.y + 128) / 2 : body.y;
        const fit = (v, size, m, to) => (v >= size + m * 2 ? (size - v) / 2 : Math.max(-m, Math.min(size + m - v, to - v / 2)));
        const tx = fit(vw, W, MX, fx), ty = fit(vh, H, MY, fy + 14);
        cam.x += (tx - cam.x) * 0.12; cam.y += (ty - cam.y) * 0.12;
        if (Math.abs(cam.x - tx) > 160 || Math.abs(cam.y - ty) > 160) { cam.x = tx; cam.y = ty; }
        g.setTransform(1, 0, 0, 1, -Math.round(cam.x), -Math.round(cam.y));
      }
      function bubble(g, x, y, dish, k, ask) {
        g.fillStyle = '#2a2a1e'; g.fillRect(x - 8, y - 9, 16, 12); g.fillStyle = '#fbf6e2'; g.fillRect(x - 7, y - 8, 14, 10); g.fillRect(x - 1, y + 3, 2, 2);
        if (dish) g.drawImage(sprites.dish[dish], x - 5, y - 7);
        else { g.fillStyle = ask ? '#c84a3a' : '#5a6a3a'; g.fillRect(x - 1, y - 7, 2, 5); g.fillRect(x - 1, y - 1, 2, 2); }
        if (k != null) { g.fillStyle = '#2a2a1e'; g.fillRect(x - 7, y + 5, 14, 2); g.fillStyle = k > 0.5 ? '#7ac84a' : k > 0.25 ? '#e8c04a' : '#d84a3a'; g.fillRect(x - 7, y + 5, Math.max(1, Math.round(14 * k)), 2); }
      }
      function draw(g) {
        const vw = ctx.view.w, vh = ctx.view.h;
        g.fillStyle = '#2a6474'; g.fillRect(0, 0, vw, vh);
        camera(g);
        g.drawImage(ground, -MX, -MY);
        // glints on the water
        g.fillStyle = 'rgba(230,255,250,0.55)';
        for (let i = 0; i < 44; i++) { const gx = (Tycho.seed.hash(i, 3, sd) * (W + MX * 2) - MX) | 0, gy = (Tycho.seed.hash(i, 7, sd) * (H + MY * 2) - MY) | 0; if (landF(gx, gy, sd) < -0.04 && Math.sin(anim * 1.6 + i * 1.3) > 0.65) g.fillRect(gx, gy, 2 + (i % 2), 1); }
        for (const r of ripples) { g.globalAlpha = 1 - r.t / 0.8; g.fillStyle = '#d8f4f0'; const rr = 4 + r.t * 10; g.fillRect(Math.round(r.x - rr), Math.round(r.y), Math.round(rr * 2), 1); }
        g.globalAlpha = 1;
        // what stands, back to front
        const items = [];
        items.push({ y: DOOR.y, fn: () => g.drawImage(sprites.door.c, DOOR.x - sprites.door.ax, DOOR.y - sprites.door.ay) });
        for (const st of STATIONS) items.push({ y: st.y + 2, fn: () => { const sp = sprites.station[st.id]; g.drawImage(sp.c, st.x - sp.ax, st.y + 6 - sp.ay); } });
        for (const d of FROGS.concat([RIBBIT])) {
          const f = d === RIBBIT ? s.ribbit : s.frogs[d.id], z = f.hop ? Math.sin(Math.PI * Math.min(1, f.hop.t / f.hop.dur)) * 12 : 0;
          const sp = sprites.frog[d.id][f.hop ? 'hop' : 'sit'], bob = f.hop ? 0 : Math.round(Math.sin(anim * 2 + d.id.length) * 0.4);
          items.push({ y: f.y, fn: () => {
            if (z > 1) { g.globalAlpha = 0.25; g.fillStyle = '#0a2a20'; g.fillRect(Math.round(f.x - 5), Math.round(f.y - 1), 10, 2); g.globalAlpha = 1; }
            g.drawImage(sp.c, Math.round(f.x - sp.ax), Math.round(f.y - sp.ay - z + bob));
            // Ribbit fishes through the rush
            if (d === RIBBIT && s.phase === 'rush' && !f.hop) { g.fillStyle = '#6a4a2a'; for (let i = 0; i < 9; i++) g.fillRect(Math.round(f.x + 6 + i), Math.round(f.y - 14 - i), 1, 1); g.fillStyle = 'rgba(240,240,240,0.7)'; g.fillRect(Math.round(f.x + 15), Math.round(f.y - 23), 1, 15); }
          } });
        }
        if (s.phase === 'dusk' || s.phase === 'gone') items.push({ y: RAFT.y, fn: () => { const sp = sprites.raft; g.drawImage(sp.c, RAFT.x - sp.ax, RAFT.y - sp.ay + Math.round(Math.sin(anim * 1.4))); } });
        items.push({ y: body.y, fn: () => {
          const pose = goal && path.length ? 'walk' + (Math.floor(s.walked / 5) & 3) : 'stand';
          const P = Figure.pose(style, pose, s.face < 0);
          Figure.draw(g, P, body.x, body.y);
          // the apron, once it's on
          if (s.phase !== 'arrive') { g.fillStyle = '#f4ecd4'; g.fillRect(Math.round(body.x - 2), Math.round(body.y - 12), 4, 6); g.fillStyle = '#d8ccb0'; g.fillRect(Math.round(body.x - 2), Math.round(body.y - 7), 4, 1); }
          // the Lantern: on the belt while the hands are busy, in hand otherwise
          const L = Figure.lantern(style);
          if (s.holding || s.cooking) Figure.draw(g, L, body.x - 4 * s.face, body.y - 10);
          else Figure.draw(g, L, body.x + P.hx, body.y + P.hy);
          if (s.holding && !(drag && drag.on)) { const [hx, hy] = handAt(); g.drawImage(sprites.dish[s.holding], Math.round(hx - 4), Math.round(hy - 4)); }
        } });
        if (s.fly) items.push({ y: s.fly.y + 30, fn: () => g.drawImage(sprites.fly[(anim * 20 | 0) % 2], Math.round(s.fly.x - 2), Math.round(s.fly.y - 2)) });
        items.sort((a, b) => a.y - b.y);
        for (const it of items) it.fn();
        // steam over the pot, and how far the cooking's got
        for (const p of steam) { g.globalAlpha = 0.5 * (1 - p.t); g.fillStyle = '#ffffff'; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
        g.globalAlpha = 1;
        if (s.cooking) { const st = STATIONS.find((q) => q.id === s.cooking.at); g.fillStyle = '#2a2a1e'; g.fillRect(st.x - 8, st.y - 18, 16, 3); g.fillStyle = '#f4c84a'; g.fillRect(st.x - 8, st.y - 18, Math.round(16 * (1 - s.cooking.t / 1.1)), 3); }
        // the bubbles: what each frog wants once you've asked (a ghost of their usual
        // if you've learned it), and how long they'll wait
        for (const d of FROGS) {
          const f = s.frogs[d.id];
          if (f.st !== 'waiting') continue;
          const k = d.mayor ? null : Math.max(0, 1 - f.wait / patience(d.id));
          bubble(g, Math.round(f.x), Math.round(f.y - 26), f.ordered ? f.want : null, k, !f.ordered);
          if (!f.ordered && s.learned[d.id]) { g.globalAlpha = 0.5; g.drawImage(sprites.dish[s.learned[d.id]], Math.round(f.x + 8), Math.round(f.y - 36)); g.globalAlpha = 1; }
        }
        if (drag && drag.on && s.holding) { g.globalAlpha = 0.85; g.drawImage(sprites.dish[s.holding], Math.round(drag.x - 4), Math.round(drag.y - 4)); g.globalAlpha = 1; }
        // the light: flat and bright by day; gold, then violet, at dusk, with the lanterns lit
        g.setTransform(1, 0, 0, 1, 0, 0);
        if (s.dusk > 0) {
          const gr = g.createLinearGradient(0, 0, 0, vh);
          gr.addColorStop(0, `rgba(150,110,190,${0.6 * s.dusk})`); gr.addColorStop(1, `rgba(255,170,90,${0.55 * s.dusk})`);
          g.globalCompositeOperation = 'multiply'; g.fillStyle = gr; g.fillRect(0, 0, vw, vh); g.globalCompositeOperation = 'source-over';
          const ox = -Math.round(cam.x), oy = -Math.round(cam.y);
          for (const [lx, ly] of [[116, 60], [262, 60], [RAFT.x + 8, RAFT.y - 16]]) Figure.halo(g, lx + ox, ly + oy, 26, 'rgba(255,190,110,', 0.4 * s.dusk);
          Figure.halo(g, body.x + ox, body.y - 10 + oy, 30, 'rgba(255,200,120,', 0.35 * s.dusk);
          g.fillStyle = '#ffd27a'; for (const [lx, ly] of [[116, 60], [262, 60]]) g.fillRect(lx + ox - 1, ly + oy - 2, 3, 4);
        }
      }

      // ---- the tests' player: taps and drags, as a thumb would ----
      function bot() {
        if (botCD-- > 0) return null;
        botCD = 8;
        if (goal || s.cooking || later) return null;
        const tap = (x, y) => { ctx.pad.push({ kind: 'down', x: x - cam.x, y: y - cam.y }); ctx.pad.push({ kind: 'up', x: x - cam.x, y: y - cam.y, tap: true }); };
        const dragTo = (x, y) => { const [hx, hy] = handAt(); ctx.pad.push({ kind: 'down', x: hx - cam.x, y: hy - cam.y }); ctx.pad.push({ kind: 'move', x: (hx + x) / 2 - cam.x, y: (hy + y) / 2 - cam.y }); ctx.pad.push({ kind: 'up', x: x - cam.x, y: y - cam.y, tap: false }); };
        if (s.phase === 'arrive') { tap(s.ribbit.x, s.ribbit.y - 6); return null; }
        if (s.phase === 'dusk') { tap(RAFT.x, RAFT.y - 8); return null; }
        if (s.phase !== 'rush') return null;
        if (s.fly && !s.fly.leaving && !s.horace) { tap(s.fly.x, s.fly.y); return null; }
        const waiting = FROGS.filter((d) => s.frogs[d.id].st === 'waiting');
        const mayor = waiting.find((d) => d.mayor);
        if (mayor && !world.fact('flyOrdered')) { tap(s.frogs.mayor.x, s.frogs.mayor.y - 6); return null; }
        const wantOf = (d) => (d.mayor ? (s.horace ? s.frogs.mayor.want : null) : knownWant(d.id));
        if (s.holding) {
          const to = waiting.find((d) => wantOf(d) === s.holding) || (s.holding === 'fly' ? mayor : null);
          if (to) { const f = s.frogs[to.id]; dragTo(f.x, f.y - 6); return null; }
        }
        // cook for someone whose want is known (a regular served before they ask), else take an order
        const known = waiting.find((d) => wantOf(d) && wantOf(d) !== 'fly');
        if (known) { const st = STATIONS.find((q) => q.dish === wantOf(known)); tap(st.x, st.y); return null; }
        const ask = waiting.find((d) => !d.mayor && !s.frogs[d.id].ordered);
        if (ask) { tap(s.frogs[ask.id].x, s.frogs[ask.id].y - 6); return null; }
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
