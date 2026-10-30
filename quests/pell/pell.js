'use strict';
// ---------------------------------------------------------------------------
// Mrs. Pell's cat: the first distraction. A brick terrace, side-on, late on
// a warm afternoon, in flat pixel art. Biscuit is on the roof and won't come
// down; you go up the drainpipe and after him over the gutters, a dormer, a
// taller roof and an alley, until he drops through the skylight of number
// nine, which has no floor: just its rooms, hanging in the dark. Catch him
// there, come out of its front door onto the street, and take him home. Mrs.
// Pell gives you his saucer, and sends you out through her cellar.
//
// The play is climbing: the platform runner with gutters and ledges to stand
// on, drainpipes to climb, a stick and Jump. Falling is a detour, never a
// death: from the roofs you land in Mr. Dunmore's roses, and he has something
// to say about it each time. The people are Tyrell people talking through
// Voice: Mrs. Pell, Mr. Dunmore next door, and Pip, who knows where the cat
// goes. Everything painted is drawn from the seed.
// ---------------------------------------------------------------------------
(() => {
  const { clamp } = Tycho.math;
  const { hash } = Tycho.seed;
  const rgb = Tycho.color.rgb, mixRgb = Tycho.color.mixRgb;
  // a flat ramp through the colors given, n tones, dark to light
  const R = (cols, n = 6) => {
    const A = cols.map(rgb), out = [];
    for (let i = 0; i < n; i++) { const t = (i / (n - 1)) * (A.length - 1), k = Math.min(A.length - 2, Math.floor(t)); out.push(mixRgb(A[k], A[k + 1], t - k)); }
    return out;
  };

  // ---- the terrace: world px, the street at the bottom
  const W = 640, H = 240, G = 222;
  const HOUSES = [
    { n: 3, x0: 40, x1: 160, gut: 118, ridge: 84, brick: ['#5a2018', '#8a3a28', '#b45a3c', '#d07a52'], door: '#3f7a4c' },
    { n: 5, x0: 160, x1: 280, gut: 118, ridge: 84, brick: ['#4a2418', '#76402a', '#9a5a3a', '#b8764e'], door: '#2a2830' },
    { n: 7, x0: 280, x1: 400, gut: 100, ridge: 66, brick: ['#6a4a28', '#a07a48', '#c49a5e', '#e0bc7a'], door: '#d8a83a' },
    { n: 9, x0: 436, x1: 580, gut: 118, ridge: 84, brick: ['#3a2420', '#603a2e', '#7e5040', '#9a6a52'], door: '#5a7a9a', empty: true },
  ];
  const PIPES = [{ x: 160, y0: 118, y1: G }, { x: 396, y0: 100, y1: G }, { x: 576, y0: 118, y1: G }];
  const DORMER = { x0: 208, y0: 102, x1: 230, y1: 118 };
  const SKY = { x: 507, y: 118 };
  const PELL = { x: 112 }, PELL_ASIDE = { x: 130 }, DOOR3 = { x: 94 }, DUNMORE = { x: 252 }, PIP = { x: 352 }, GARDEN = { x: 226 }, DOOR9 = { x: 520 };
  // where Biscuit waits on the roofs (4: gone through the skylight)
  const CAT_T = [{ x: 120, y: 118 }, { x: 222, y: 102 }, { x: 362, y: 100 }, { x: 512, y: 118 }];

  // ---- the house with no floor: pieces of rooms, hanging in the dark
  const W2 = 540, H2 = 280;
  const PIECES = [
    { id: 'wardrobe', x0: 40, x1: 80, y: 90, h: 58 },
    { id: 'bed', x0: 96, x1: 160, y: 130, h: 20 },
    { id: 'stairs', x0: 180, x1: 240, y: 150, y1: 110, h: 10 },
    { id: 'rug', x0: 262, x1: 332, y: 122, h: 3 },
    { id: 'dresser', x0: 372, x1: 440, y: 140, h: 26 },
    { id: 'table', x0: 458, x1: 512, y: 118, h: 22 },
    { id: 'hall', x0: 380, x1: 524, y: 206, h: 6 },
  ];
  const CAT_N = [{ x: 128, y: 130 }, { x: 300, y: 122 }, { x: 410, y: 140 }, { x: 494, y: 110 }];
  const STEPLADDER = { x: 516, y0: 118, y1: 206 };
  const FRONT = { x: 420, y: 206 };
  const LAMPS = [[70, 40], [306, 92], [400, 112], [476, 96], [230, 70]];

  // the runner's numbers: a little lighter on its feet than the Road's
  const NUM = { w: 8, h: 20, speed: 84, walk: 46, accel: 900, airAccel: 620, friction: 1100, jump: 220, gravity: 700, maxFall: 360, coyote: 0.1, climb: 60 };
  const STYLE = { key: 'pell', h: 22, flat: true, ink: '#2a1614', coat: '#3a5a8c', glass: '#ffe08a' };

  const DUNMORE_LINES = [
    ['You land in a rosebush.', { who: 'Mr. Dunmore', text: "That's my Ena Harkness you're lying in." }],
    ['You land in the roses again.', { who: 'Mr. Dunmore', text: 'Twice. Twice in one afternoon. Is it catching?' }],
    ['The roses, again.', { who: 'Mr. Dunmore', text: "I'm going to start charging." }],
    ['The roses.', { who: 'Mr. Dunmore', text: "I've stopped looking up, you know. I just hear the gutter go." }],
  ];

  // ---- painting: the terrace, its sky, the roofs behind, the house with no floor
  function paintSky() {
    const P = new Tycho.paint.Pix(1, H, 0, 0, { flat: true });
    const sky = R(['#7aa6d8', '#a8c4e0', '#e8cfae', '#f4b07a', '#f0905a'], 12);
    // bands, dithered where they meet: a flat painter's gradient
    P.area(0, 0, 0, H - 1, sky, (x, y) => clamp(y / 200 + ((y >> 1) & 1 ? 0.02 : -0.02), 0, 1));
    return P.canvases().c;
  }
  function paintClouds(rng) {
    const w = 960, P = new Tycho.paint.Pix(w, 120, 0, 0, { flat: true }), c = R(['#d89a86', '#f2c4a4', '#fff0dc'], 4);
    for (let i = 0; i < 9; i++) {
      const cx = rng.f(40, w - 40), cy = rng.f(18, 90), rx = rng.f(22, 54), ry = rng.f(4, 9);
      P.area(Math.floor(cx - rx), Math.floor(cy - ry * 2), Math.ceil(cx + rx), Math.ceil(cy + ry), c, (x, y) => (y < cy - ry * 0.4 ? 0.95 : y < cy + ry * 0.4 ? 0.6 : 0.25), {
        inside: (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy * (dy < 0 ? 0.4 : 1.4) < 1 - 0.25 * Tycho.seed.noise(x * 0.15, y * 0.3, i); },
      });
    }
    return P.canvases().c;
  }
  // the roofs of the streets behind: chimneys, aerials, a church, in the haze
  function paintFar(rng) {
    const w = 900, P = new Tycho.paint.Pix(w, H, 0, 0, { flat: true });
    const haze = R(['#9a7a9a', '#b8909e', '#cfa6a6'], 3);
    let x = 0;
    while (x < w) {
      const bw = rng.i(40, 90), top = rng.i(110, 150), ridge = top - rng.i(8, 18);
      P.area(x, top, x + bw - 1, H - 1, haze, () => 0.5);
      P.area(x, ridge, x + bw - 1, top - 1, haze, () => 0.25);
      for (let k = 0; k < 2; k++) { const cx = x + rng.i(6, bw - 10); P.area(cx, ridge - rng.i(8, 14), cx + 5, ridge, haze, () => 0.25); }
      if (rng.chance(0.3)) { const ax = x + rng.i(8, bw - 8); P.area(ax, ridge - 20, ax, ridge, haze, () => 0); P.area(ax - 4, ridge - 18, ax + 4, ridge - 18, haze, () => 0); }
      x += bw;
    }
    // a church tower and its spire
    const cx = 610;
    P.area(cx, 60, cx + 16, H - 1, haze, () => 0.35);
    P.area(cx + 2, 28, cx + 14, 59, haze, () => 0.35, { inside: (x2, y) => Math.abs(x2 - (cx + 8)) < (y - 28) * 0.22 });
    return P.canvases().c;
  }
  // a brick facade: courses three px high, the joints offset each course
  function bricks(P, x0, y0, x1, y1, cols, seed) {
    const ramp = R(cols, 6);
    P.area(x0, y0, x1 - 1, y1 - 1, ramp, (x, y) => {
      const row = Math.floor((y - y0) / 3), off = (row & 1) * 3;
      if ((y - y0) % 3 === 2 || (x + off) % 7 === 0) return 0.82;
      // a brick's own tone, and the low sun lighting the facade's left edge
      return 0.18 + hash(Math.floor((x + off) / 7), row, seed) * 0.32 + (x - x0 < 3 ? 0.15 : 0);
    });
  }
  function windowAt(P, x0, y0, w, h, o = {}) {
    const frame = R(['#8a8478', '#e8e2d2', '#ffffff'], 3), sill = R(['#7a7468', '#c8c0aa', '#e8e0c8'], 3);
    const glass = o.board ? R(['#3a2a1e', '#6a4a2e', '#8a6440'], 4) : R(['#2a3448', '#5a6a8a', '#f2c890', '#fff0c8'], 6);
    P.area(x0 - 1, y0 - 1, x0 + w, y0 + h, frame, () => 0.5);
    P.area(x0, y0, x0 + w - 1, y0 + h - 1, glass, (x, y) => {
      if (o.board) return (y - y0) % 4 === 0 ? 0 : 0.6;
      // the sky's gold caught in the top panes, a dark room under it
      const k = (x - x0 + (y - y0) * 0.7) / (w + h);
      return clamp(0.15 + (y < y0 + h / 2 ? 0.55 : 0.1) + (k < 0.3 ? 0.3 : 0), 0, 1);
    });
    if (!o.board) { P.area(x0, y0 + Math.floor(h / 2), x0 + w - 1, y0 + Math.floor(h / 2), frame, () => 1); P.area(x0 + Math.floor(w / 2), y0, x0 + Math.floor(w / 2), y0 + h - 1, frame, () => 1); }
    P.area(x0 - 2, y0 + h + 1, x0 + w + 1, y0 + h + 2, sill, (x, y) => (y === y0 + h + 1 ? 1 : 0.4));
    if (o.curtain) P.area(x0, y0, x0 + 2, y0 + h - 1, R(['#7a3a4a', '#c86a7a'], 2), (x) => (x === x0 ? 0 : 1));
  }
  function paintTerrace() {
    const P = new Tycho.paint.Pix(W, H, 0, 0, { flat: true });
    const slate = R(['#2a3040', '#4a5468', '#6a7488', '#8a94a8'], 5), stone = R(['#6a6458', '#9a9282', '#c8c0aa', '#e2dac2'], 5);
    const pots = R(['#6a2a18', '#b0583a', '#e08a5a'], 3), pipe = R(['#14141a', '#2c2c36', '#4a4a58'], 3);
    // the alley between seven and nine: a dark passage, a back gate
    P.area(400, 112, 435, G - 1, R(['#1c1418', '#2e2026', '#463036'], 3), (x, y) => (y % 9 === 0 ? 0.05 : 0.3));
    P.area(410, G - 40, 425, G - 1, R(['#3a2a1a', '#6a4a2a', '#8a6438'], 3), (x) => ((x - 410) % 4 === 0 ? 0 : 0.6));
    for (const h of HOUSES) {
      const s = h.n * 101;
      // the roof: slates in courses, lit along their lower edge, ridge tiles on top
      P.area(h.x0, h.ridge, h.x1 - 1, h.gut - 1, slate, (x, y) => {
        const row = Math.floor((y - h.ridge) / 4), off = (row & 1) * 4;
        if ((y - h.ridge) % 4 === 3) return 0.85;
        if ((x + off) % 8 === 0) return 0.05;
        return 0.3 + hash(Math.floor((x + off) / 8), row, s) * 0.25;
      });
      P.area(h.x0, h.ridge - 2, h.x1 - 1, h.ridge - 1, pots, (x) => ((x - h.x0) % 6 === 0 ? 0 : 0.6));
      // the facade, a plinth course, the party walls lit and shaded
      bricks(P, h.x0, h.gut, h.x1, G, h.brick, s);
      P.area(h.x0, G - 6, h.x1 - 1, G - 1, R(['#3a2a24', '#5a4a40', '#7a6a5a'], 3), (x, y) => (y === G - 6 ? 1 : 0.4));
      P.area(h.x0, h.gut, h.x0 + 1, G - 1, stone, () => 0.85);
      P.area(h.x1 - 2, h.gut, h.x1 - 1, G - 1, stone, () => 0.35);
      // the gutter and its brackets
      P.area(h.x0 - 1, h.gut, h.x1, h.gut + 1, pipe, (x, y) => (y === h.gut ? 0.9 : 0.3));
      for (let x = h.x0 + 6; x < h.x1; x += 18) P.area(x, h.gut + 2, x, h.gut + 3, pipe, () => 0.3);
      // the first floor's windows, and the ground floor's door and bay
      const up = h.gut + (h.n === 7 ? 18 : 22), fw = h.n === 9 ? 3 : 2, span = h.x1 - h.x0;
      for (let k = 0; k < fw; k++) windowAt(P, h.x0 + 14 + Math.floor((k * (span - 46)) / Math.max(1, fw - 1)), up, 16, 22, { curtain: h.n !== 9 && k === 0, board: h.empty && k === 1 });
      const dx = h.n === 3 ? 86 : h.n === 9 ? 512 : h.x0 + 18, dy = G - 40;
      P.area(dx - 2, dy - 2, dx + 17, G - 1, stone, (x, y) => (y < dy ? 1 : 0.55));
      P.area(dx, dy + 8, dx + 15, G - 4, R(['#000000', h.door, '#ffffff'], 7), (x, y) => (x === dx || x === dx + 15 ? 0.25 : (y - dy) % 10 === 0 ? 0.3 : (x - dx) % 8 === 3 ? 0.38 : 0.5));
      P.area(dx, dy, dx + 15, dy + 6, R(['#2a3448', '#f2c890', '#fff0c8'], 3), (x, y) => (Math.abs(x - dx - 7.5) < (y - dy) * 1.4 ? 0.7 : 0.1));
      P.area(dx - 3, G - 3, dx + 18, G - 1, stone, (x, y) => (y === G - 3 ? 1 : 0.5));
      P.put(dx + 12, dy + 26, [230, 200, 120]);
      const bx = h.n === 3 ? 48 : h.n === 9 ? 452 : h.x0 + 52;
      windowAt(P, bx, G - 36, 26, 22, { board: h.empty, curtain: !h.empty });
    }
    // chimney stacks on the party walls, and their pots
    for (const [cx, ridge, n] of [[160, 84, 3], [280, 66, 2], [436, 84, 2], [48, 84, 2]]) {
      bricks(P, cx - 8, ridge - 18, cx + 8, ridge, ['#4a2418', '#7a3a28', '#a05a3a', '#c07a52'], cx);
      P.area(cx - 9, ridge - 20, cx + 8, ridge - 18, stone, (x, y) => (y === ridge - 20 ? 1 : 0.5));
      for (let k = 0; k < n; k++) P.area(cx - 7 + k * 5, ridge - 26, cx - 5 + k * 5, ridge - 21, pots, (x) => (x === cx - 7 + k * 5 ? 0.3 : 0.8));
    }
    // the dormer on five, its little window
    P.area(DORMER.x0, DORMER.y0, DORMER.x1 - 1, DORMER.y1 - 1, R(['#5a5048', '#ece4d4'], 4), (x, y) => (y < DORMER.y0 + 2 ? 0 : 0.8));
    windowAt(P, DORMER.x0 + 5, DORMER.y0 + 4, 12, 10, {});
    // the skylight on nine: its lid propped open, the dark under it
    P.area(SKY.x - 10, 100, SKY.x + 10, 112, R(['#0a0810', '#24202a', '#6a6a78', '#c8ccd8'], 4), (x, y) => (x === SKY.x - 10 || x === SKY.x + 10 || y === 100 || y === 112 ? 0.7 : 0.1));
    P.area(SKY.x - 10, 92, SKY.x + 10, 99, R(['#6a7a8a', '#a8c0d0', '#e8f0f8'], 3), (x, y) => (y === 92 ? 0.3 : x - SKY.x === y - 96 ? 1 : 0.6));
    // the drainpipes
    for (const p of PIPES) {
      P.area(p.x - 1, p.y0, p.x + 1, p.y1 - 1, pipe, (x) => (x === p.x - 1 ? 0.9 : 0.35));
      for (let y = p.y0 + 10; y < p.y1; y += 24) P.area(p.x - 2, y, p.x + 2, y + 1, pipe, () => 0.1);
      P.area(p.x - 3, p.y0, p.x + 3, p.y0 + 3, pipe, () => 0.4);
    }
    // the laundry line over the alley, and what's on it
    const sagAt = (x0, y0, x1, sag, x) => Math.round(y0 + Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * sag);
    const line = (x0, y0, x1, sag) => { for (let x = x0; x <= x1; x++) P.put(x, sagAt(x0, y0, x1, sag, x), [60, 52, 48]); };
    line(398, 124, 438, 4);
    for (const [x, c, w, h] of [[402, '#e8e4dc', 8, 12], [412, '#d85a4a', 6, 9], [420, '#6a9ad8', 7, 10], [429, '#f2d27a', 5, 7]]) {
      const yy = sagAt(398, 124, 438, 4, x + w / 2);
      P.area(x, yy, x + w - 1, yy + h, R(['#000000', c, '#ffffff'], 7), (px, py) => (px === x + w - 1 ? 0.35 : py === yy ? 0.65 : 0.5));
    }
    line(102, 162, 158, 3);
    for (const [x, c] of [[110, '#f0f0e8'], [120, '#8ab06a'], [132, '#e8e4dc'], [146, '#c86aa0']]) { const yy = sagAt(102, 162, 158, 3, x + 2); P.area(x, yy, x + 4, yy + 6, R(['#000000', c, '#ffffff'], 5), (px) => (px === x + 4 ? 0.3 : 0.5)); }
    // the pavement, its slabs and kerb, and the road
    P.area(0, G, W - 1, G + 6, stone, (x, y) => (y === G ? 0.95 : x % 22 === 0 ? 0.2 : 0.6 - (y - G) * 0.04));
    P.area(0, G + 7, W - 1, G + 8, stone, () => 0.3);
    P.area(0, G + 9, W - 1, H - 1, R(['#26242a', '#3a383e', '#4e4a50'], 3), (x, y) => (hash(x, y, 7) < 0.08 ? 1 : 0.4));
    // Mr. Dunmore's roses, in a bed along his front wall
    const leaf = R(['#1c3a1e', '#2e5a2a', '#4a7a3a'], 3), rose = R(['#7a1a2a', '#c83a4a', '#f07a7a'], 3);
    P.area(212, G - 12, 262, G - 1, leaf, (x, y) => hash(x >> 1, y >> 1, 5) * 0.8 + (y - G + 12) * 0.03, { inside: (x, y) => y > G - 12 + Math.abs(Math.sin(x * 0.4)) * 4 });
    for (let i = 0; i < 12; i++) { const rx = 214 + Math.floor(hash(i, 1, 9) * 46), ry = G - 10 + Math.floor(hash(i, 2, 9) * 6); P.area(rx, ry, rx + 1, ry + 1, rose, (x, y) => (x === rx && y === ry ? 1 : 0.5)); }
    P.area(206, G - 8, 211, G - 1, R(['#5a2a1a', '#9a5a3a', '#c07a52'], 3), (x, y) => (y === G - 8 ? 1 : 0.5));
    // the lamp post at the end, a postbox at the start
    P.area(612, 150, 613, G - 1, pipe, (x) => (x === 612 ? 0.8 : 0.3));
    P.area(607, 144, 618, 150, pipe, (x, y) => (y === 144 ? 0.8 : 0.3));
    P.area(16, G - 22, 25, G - 1, R(['#5a0a0a', '#c82a2a', '#f06a5a'], 3), (x, y) => (y < G - 19 ? 0.2 : x === 16 ? 0.9 : 0.5));
    P.area(17, G - 15, 24, G - 15, R(['#000000', '#000000'], 2), () => 0);
    return P.canvases().c;
  }
  // the house with no floor: a deep, dusty dark with the ghosts of rooms in it
  function paintVoid(rng) {
    const P = new Tycho.paint.Pix(W2, H2, 0, 0, { flat: true });
    const dark = R(['#06050c', '#0e0c1c', '#1a1630', '#2a2244'], 6);
    P.area(0, 0, W2 - 1, H2 - 1, dark, (x, y) => clamp(0.55 - (y / H2) * 0.5 + (((x + y) & 3) === 0 ? 0.04 : 0), 0, 1));
    // scraps of wallpaper and picture frames, far off, hanging on nothing
    const paper = R(['#12101e', '#1c1830', '#262038'], 3);
    for (let i = 0; i < 14; i++) {
      const x = rng.i(0, W2 - 50), y = rng.i(0, H2 - 60), w = rng.i(18, 46), h = rng.i(20, 50);
      P.area(x, y, x + w, y + h, paper, (px, py) => ((px - x) % 6 === 0 ? 0.9 : (py - y) % 8 < 1 ? 0.6 : 0.3));
      if (rng.chance(0.5)) { const fx = x + rng.i(4, w - 12), fy = y + rng.i(4, h - 12); P.area(fx, fy, fx + 8, fy + 9, R(['#2a2030', '#5a4a3a'], 3), (px, py) => (px === fx || py === fy || px === fx + 8 || py === fy + 9 ? 1 : 0)); }
    }
    for (let i = 0; i < 120; i++) P.put(rng.i(0, W2 - 1), rng.i(0, H2 - 1), [90, 80, 120]);
    return P.canvases().c;
  }
  function paintPieces() {
    const P = new Tycho.paint.Pix(W2, H2, 0, 0, { flat: true });
    const wood = R(['#2a1810', '#5a3420', '#8a5430', '#b07a48'], 6), cloth = R(['#3a1a2a', '#7a3a4a', '#b05a6a', '#e08a8a'], 5);
    const under = R(['#08060e', '#14101e'], 2);
    for (const p of PIECES) {
      if (p.id === 'wardrobe') {
        P.area(p.x0, p.y, p.x1 - 1, p.y + p.h, wood, (x, y) => (x === p.x0 || y === p.y ? 0.9 : x === p.x1 - 1 ? 0.15 : x === p.x0 + 20 ? 0.1 : (x - p.x0) % 20 === 3 || (y - p.y) % 26 === 4 ? 0.7 : 0.45));
        P.put(p.x0 + 18, p.y + 28, [220, 190, 120]); P.put(p.x0 + 23, p.y + 28, [220, 190, 120]);
        P.area(p.x0 + 4, p.y + p.h, p.x0 + 6, p.y + p.h + 3, wood, () => 0.2); P.area(p.x1 - 7, p.y + p.h, p.x1 - 5, p.y + p.h + 3, wood, () => 0.2);
      }
      if (p.id === 'bed') {
        P.area(p.x0, p.y - 14, p.x0 + 3, p.y + p.h, wood, (x) => (x === p.x0 ? 0.8 : 0.4));
        P.area(p.x0, p.y, p.x1 - 1, p.y + 8, R(['#3a3448', '#8a8aa8', '#e8e8f0'], 4), (x, y) => (y === p.y ? 1 : 0.6));
        // a patchwork quilt
        P.area(p.x0 + 14, p.y, p.x1 - 1, p.y + 8, cloth, (x, y) => (y === p.y ? 0.9 : 0.3 + hash(Math.floor(x / 6), Math.floor(y / 4), 3) * 0.5));
        P.area(p.x0 + 4, p.y - 4, p.x0 + 13, p.y - 1, R(['#8a8aa8', '#f4f4f8'], 3), (x, y) => (y === p.y - 4 ? 0.5 : 1));
        P.area(p.x0, p.y + 9, p.x1 - 1, p.y + p.h, wood, (x, y) => (y === p.y + 9 ? 0.8 : 0.35));
      }
      if (p.id === 'stairs') {
        for (let x = p.x0; x < p.x1; x++) {
          const top = Math.round(p.y + ((p.y1 - p.y) * (x - p.x0)) / (p.x1 - p.x0)), step = (x - p.x0) % 8 < 1;
          P.area(x, top, x, top + 12, wood, (px, py) => (py === top ? 0.95 : step ? 0.2 : py < top + 3 ? 0.6 : 0.35));
          if ((x - p.x0) % 6 < 1) P.area(x, top - 16, x, top - 1, wood, () => 0.35); // the banisters
          P.area(x, top - 17, x, top - 16, wood, () => 0.8);
          P.put(x, top + 1, [150, 40, 50]);
        }
      }
      if (p.id === 'rug') {
        P.area(p.x0, p.y, p.x1 - 1, p.y + p.h, R(['#4a1a1a', '#9a3a2a', '#d8a050'], 4), (x, y) => ((x - p.x0) % 5 === 0 ? 1 : y === p.y ? 0.6 : 0.4));
        // an armchair, and a grandfather clock standing on the rug
        P.area(288, p.y - 16, 312, p.y - 1, R(['#1a3a2a', '#3a6a4a', '#6a9a6a'], 4), (x, y) => (y < p.y - 12 || x < 291 || x > 308 ? 0.4 : y === p.y - 8 ? 1 : 0.65));
        P.area(318, p.y - 34, 328, p.y - 1, wood, (x, y) => (x === 318 ? 0.8 : y < p.y - 28 ? 0.7 : 0.4));
        P.area(320, p.y - 32, 326, p.y - 27, R(['#c8c0a8', '#f4ecd4'], 2), () => 1);
        P.put(323, p.y - 30, [40, 30, 20]); P.put(324, p.y - 29, [40, 30, 20]);
      }
      if (p.id === 'dresser') {
        P.area(p.x0, p.y, p.x1 - 1, p.y + p.h, wood, (x, y) => (y === p.y ? 0.95 : (y - p.y) % 8 === 0 ? 0.15 : x === p.x0 ? 0.7 : 0.45));
        P.area(p.x0 + 20, p.y - 22, p.x0 + 44, p.y - 1, R(['#2a2a38', '#6a7a9a', '#c8d8e8'], 4), (x, y) => (x === p.x0 + 20 || x === p.x0 + 44 || y === p.y - 22 ? 0.2 : (x - y) % 11 === 0 ? 0.9 : 0.45));
        for (let k = 0; k < 3; k++) P.put(p.x0 + 10 + k * 22, p.y + 12, [220, 190, 120]);
      }
      if (p.id === 'table') {
        P.area(p.x0, p.y, p.x1 - 1, p.y + 3, R(['#c8c0b0', '#f4f0e8'], 3), (x, y) => (y === p.y ? 1 : (x - p.x0) % 6 < 3 ? 0.4 : 0.8));
        P.area(p.x0 + 3, p.y + 4, p.x0 + 5, p.y + p.h, wood, () => 0.4); P.area(p.x1 - 6, p.y + 4, p.x1 - 4, p.y + p.h, wood, () => 0.4);
        // the laundry basket
        P.area(484, p.y - 8, 504, p.y - 1, R(['#5a3a18', '#a07a3a', '#d8b06a'], 4), (x, y) => ((x + y) % 3 === 0 ? 0.3 : y === p.y - 8 ? 1 : 0.65));
      }
      if (p.id === 'hall') {
        P.area(p.x0, p.y, p.x1 - 1, p.y + p.h, R(['#2a2a30', '#d8d0c0'], 2), (x, y) => (((x >> 2) + (y >> 2)) & 1 ? 1 : 0));
        // the front door, standing in its frame on nothing, the street's light round it
        const fx = FRONT.x - 9;
        P.area(fx - 2, p.y - 40, fx + 19, p.y - 1, R(['#5a5a5a', '#e8e2d2'], 3), () => 0.6);
        P.area(fx, p.y - 38, fx + 17, p.y - 1, R(['#000000', '#5a7a9a', '#ffffff'], 7), (x, y) => (x === fx ? 0.25 : (y - p.y) % 10 === 0 ? 0.3 : 0.5));
        P.put(fx + 14, p.y - 18, [230, 200, 120]);
        for (let y = p.y - 40; y < p.y; y++) { P.put(fx - 3, y, [255, 200, 120], 0.8); P.put(fx + 20, y, [255, 200, 120], 0.8); }
        for (let x = fx - 3; x <= fx + 20; x++) P.put(x, p.y - 41, [255, 210, 140], 0.8);
        // a stepladder someone left
        P.area(STEPLADDER.x - 3, STEPLADDER.y0, STEPLADDER.x + 3, STEPLADDER.y1 - 1, R(['#4a4a50', '#9a9aa4', '#d0d0d8'], 3), (x) => (x === STEPLADDER.x - 3 || x === STEPLADDER.x + 3 ? 0.7 : 1), { inside: (x, y) => x === STEPLADDER.x - 3 || x === STEPLADDER.x + 3 || (y - STEPLADDER.y0) % 8 === 0 });
      }
      P.area(p.x0 + 2, p.y + p.h + 1, p.x1 - 3, p.y + p.h + 2, under, () => 0.5);
    }
    // standard lamps and a pendant, lit
    for (const [x, y] of LAMPS) {
      // a pleated shade, lit from inside, on a stem that stands on nothing
      P.area(x - 5, y - 6, x + 5, y, R(['#8a4a1a', '#d88a3a', '#f4c070', '#ffe4a8'], 4), (px, py) => (py === y ? 0.35 : (px - x) % 3 === 0 ? 0.6 : 0.9), { inside: (px, py) => Math.abs(px - x) <= 2 + (py - (y - 6)) * 0.5, glow: 0.45 });
      P.area(x, y + 1, x, y + 10, wood, () => 0.3);
      P.area(x - 3, y + 11, x + 3, y + 11, wood, () => 0.5);
    }
    return P.canvases();
  }

  // ---- the people, painted from shapes in the terrace's flat style
  function folk(o) {
    const u = o.h / 30, Wd = Math.ceil(22 * u) + 6, Hd = Math.ceil(32 * u) + 3;
    const S = Tycho.sprite.Shapes.figure(Wd, Hd, o.seed || 5, { ink: rgb('#2a1614') });
    const F = Hd - 2, cx = Wd / 2, X = (v) => cx + v * u, Y = (v) => F - v * u;
    S.ax = Math.round(cx); S.ay = F;
    const ramp = (c) => Figure.ramp(c), dark = (r) => r.map((c) => mixRgb(c, [6, 4, 10], 0.32));
    const skin = ramp(o.skin || '#e8b48a'), hair = ramp(o.hair), top = ramp(o.top), low = ramp(o.low), shoe = ramp(o.shoe || '#2a1e1a');
    const sit = !!o.sit, hip = sit ? 8 : 13, sh = sit ? 16 : 21, head = sit ? 20.5 : 25.5;
    // legs, or a skirt
    if (sit) { S.cap(X(-1), Y(hip), X(4), Y(hip), 1.9 * u, 1.7 * u, low); S.cap(X(4), Y(hip), X(4.5), Y(1.5), 1.6 * u, 1.4 * u, low); S.part(); S.cap(X(4), Y(1), X(6.5), Y(1), 1.4 * u, 1.3 * u, shoe); }
    else if (o.skirt) { S.cap(X(-1), Y(5), X(-1), Y(1.5), 1.3 * u, 1.2 * u, dark(skin)); S.cap(X(1.5), Y(5), X(1.5), Y(1.5), 1.3 * u, 1.2 * u, skin); S.part(); S.cap(X(-1.5), Y(1), X(0.5), Y(1), 1.3 * u, 1.2 * u, shoe); S.cap(X(1), Y(1), X(3), Y(1), 1.3 * u, 1.2 * u, shoe); }
    else { S.cap(X(-1), Y(hip), X(-1.2), Y(1.5), 2 * u, 1.5 * u, dark(low)); S.cap(X(1), Y(hip), X(1.4), Y(1.5), 2 * u, 1.5 * u, low); S.part(); S.cap(X(-1.6), Y(1), X(0.6), Y(1), 1.4 * u, 1.3 * u, shoe); S.cap(X(1), Y(1), X(3.2), Y(1), 1.4 * u, 1.3 * u, shoe); }
    S.part();
    if (o.skirt) S.shape([[X(-3), Y(hip + 2)], [X(3.2), Y(hip + 2)], [X(4.2), Y(4.5)], [X(-4), Y(4.5)]], low, { down: 0.3 });
    S.part();
    // the body, an apron over it
    S.shape([[X(-2.8), Y(sh + 0.5)], [X(3), Y(sh + 0.5)], [X(3.4), Y(hip)], [X(-3.2), Y(hip)]], top, { down: 0.3 });
    if (o.apron) { S.part(); S.box(X(-0.5), Y(sh - 2), X(3), Y(o.skirt ? 4.5 : hip - 1), ramp(o.apron)); }
    S.part();
    // the arm, holding something or at the side
    const hand = o.hold ? [5, sh - 6] : [2.5, hip + 0.5];
    S.cap(X(1.2), Y(sh - 0.8), X(hand[0]), Y(hand[1]), 1.6 * u, 1.3 * u, top); S.part(); S.ell(X(hand[0]), Y(hand[1] - 0.5), 1.1 * u, 1.1 * u, skin);
    if (o.hold === 'shears') { S.part(); S.limb(X(hand[0]), Y(hand[1]), X(hand[0] + 4), Y(hand[1] + 2), 1, R(['#4a4a50', '#c8c8d0'], 3)); }
    S.part();
    // the head, the hair (a bun, a cap, a mop)
    S.ell(X(0.4), Y(head), 3 * u, 3.3 * u, skin);
    S.part(false);
    if (o.cap) { S.ell(X(0), Y(head + 2), 3.4 * u, 1.8 * u, hair); S.box(X(0.5), Y(head + 1.6), X(4.2), Y(head + 0.8), hair); }
    else S.ell(X(-0.8), Y(head + 1.6), 3.3 * u, 2.4 * u, hair);
    if (o.bun) S.ell(X(-3.2), Y(head + 1.8), 1.6 * u, 1.6 * u, hair);
    if (o.mop) S.cap(X(-2.6), Y(head + 0.5), X(-2.4), Y(head - 2), 1.4 * u, 1.1 * u, hair);
    S.px(X(1.8), Y(head - 0.2), [30, 20, 24]);
    if (o.specs) { S.px(X(2.4), Y(head - 0.2), [200, 200, 210]); S.px(X(1.2), Y(head - 0.2), [200, 200, 210]); }
    return S.done();
  }
  // Biscuit: a ginger cat, sitting, running, or curled in someone's arms
  function cat(pose) {
    const S = Tycho.sprite.Shapes.figure(18, 13, 11, { ink: rgb('#2a1614') });
    const fur = Figure.ramp('#e08a3a'), pale = Figure.ramp('#f4c890'), eye = [70, 120, 60];
    S.ax = 9; S.ay = 12;
    if (pose === 'sit') {
      S.cap(6, 10, 2, 5, 1.2, 0.9, fur); S.part();
      S.ell(8, 8.5, 3.6, 3.4, fur); S.part();
      S.ell(10.5, 9, 1.4, 2, pale); S.part();
      S.ell(10.5, 4.5, 2.6, 2.3, fur); S.px(9, 2, fur[2]); S.px(12, 2, fur[2]); S.px(9, 1.6, fur[1]); S.px(12, 1.6, fur[1]);
      S.px(11.5, 4.3, eye); S.px(9.7, 4.3, eye);
    } else if (pose === 'run') {
      S.cap(4, 6.5, 0.5, 3.5, 1.1, 0.9, fur); S.part();
      S.cap(4, 10.5, 2.5, 11.5, 0.9, 0.8, fur); S.cap(11, 10.5, 13.5, 11.5, 0.9, 0.8, fur); S.part();
      S.ell(8, 8, 5, 2.6, fur); S.part();
      S.ell(13.5, 6, 2.4, 2.2, fur); S.px(12.5, 3.6, fur[2]); S.px(14.8, 3.6, fur[2]); S.px(14.5, 5.8, eye);
    } else {
      S.ell(9, 8.5, 5, 3.2, fur); S.part(); S.ell(12.5, 7.5, 2.4, 2.1, fur); S.px(11.5, 5.4, fur[2]); S.px(13.6, 5.4, fur[2]); S.part();
      S.cap(4.5, 10.5, 9, 11.2, 1, 0.9, pale);
    }
    return S.done();
  }

  // ---- the people's minds: a Tyrell world of three, and what they'll say
  function declare(w) {
    w.need({ id: 'company', rise: 0.01 });
    w.place({ id: 'street', region: 'terrace' });
    for (const n of ['no3', 'no5', 'no7']) { w.place({ id: n, tags: ['home'], region: 'terrace' }); w.link(n, 'street', 1); }
    w.action({ id: 'about', label: 'out on the street', at: 'street', minutes: 90, base: 0.5, pose: 'stand' });
    w.person('pell', { name: 'Mrs. Pell', home: 'no3', tags: ['pell'], routine: [[0, 'street', 'about']] });
    w.person('dunmore', { name: 'Mr. Dunmore', home: 'no5', tags: ['dunmore'], routine: [[0, 'street', 'about']] });
    w.person('pip', { name: 'Pip', home: 'no7', tags: ['pip'], routine: [[0, 'street', 'about']] });
    const v = w.voice;
    v.approach({ id: 'kind', base: 1 });
    v.approach({ id: 'firm', base: 0 });
    v.approach({ id: 'jest', lands: [{ if: ['is:dunmore'], by: -2 }, { if: ['is:pip'], by: 2 }] });
    // Mrs. Pell: the ask, where he goes, and the cat brought home
    v.thread({
      id: 'pell.ask', opens: true, if: ['is:pell', '!fact:asked'], beats: {
        start: { text: "Oh, thank goodness. It's Biscuit. He's up on the roof again, and he won't come down for me.", answers: [
          { say: "I'll get him down.", approach: 'kind', to: 'thanks' },
          { say: "I'm on a quest, actually.", approach: 'firm', to: 'quest' },
        ] },
        quest: { text: "Are you, dear? How nice. It'll only take a minute. He's just up there.", answers: [
          { say: 'All right. One minute.', to: 'thanks' },
          { say: "It's quite an important quest.", to: 'important' },
        ] },
        important: { text: "I'm sure it is. He's just up there, look. On the gutter.", answers: [{ say: 'One minute.', to: 'thanks' }] },
        thanks: { text: "You're very kind. The drainpipe by the party wall is sound; my Harold put it up. Mind the gutters.", then: ['fact:asked=true'], answers: [{ say: "I'll be careful.", to: 'lamp' }] },
        lamp: { text: "That's a nice lamp, by the way. Very old-fashioned.", answers: [
          { say: 'It was a present.', to: 'off' },
          { say: "It's the Last Lantern.", to: 'last' },
        ] },
        last: { text: "Is it? Well. Don't drop it on the slates.", end: true },
        off: { text: 'Go on, then. Biscuit! BISCUIT!', end: true },
      },
    });
    v.thread({ id: 'pell.where', label: 'Where does he go?', if: ['is:pell', 'fact:asked', '!fact:caught'], beats: {
      start: { text: 'Over the roofs, usually. Number nine, mostly. Nobody lives at number nine.', answers: [{ say: 'Why not?', to: 'why' }] },
      why: { text: "Oh, it's not that sort of house any more. Not since the Askews.", end: true },
    } });
    v.thread({
      id: 'pell.home', opens: true, if: ['is:pell', 'fact:caught', '!fact:home'], beats: {
        start: { text: 'Biscuit! Oh, you wicked thing. Where was he?', answers: [
          { say: "In number nine. It hasn't got a floor.", to: 'floor' },
          { say: 'Here and there.', to: 'saucer' },
        ] },
        floor: { text: "No, it hasn't, not since the Askews went. He likes it in there. Can't think why.", answers: [{ say: "It's very quiet.", to: 'saucer' }] },
        saucer: { text: "Here. Take this. It was his saucer, but he's had cream out of the Askews' fridge now, and he won't look at it.", then: ['fact:home=true'], answers: [{ say: 'Thank you, Mrs. Pell.', approach: 'kind', to: 'cellar' }] },
        cellar: { text: "Go out through my cellar, dear. It's quicker than the street. Wherever it is you're going.", end: true },
      },
    });
    v.thread({ id: 'pell.after', label: 'Is he all right?', if: ['is:pell', 'fact:home'], beats: {
      start: { text: "He's asleep on the boiler. He'll be up there again by teatime.", end: true },
    } });
    // Mr. Dunmore next door, who has roses
    v.thread({
      id: 'dunmore.roses', opens: true, cooldown: 30, if: ['is:dunmore'], beats: {
        start: { text: "If that animal comes in my roses one more time I'll have it made into a hat.", answers: [
          { say: 'Which way does it go?', to: 'way' },
          { say: 'Lovely roses.', approach: 'kind', to: 'roses' },
          { say: 'It would be a nice hat.', approach: 'jest', to: 'hat' },
        ] },
        way: { text: 'Up. Always up. Then over to number nine. Nobody goes in number nine. Nobody sensible.', end: true },
        roses: { text: 'They were.', end: true },
        hat: { text: "Don't.", end: true },
      },
    });
    // Pip, on the step of number seven, who knows
    v.thread({
      id: 'pip.where', opens: true, cooldown: 30, if: ['is:pip'], beats: {
        start: { text: 'You after Biscuit? He goes in the skylight at number nine. Everyone knows.', answers: [
          { say: "What's in there?", to: 'in' },
          { say: 'Thanks.', to: 'off' },
        ] },
        in: { text: "Rooms. Just the rooms. There's no floor.", answers: [{ say: 'No floor?', to: 'nofloor' }] },
        nofloor: { text: "You have to jump. I'm not allowed. And the washing line holds, if you miss.", end: true },
        off: { text: "S'all right.", end: true },
      },
    });
  }
  const WORDS = {
    pell: { name: 'Mrs. Pell', words: { greet: 'Hello again, dear.', bye: 'Mind how you go.', close: "Well, I mustn't keep you." }, bye: 'Off I go' },
    dunmore: { name: 'Mr. Dunmore', words: { greet: 'What.', bye: 'Hm.', close: "I've got deadheading to do." }, bye: 'Leave him be' },
    pip: { name: 'Pip', words: { greet: 'Hiya.', bye: 'Bye!', close: "I've got to go in for my tea." }, bye: 'Bye, Pip' },
  };

  const SOUNDS = {
    'pell.meow': { g: 0.3, gap: 0.5, fn: (S, o, t) => { Tycho.audio.tone(S, o, t, { f: 760, f2: 520, glide: 0.3, w: 'triangle', a: 0.03, hold: 0.12, d: 0.1, g: 0.5, vib: [7, 14], lp: 2400 }); } },
    'pell.hop': { g: 0.12, gap: 0.08, fn: (S, o, t) => { Tycho.audio.tone(S, o, t, { f: 300, f2: 520, glide: 0.08, w: 'triangle', a: 0.002, d: 0.04, g: 0.4 }); } },
    'pell.land': { g: 0.2, gap: 0.1, fn: (S, o, t) => { Tycho.audio.noise(S, o, t, { f: 400, ft: 'lowpass', a: 0.002, d: 0.05, g: 0.5 }); } },
    'pell.thump': { g: 0.4, gap: 0.3, fn: (S, o, t) => { Tycho.audio.noise(S, o, t, { f: 900, f2: 200, glide: 0.2, ft: 'lowpass', a: 0.003, d: 0.15, g: 0.8 }); Tycho.audio.tone(S, o, t, { f: 90, f2: 50, glide: 0.2, a: 0.002, d: 0.12, g: 0.6 }); } },
  };
  // a light, domestic tune for the street; something hushed for number nine
  const SCORE_STREET = { bpm: 76, beats: 4, root: 261.63, w: 'triangle', lp: 2000, g: 0.32, chords: [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14], [0, 4, 7], [2, 5, 9], [7, 11, 14], null] };
  const SCORE_HOUSE = { bpm: 48, beats: 4, root: 196, w: 'sine', lp: 1100, g: 0.4, chords: [[0, 7, 15], [1, 8, 13], [-2, 5, 12], [0, 7, 14]] };

  Elsewhere.quest({
    id: 'pell',
    title: "Mrs. Pell's cat",
    ask: "My cat's on the roof. Would you mind?",
    view: 'side', hold: 'landscape', px: 180,
    accepts: ['doorstep'], offers: ['cellar'],
    souvenir: {
      id: 'saucer', name: 'A saucer',
      rows: [
        '....aaaa....',
        '..abbbbbba..',
        '.abccccccba.',
        'abcccddcccba',
        'abcccddcccba',
        '.abccccccba.',
        '..abbbbbba..',
        '....aaaa....',
      ],
      pal: { a: '#6a7a8a', b: '#dfe6ee', c: '#f6f8fa', d: '#7ab0d8' },
    },
    checklist: ['Get up on the roof', 'Follow Biscuit over the rooftops', 'Catch him', 'Bring him home to Mrs. Pell'],
    controls: { layout: 'stick', a: 'Jump', b: 'Use' },
    sounds: SOUNDS, score: SCORE_STREET,

    make(ctx, way, saved) {
      const rng = ctx.rng('paint');
      const pics = { sky: paintSky(), clouds: paintClouds(rng), far: paintFar(rng), terrace: paintTerrace(), void: paintVoid(rng), pieces: paintPieces() };
      const sprites = {
        pell: folk({ h: 21, hair: '#c8c4cc', top: '#8a6aa8', low: '#5a4a6a', apron: '#e8d8c0', skirt: true, bun: true, specs: true, seed: 21 }),
        dunmore: folk({ h: 24, hair: '#5a4a3a', top: '#6a5a3a', low: '#3a3a42', cap: true, hold: 'shears', seed: 22 }),
        pip: folk({ h: 15, hair: '#3a2418', top: '#e8c03a', low: '#3a5a8a', mop: true, sit: true, seed: 23 }),
        catSit: cat('sit'), catRun: cat('run'), catCurl: cat('curl'),
      };
      sprites.dunmoreL = Tycho.sprite.flipSprite(sprites.dunmore);
      sprites.pellL = Tycho.sprite.flipSprite(sprites.pell);
      sprites.catSitL = Tycho.sprite.flipSprite(sprites.catSit); sprites.catRunL = Tycho.sprite.flipSprite(sprites.catRun);

      // the quest's state: plain JSON, all of it saved
      const st = Object.assign({ scene: 'terrace', x: PELL.x + 22, y: G, face: -1, cat: 0, cat2: 0, hasCat: false, asked: false, caught: false, home: false, falls: 0, greeted: false, roof: false }, saved || {});
      const body = { x: st.x, y: st.y, vx: 0, vy: 0, face: st.face, ground: true, coyote: 0, drop: 0, ladder: null, walked: 0 };
      const runner = new Tycho.move.Platform(NUM);
      const world = ctx.world({ start: 16 * 60 + 30, modules: ['reverie', 'fellowship', 'cityspeak', 'voice'] }, declare);
      // the world's facts agree with the quest's state (a dev jump has no minds saved)
      for (const k of ['asked', 'caught', 'home']) if (st[k] && !world.fact(k)) world.fact(k, true);

      const terraceSpace = new Tycho.collide.Space()
        .boxes([{ x0: -40, y0: G, x1: W + 40, y1: H + 80 }, DORMER, { x0: 280, y0: 100, x1: 400, y1: 118 }])
        .bounds(4, W - 4)
        .ways([{ x0: 40, y0: 118, x1: 280, y1: 118 }, { x0: 436, y0: 118, x1: 580, y1: 118 }, { x0: 400, y0: 126, x1: 436, y1: 127 }])
        .ladders(PIPES);
      const houseSpace = new Tycho.collide.Space()
        .ways(PIECES.map((p) => ({ x0: p.x0, y0: p.y, x1: p.x1, y1: p.y1 === undefined ? p.y : p.y1 })))
        .ladders([STEPLADDER]);
      const space = () => (st.scene === 'terrace' ? terraceSpace : houseSpace);
      const cam = { x: 0, y: 0 };
      // Biscuit: where he is, and where he's going (a hop between two spots)
      const kit = { x: 0, y: 0, from: null, to: null, t: 0, dur: 0, face: 1 };
      const placeCat = () => {
        const p = st.scene === 'terrace' ? CAT_T[Math.min(st.cat, 3)] : CAT_N[Math.min(st.cat2, 3)];
        kit.x = p.x; kit.y = p.y; kit.from = kit.to = null;
      };
      const hop = (to) => { kit.from = { x: kit.x, y: kit.y }; kit.to = to; kit.t = 0; kit.dur = 0.25 + Math.hypot(to.x - kit.x, to.y - kit.y) / 120; kit.face = to.x >= kit.x ? 1 : -1; ctx.snd.cue('pell.meow'); };
      let peak = body.y, wasGround = true;
      const sizes = () => (st.scene === 'terrace' ? [W, H] : [W2, H2]);
      const snapCam = () => {
        const [ww, hh] = sizes();
        cam.x = clamp(body.x - View.w / 2, 0, Math.max(0, ww - View.w)); cam.y = clamp(body.y - View.h * 0.62, 0, Math.max(0, hh - View.h));
      };
      placeCat(); snapCam();
      if (st.scene === 'house') ctx.snd.play(SCORE_HOUSE);

      const near = (x, d = 14) => Math.abs(body.x - x) < d;
      const onStreet = () => st.scene === 'terrace' && body.y >= G - 1 && !body.ladder;
      const talk = (who) => {
        const w = WORDS[who];
        ctx.talk(who, { name: w.name, words: w.words, bye: w.bye, noDrop: true, onEnd: () => sync() });
      };
      // after a talk: what it changed
      const sync = () => {
        if (!st.asked && world.fact('asked')) { st.asked = true; ctx.save(); }
        if (!st.home && world.fact('home')) {
          st.home = true; ctx.tick(3);
          ctx.note('The Spire. I should really get back to that.');
          ctx.save();
        }
      };
      // a fall from the roofs (or out of number nine): the roses
      const detour = (fromHouse) => {
        const lines = fromHouse ? ["You fall for a long time, through somebody's attic and somebody else's sky.", 'You land in the roses.', { who: 'Mr. Dunmore', text: 'And where did you come from?' }] : DUNMORE_LINES[Math.min(st.falls, DUNMORE_LINES.length - 1)];
        st.falls++;
        ctx.snd.cue('pell.thump');
        ctx.fade(() => {
          if (st.scene !== 'terrace') { st.scene = 'terrace'; ctx.snd.play(SCORE_STREET); placeCat(); }
          Object.assign(body, { x: GARDEN.x, y: G, vx: 0, vy: 0, ground: true, ladder: null }); peak = G; wasGround = true; snapCam();
          ctx.lines(lines, () => {}, { done: 'Get up' });
        });
      };
      const enterHouse = () => {
        ctx.fade(() => {
          st.scene = 'house'; st.cat2 = Math.min(st.cat2, 3);
          Object.assign(body, { x: 60, y: 40, vx: 0, vy: 0, ground: false, ladder: null }); peak = 40;
          placeCat(); snapCam(); ctx.snd.play(SCORE_HOUSE);
          ctx.lines(['The skylight lets you down into a room. Then out of the room, and into the next one, which has no floor either.', "Somewhere ahead, in the dark, there's a ginger tail."], () => {});
        });
      };
      const catchCat = () => {
        st.hasCat = true; st.caught = true; ctx.tick(2); ctx.snd.cue('pell.meow');
        world.fact('caught', true);
        ctx.lines(['Biscuit lets himself be picked up, as if it had been his idea.'], () => {});
      };
      const leaveHouse = () => {
        ctx.fade(() => {
          st.scene = 'terrace'; st.cat = 4;
          Object.assign(body, { x: DOOR9.x, y: G, vx: 0, vy: 0, face: -1, ground: true, ladder: null }); peak = G; wasGround = true;
          snapCam(); ctx.snd.play(SCORE_STREET);
          ctx.lines(["The front door of number nine opens onto the street, as if it were an ordinary house. It's still afternoon."], () => {});
        });
      };
      // Use: whoever or whatever is nearest
      const useTarget = () => {
        if (st.scene === 'terrace') {
          if (onStreet()) {
            if (st.home && near(DOOR3.x, 9)) return { label: 'The cellar', go: () => ctx.done('cellar') };
            if (near(st.home ? PELL_ASIDE.x : PELL.x)) return { label: 'Mrs. Pell', go: () => talk('pell') };
            if (near(DUNMORE.x)) return { label: 'Mr. Dunmore', go: () => talk('dunmore') };
            if (near(PIP.x)) return { label: 'Pip', go: () => talk('pip') };
          }
          if (st.cat >= 4 && !st.hasCat && Math.abs(body.y - 118) < 3 && near(SKY.x, 10)) return { label: 'Down through the skylight', go: enterHouse };
        } else {
          if (!st.hasCat && st.cat2 >= 3 && !kit.to && Math.hypot(body.x - kit.x, body.y - kit.y) < 22) return { label: 'Biscuit', go: catchCat };
          if (Math.abs(body.y - FRONT.y) < 3 && near(FRONT.x, 11)) return { label: 'The front door', go: () => (st.hasCat ? leaveHouse() : ctx.toast('Not without Biscuit.')) };
        }
        return null;
      };

      // the cat runs on when you come near
      const catStep = (dt) => {
        if (kit.to) {
          kit.t += dt;
          const k = Math.min(1, kit.t / kit.dur), arc = Math.sin(k * Math.PI) * (10 + Math.abs(kit.to.x - kit.from.x) * 0.06);
          kit.x = kit.from.x + (kit.to.x - kit.from.x) * k; kit.y = kit.from.y + (kit.to.y - kit.from.y) * k - arc;
          if (k >= 1) { kit.x = kit.to.x; kit.y = kit.to.y; kit.to = null; }
          return;
        }
        if (st.hasCat) return;
        const dx = Math.abs(body.x - kit.x), dy = Math.abs(body.y - kit.y);
        if (st.scene === 'terrace') {
          if (!st.asked || st.cat >= 4) return;
          if (body.y < 130 && dx < (st.cat === 3 ? 34 : 46) && dy < 30) {
            if (st.cat === 3) { st.cat = 4; hop({ x: SKY.x, y: 104 }); ctx.tick(1); ctx.toast('Biscuit drops through the skylight.'); ctx.save(); }
            else { st.cat++; hop(CAT_T[st.cat]); }
          }
        } else if (st.cat2 < 3 && dx < 48 && dy < 40) { st.cat2++; hop(CAT_N[st.cat2]); }
      };

      const drawCat = (g, cx, cy) => {
        const left = kit.face < 0, s = kit.to ? (left ? sprites.catRunL : sprites.catRun) : left ? sprites.catSitL : sprites.catSit;
        Figure.draw(g, s, kit.x - cx, kit.y - cy);
      };
      const drawPlayer = (g, cx, cy) => {
        const b = body, left = b.face < 0;
        const pose = b.ladder ? (Math.floor(b.walked / 6) & 1 ? 'climb1' : 'climb0') : !b.ground ? (b.vy < 0 ? 'jump' : 'fall') : Math.abs(b.vx) > 6 ? 'walk' + (Math.floor(b.walked / 5) & 3) : 'stand';
        const lamp = Figure.player(g, STYLE, pose, b.x - cx, b.y - cy, left);
        if (st.hasCat) Figure.draw(g, sprites.catCurl, b.x - cx + (left ? 3 : -3), b.y - cy - 13);
        return lamp;
      };

      return {
        step(dt) {
          world.tick(dt);
          // the ask, as you arrive on her doorstep
          if (!st.greeted) { st.greeted = true; if (!st.asked) { talk('pell'); return; } }
          const m = ctx.pad.move, jumpHit = ctx.pad.take('a');
          const wasLadder = !!body.ladder;
          if (jumpHit && (body.ground || body.coyote > 0 || body.ladder)) ctx.snd.cue('pell.hop');
          runner.step(space(), body, { ax: m.x, ay: m.y, jump: ctx.pad.held('a'), jumpHit }, dt);
          // falls: the highest point since leaving the ground or a ladder
          if (body.ground || body.ladder) {
            if (!wasGround && body.ground && !wasLadder) {
              ctx.snd.cue('pell.land');
              if (st.scene === 'terrace' && body.y >= G - 1 && G - peak > 64) { detour(false); return; }
            }
            peak = body.y;
          } else peak = Math.min(peak, body.y);
          wasGround = body.ground || !!body.ladder;
          if (st.scene === 'house' && body.y > H2 + 30) { wasGround = true; detour(true); return; }
          if (st.scene === 'terrace' && !st.roof && body.ground && body.y < 125) { st.roof = true; ctx.tick(0); }
          catStep(dt);
          const u = useTarget();
          ctx.prompt(u ? 'Use · ' + u.label : null);
          if (ctx.pad.take('b') && u) { ctx.prompt(null); u.go(); }
          // the camera follows, a little ahead of where you're going
          const [ww, hh] = sizes();
          const tx = clamp(body.x + body.face * 20 - View.w / 2, 0, Math.max(0, ww - View.w)), ty = clamp(body.y - View.h * 0.62, 0, Math.max(0, hh - View.h));
          cam.x += (tx - cam.x) * Math.min(1, dt * 5); cam.y += (ty - cam.y) * Math.min(1, dt * 4);
          st.x = body.x; st.y = body.y; st.face = body.face;
        },
        idle(dt) { world.tick(dt); catStep(dt); },
        draw(g) {
          const t = Shell.t, cx = Math.round(cam.x), cy = Math.round(cam.y);
          let lamp;
          if (st.scene === 'terrace') {
            g.drawImage(pics.sky, 0, 0, 1, H, 0, -Math.round(cy * 0.3), View.w, H);
            Figure.halo(g, View.w * 0.12 - cx * 0.04, 150 - cy * 0.3, 90, 'rgba(255,190,120,', 0.5);
            const drift = Math.round(cx * 0.12 + t * 1.5) % 960;
            g.drawImage(pics.clouds, -drift, -Math.round(cy * 0.25)); g.drawImage(pics.clouds, 960 - drift, -Math.round(cy * 0.25));
            g.drawImage(pics.far, -Math.round(cx * 0.45), Math.round(26 - cy * 0.7));
            g.drawImage(pics.terrace, -cx, -cy);
            // the people on the street
            const pellX = st.home ? PELL_ASIDE.x : PELL.x;
            Figure.draw(g, body.x >= pellX ? sprites.pell : sprites.pellL, pellX - cx, G - cy);
            Figure.draw(g, body.x >= DUNMORE.x ? sprites.dunmore : sprites.dunmoreL, DUNMORE.x - cx, G - cy);
            Figure.draw(g, sprites.pip, PIP.x - cx, G - 3 - cy);
            if (st.home) { g.fillStyle = '#100c0c'; g.fillRect(DOOR3.x - 7 - cx, G - 31 - cy, 14, 27); }
            if ((!st.hasCat && st.cat < 4) || kit.to) drawCat(g, cx, cy);
            lamp = drawPlayer(g, cx, cy);
            // the low sun: everything warmer, a wash of light from the left
            g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(255,232,205)'; g.fillRect(0, 0, View.w, View.h);
            const gr = g.createLinearGradient(0, 0, View.w, 0);
            gr.addColorStop(0, 'rgba(255,170,90,0.16)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
            g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(0, 0, View.w, View.h);
            g.globalCompositeOperation = 'source-over';
            Figure.halo(g, lamp[0], lamp[1], 14, 'rgba(255,210,130,', 0.25);
          } else {
            const vx = Math.round(cx * 0.5) % W2;
            g.drawImage(pics.void, -vx, -Math.round(cy * 0.5)); g.drawImage(pics.void, W2 - vx, -Math.round(cy * 0.5));
            // the skylight's beam, far above
            const beam = g.createLinearGradient(0, -cy, 0, 120 - cy);
            beam.addColorStop(0, 'rgba(200,220,255,0.25)'); beam.addColorStop(1, 'rgba(200,220,255,0)');
            g.globalCompositeOperation = 'lighter'; g.fillStyle = beam; g.fillRect(48 - cx, -cy, 26, 120); g.globalCompositeOperation = 'source-over';
            g.drawImage(pics.pieces.c, -cx, -cy);
            if (pics.pieces.e) { g.globalCompositeOperation = 'lighter'; g.drawImage(pics.pieces.e, -cx, -cy); g.globalCompositeOperation = 'source-over'; }
            for (const [x, y] of LAMPS) Figure.halo(g, x - cx, y - cy, 46, 'rgba(255,200,120,', 0.32);
            Figure.halo(g, FRONT.x - cx, FRONT.y - 20 - cy, 34, 'rgba(255,190,110,', 0.25);
            if (!st.hasCat) drawCat(g, cx, cy);
            lamp = drawPlayer(g, cx, cy);
            Figure.halo(g, lamp[0], lamp[1], 60, 'rgba(255,200,110,', 0.42);
            // dust, turning in the lamplight
            g.fillStyle = 'rgba(220,200,255,0.5)';
            for (let i = 0; i < 26; i++) { const x = (hash(i, 1, 4) * W2 + t * (3 + (i % 5))) % W2, y = (hash(i, 2, 4) * H2 + Math.sin(t * 0.7 + i) * 6 + H2) % H2; g.fillRect(Math.round(x - cx * 0.8), Math.round(y - cy * 0.8), 1, 1); }
          }
        },
        save() { return Object.assign({}, st, { x: Math.round(body.x * 10) / 10, y: Math.round(body.y * 10) / 10, face: body.face }); },
        end() { ctx.prompt(null); },
        where() { return { scene: st.scene, x: Math.round(body.x), y: Math.round(body.y), ground: body.ground, ladder: !!body.ladder, cat: st.cat, cat2: st.cat2, hasCat: st.hasCat, asked: st.asked, home: st.home, falls: st.falls }; },
        // the tests' player: up the drainpipe, over the roofs, through the
        // skylight, across the floating rooms, out the front door, home
        bot() {
          const b = body, x = b.x, y = b.y;
          const toward = (tx, tol = 3) => (Math.abs(tx - x) <= tol ? { x: 0 } : { x: Math.sign(tx - x) * (Math.abs(tx - x) < 14 ? 0.5 : 1) });
          const use = (tx, tol = 4) => (Math.abs(tx - x) <= tol && b.ground ? { bHit: true } : toward(tx, tol - 1));
          if (b.ladder) return { y: -1 };
          if (!b.ground) return { x: st.scene === 'house' && st.hasCat ? 0 : 1, a: true };
          if (st.scene === 'terrace') {
            if (!st.asked) return use(PELL.x, 6);
            if (st.hasCat) return st.home ? use(DOOR3.x, 3) : use(PELL.x, 6);
            if (y >= G - 1) return Math.abs(x - PIPES[0].x) > 1.5 ? toward(PIPES[0].x, 1) : { y: -1 };
            if (Math.abs(y - DORMER.y0) < 2 && x < 280) return { x: 1 };
            if (Math.abs(y - 118) < 2 && x < 280) return (x > 186 && x < 208) || x > 258 ? { x: 1, a: true, aHit: true } : { x: 1 };
            if (Math.abs(y - 100) < 2 && x < 404) return x > 388 ? { x: 1, a: true, aHit: true } : { x: 1 };
            if (x >= 432) return st.cat >= 4 && !kit.to ? use(SKY.x, 3) : toward(SKY.x + 2, 1);
            return { x: 1 };
          }
          // the house with no floor
          if (st.hasCat) return Math.abs(y - FRONT.y) < 3 ? use(FRONT.x, 4) : { x: x < 450 ? 1 : -1 };
          if (Math.abs(y - FRONT.y) < 3) return Math.abs(x - STEPLADDER.x) > 1.5 ? toward(STEPLADDER.x, 1) : { y: -1 };
          const p = PIECES.find((pc) => pc.id !== 'hall' && x >= pc.x0 - 2 && x <= pc.x1 + 2);
          if (p && p.id === 'table') return st.cat2 >= 3 && !kit.to ? use(kit.x, 6) : toward(kit.x, 4);
          if (p && x > p.x1 - 6) return { x: 1, a: true, aHit: true };
          return { x: 1 };
        },
      };
    },
  });
  Elsewhere.handoff('pell', 'cellar', 'frogs');
})();
