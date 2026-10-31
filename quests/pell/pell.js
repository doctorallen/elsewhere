'use strict';
// ---------------------------------------------------------------------------
// Mrs. Pell's cat: the first distraction. A brick terrace on the isometric
// grid, late on a warm afternoon, the street running on past both ends of the
// frame. Biscuit is on the roof and won't come
// down; you go up the drainpipe and after him over the gutters, a dormer, a
// taller roof and an alley, until he drops through the skylight of number
// nine, which has no floor: just its rooms, hanging in the dark. Catch him
// there, come out of its front door onto the street, and take him home. Mrs.
// Pell gives you his saucer, and sends you out through her cellar.
//
// The play is climbing: the platform runner with gutters and ledges to stand
// on, drainpipes to climb, a stick and Jump. Falling is a detour, never a
// death (the runner's plane is laid along the front of the houses, so the
// rules are still side-on): from the roofs you land in Mr. Dunmore's roses, and he has something
// to say about it each time. The people are Tyrell people talking through
// Voice: Mrs. Pell, Mr. Dunmore next door, and Pip, who knows where the cat
// goes. Everything painted is drawn from the seed.
// ---------------------------------------------------------------------------
(() => {
  const { hash } = Tycho.seed;
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

  const DUNMORE_LINES = [
    ['You land in a rosebush.', { who: 'Mr. Dunmore', text: "That's my Ena Harkness you're lying in." }],
    ['You land in the roses again.', { who: 'Mr. Dunmore', text: 'Twice. Twice in one afternoon. Is it catching?' }],
    ['The roses, again.', { who: 'Mr. Dunmore', text: "I'm going to start charging." }],
    ['The roses.', { who: 'Mr. Dunmore', text: "I've stopped looking up, you know. I just hear the gutter go." }],
  ];

  // ---- the view: the terrace on the 2:1 grid ------------------------------
  // The rules are the runner's own, side-on: x along the street, y up and down.
  // The picture lays that plane along the front of the houses, so a drainpipe
  // goes up a real wall and a gutter runs along real eaves. In the house with
  // no floor the same plane runs through the middle of each hanging piece.
  const K = 0.75, FRONT_Y = 2;
  const at = (x, y, z = 0) => [(x - y) * K, (x + y) * K / 2 - z];
  const HIGH = (wy) => 206 - wy;
  const onTerrace = (x, y) => at(x, FRONT_Y, G - y), inHouse = (x, y) => at(x, 0, HIGH(y));
  const GX = -300, GY = -340, GW = 1100, GH = 780;
  const VX = -70, VY = -200, VW = 560, VH = 460;

  // ---- the eight inks: a warm afternoon, and the dark inside number nine ----
  const D = 0, M = 1, O = 2, L = 3, S = 4, Y = 5, N = 6, B = 7;
  const SUN = ['#3a1620', '#b0442c', '#f0a050', '#fff0c8', '#4a5478', '#f8c850', '#3f7a52', '#3a62b8'];
  const DARK = ['#08060e', '#2a2440', '#f0a050', '#fff0c8', '#4a5478', '#f8c850', '#7a4c3a', '#3a62b8'];
  const LOOK = { k: D, h: O, H: M, s: L, c: B, C: S, r: M, l: S, g: Y, G: L };

  const CAT = ['.k...k...............kk.', 'kok.kok.............kook', 'koooook..............kok', 'kokookok.............kok', 'koooLook...........kook.', '.koooookkkkkkkkkkkkook..', '.kooOooOooOooOoooooook..', '..koOooOooOooOoooooook..', '..kooooooooooooooooook..', '..kLLoooooooooooooook...', '..kok.kok.....kok.kok...', '..kok.kok.....kok.kok...', '..kk..kk......kk..kk....'];
  const CURL = ['..k...k.....', '.kokkkokkkk.', '.koooooooook', 'kokookoOooOk', 'koooooooooOk', '.koLLooooook', '..kkkkkkkkk.'];
  const PELL_ROWS = ['....kkkk....', '...kSSSSk...', '..kSSSSSSk..', '..kSLLLLSk..', '...kLkLLk...', '...kLLLLk...', '....kkkk....', '...kCCCCk...', '..kCCCCCCk..', '.kCCCCCCCCk.', '.kCkLLLLkCk.', '.kCkLLLLkCk.', '..kkLLLLkk..', '...kLLLLk...', '..kCLLLLCk..', '..kCCCCCCk..', '.kCCCCCCCCk.', '.kkkkkkkkkk.', '...kk..kk...'];
  const DUNMORE_ROWS = ['....kkkk....', '...kSSSSk...', '..kkkkkkkkk.', '...kLLLLk...', '...kLkLLk...', '...kLLLLk...', '....kkkk....', '...kCCCCk...', '..kCCCCCCk..', '.kCCCCCCCCk.', '.kCkCCCCkCk.', '.kCkCCCCkCk.', '.kLkCCCCkLk.', '..kkCCCCkk..', '...kSSSSk...', '...kSSSSk...', '...kS..Sk...', '...kS..Sk...', '...kS..Sk...', '...kk..kk...', '...kkk.kkk..'];
  const PIP_ROWS = ['...kkkk...', '..kMMMMk..', '.kMMMMMMk.', '.kLLLLLLk.', '..kLkkLk..', '..kLLLLk..', '...kkkk...', '..kYYYYk..', '.kYYYYYYk.', '.kYYYYYYk.', '..kkkkkk..', '..kBk.kBk.', '..kBk.kBk.', '..kk..kk..'];

  // a row of houses: walls, a pitched roof, its slates in a few bold lines
  function house(S2, I, x0, x1, y, d, h, wall, side, roof = 34) {
    I.box(x0, y, 0, x1 - x0, d, h, [wall, wall, side]);
    S2.opoly([at(x1, y, h), at(x1, y + d, h), at(x1, y + d / 2, h + roof)], side);
    S2.opoly([at(x0, y + d, h), at(x1, y + d, h), at(x1, y + d / 2, h + roof), at(x0, y + d / 2, h + roof)], S);
    for (const k of [0.33, 0.66]) I.line(x0, y + d - d / 2 * k, h + roof * k, x1, y + d - d / 2 * k, h + roof * k, D);
  }
  function fronts(S2, I, x0, x1, h, doorX, doorCol, wall, id) {
    const R2 = new Tycho.seed.Rng(id), mark = wall === O ? M : D, pane = (x, z, w = 15, ht = 18) => { I.left(x, 0, z, w, ht, Y); I.line(x + w / 2, 0, z, x + w / 2, 0, z + ht, D); I.line(x, 0, z + ht / 2, x + w, 0, z + ht / 2, D); I.line(x - 2, 0, z - 2, x + w + 2, 0, z - 2, L); };
    for (let i = 0; i < (x1 - x0) / 16; i++) { const x = R2.f(x0 + 4, x1 - 20), z = R2.f(6, h - 12); I.line(x, 0, z, x + 12, 0, z, mark); I.line(x + 6, 0, z + 6, x + 18, 0, z + 6, mark); }
    const w = x1 - x0;
    for (const k of [0.2, 0.68]) pane(x0 + w * k, h - 42);
    pane(x0 + w * (doorX > x0 + w / 2 ? 0.14 : 0.66), 16, 22, 20);
    I.left(doorX - 9, 0, 0, 18, 39, L); I.left(doorX - 7, 0, 0, 14, 31, doorCol); I.left(doorX - 7, 0, 32, 14, 5, Y); I.line(doorX + 4, 0, 16, doorX + 5, 0, 16, Y);
  }
  function paintTerrace() {
    const S2 = new Ink.Sheet(GW, GH); S2.ox = GX; S2.oy = GY; S2.rect(GX, GY, GW, GH, N);
    const I = new Ink.Iso(S2, at), R2 = new Tycho.seed.Rng(11);
    for (let i = 0; i < 220; i++) S2.tuft(R2.f(GX, GX + GW), R2.f(GY, GY + GH), M);
    // the next street's backs, and the fences of the gardens between
    for (let x = -260; x < 980; x += 66) house(S2, I, x, x + 66, -300, 34, 40, (x & 2) ? O : M, D, 26);
    for (let x = -280; x < 980; x += 40) I.line(x, -150, 0, x + 40, -150, 0, D);
    // the road, the near pavement and a low wall, running off both ends
    I.top(-600, 0, 1800, 10, 0, L); for (let x = -600; x < 1200; x += 44) I.line(x, 0, 0, x, 10, 0, O);
    I.top(-600, 10, 1800, 38, 0, S); for (let i = 0; i < 40; i++) { const [x, y] = at(R2.f(-300, 900), R2.f(14, 44)); S2.rect(x, y, 4, 1, B); }
    I.top(-600, 48, 1800, 8, 0, L); I.box(-600, 56, 0, 1800, 3, 5, [L, O, M]);
    // the terrace: the neighbors at each end, then three, five, seven, the alley, nine
    const row = [[-200, -120, 104, O, 11, N, -160], [-120, -40, 104, M, 12, B, -80], [-40, 40, 104, O, 13, Y, 0]];
    for (const [x0, x1, h, c, id, dc, dx] of row) { house(S2, I, x0, x1, -34, 34, h, c, c === O ? M : D); fronts(S2, I, x0, x1, h, dx, dc, c, id); }
    I.box(146, -22, 118, 16, 12, 24, [L, M, D]);
    house(S2, I, 40, 160, -34, 34, 104, M, D); fronts(S2, I, 40, 160, 104, DOOR3.x, N, M, 3);
    house(S2, I, 160, 280, -34, 34, 104, M, D); fronts(S2, I, 160, 280, 104, 200, D, M, 5);
    I.box(268, -22, 118, 16, 12, 24, [L, M, D]);
    house(S2, I, 280, 400, -34, 34, 122, O, M); fronts(S2, I, 280, 400, 122, 352, Y, O, 7);
    I.top(400, -34, 36, 34, 0, D); I.left(408, -30, 0, 20, 30, M); I.line(418, -30, 0, 418, -30, 30, D);
    house(S2, I, 436, 580, -34, 34, 104, M, D); fronts(S2, I, 436, 580, 104, DOOR9.x, B, M, 9);
    I.box(560, -22, 118, 16, 12, 24, [L, M, D]);
    for (const [x0, x1, c, id, dc, dx] of [[580, 700, O, 14, Y, 640], [700, 820, M, 15, N, 760], [820, 940, O, 16, B, 880]]) { house(S2, I, x0, x1, -34, 34, 104, c, c === O ? M : D); fronts(S2, I, x0, x1, 104, dx, dc, c, id); }
    // the dormer on five, and the skylight in nine's slates, its lid propped open
    I.box(208, -14, 104, 22, 14, 16, [S, L, D]); I.left(212, 0, 106, 14, 11, Y); I.line(219, 0, 106, 219, 0, 117, D);
    const slope = (x, t) => at(x, -t * 17, 104 + t * 34);
    S2.opoly([slope(SKY.x - 11, 0.2), slope(SKY.x + 11, 0.2), slope(SKY.x + 11, 0.62), slope(SKY.x - 11, 0.62)], D);
    S2.opoly([slope(SKY.x - 11, 0.62), slope(SKY.x + 11, 0.62), at(SKY.x + 11, -9, 136), at(SKY.x - 11, -9, 136)], L);
    // gutters, the drainpipes, the washing, Mr. Dunmore's roses, the post box
    for (const h of HOUSES) { const z = G - h.gut, [a, b] = at(h.x0, FRONT_Y - 1, z), [c, e] = at(h.x1, FRONT_Y - 1, z); S2.line(a, b, c, e, D); S2.line(a, b + 1, c, e + 1, D); }
    for (const p of PIPES) { const [x, y] = at(p.x, 1, 0), t = G - p.y0; S2.orect(x - 1, y - t, 4, t, S); for (let z = 16; z < t; z += 26) S2.rect(x - 2, y - z, 6, 2, D); }
    I.line(400, 2, 96, 436, 2, 96, L);
    [[403, L, 8, 12], [413, M, 6, 9], [421, B, 7, 11], [430, Y, 5, 8]].forEach(([x, c, w, h]) => I.left(x, 2, 96 - h, w, h, c));
    S2.opoly([at(208, 3, 0), at(244, 3, 0), at(244, 3, 10), at(208, 3, 10)], N); I.top(208, 3, 36, 7, 10, N);
    for (let i = 0; i < 12; i++) { const [x, y] = at(R2.f(210, 242), R2.f(3, 9), 10); S2.rect(x, y, 3, 3, M); S2.px(x + 1, y + 1, L); }
    I.box(22, 3, 0, 7, 7, 17, [M, M, D]); I.line(22, 10, 13, 29, 10, 13, D);
    // the far side of the wall
    for (let x = -240; x < 980; x += 72) { const [ix, iy] = at(x, 110 + (x & 15)); S2.rect(ix - 1, iy - 6, 3, 7, D); S2.opoly([[ix - 11, iy - 5], [ix, iy - 20], [ix + 11, iy - 5]], O); S2.opoly([[ix - 8, iy - 14], [ix, iy - 28], [ix + 8, iy - 14]], O); }
    return S2;
  }
  // the house with no floor: each piece a block hanging in the dark, the one
  // place in the game that's meant to look like it's floating
  function paintPieces() {
    const S2 = new Ink.Sheet(VW, VH); S2.ox = VX; S2.oy = VY;
    const I = new Ink.Iso(S2, at), Z = HIGH;
    for (const [x, y] of LAMPS) { const [ix, iy] = at(x, -10, Z(y) + 34); S2.rect(ix, iy - 70, 1, 66, M); S2.orect(ix - 3, iy - 6, 7, 8, Y); }
    I.box(40, -22, Z(90) - 58, 40, 30, 58, [O, N, D]); I.line(60, 8, Z(90) - 58, 60, 8, Z(90), D); I.left(44, 8, Z(90) - 50, 12, 40, S);
    I.box(96, -22, Z(130) - 20, 64, 44, 20, [L, N, D]); I.box(96, -20, Z(130), 14, 40, 4, [L, S, D]); I.box(118, -22, Z(130), 42, 44, 3, [B, S, D]);
    const n = 6; for (let i = 0; i < n; i++) { const x = 180 + i * 10, z = Z(150) + i * (40 / n); I.box(x, -16, z - 10, 10, 32, 10, [S, N, D]); }
    I.box(262, -24, Z(122) - 3, 70, 48, 3, [M, N, D]); I.box(272, -22, Z(122), 22, 16, 18, [B, S, D]); I.box(272, -22, Z(122) + 18, 22, 5, 12, [B, S, D]); I.box(314, -20, Z(122), 8, 8, 30, [O, N, D]);
    I.box(372, -22, Z(140) - 26, 68, 30, 26, [O, N, D]); for (const x of [395, 417]) I.line(x, 8, Z(140) - 26, x, 8, Z(140), D);
    I.box(380, -30, -6, 144, 60, 6, [S, N, D]);
    I.left(412, -30, 0, 20, 40, L); I.left(415, -30, 0, 14, 36, O);
    for (const [x, y] of [[462, -14], [506, -14], [462, 14], [506, 14]]) I.box(x, y, Z(118) - 22, 3, 3, 18, [O, N, D]);
    I.box(458, -20, Z(118) - 4, 54, 40, 4, [O, N, D]); I.box(486, -8, Z(118), 16, 14, 7, [Y, O, D]);
    const [lx, ly] = at(STEPLADDER.x, 0, 0), top = HIGH(STEPLADDER.y0);
    S2.rect(lx - 4, ly - top, 1, top, L); S2.rect(lx + 4, ly - top, 1, top, L); for (let z = 6; z < top; z += 10) S2.rect(lx - 4, ly - z, 9, 1, L);
    return S2;
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
    view: 'iso', hold: 'landscape', px: 180,
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
      // the pictures, painted once, and the cast in each palette
      const cast = (pal) => ({
        you: Ink.traveler(pal, LOOK),
        cat: Ink.sprite(CAT, { k: D, o: O, O: M, L }, pal, 12, 12), catL: Ink.sprite(CAT, { k: D, o: O, O: M, L }, pal, 12, 12, true),
        curl: Ink.sprite(CURL, { k: D, o: O, O: M, L }, pal, 6, 6),
      });
      const people = { k: D, S, L, C: N }, art = {
        sun: Object.assign(cast(SUN), {
          terrace: paintTerrace().print(SUN),
          pell: Ink.sprite(PELL_ROWS, people, SUN, 6, 18), pellL: Ink.sprite(PELL_ROWS, people, SUN, 6, 18, true),
          dunmore: Ink.sprite(DUNMORE_ROWS, { k: D, S, L, C: M }, SUN, 6, 20), dunmoreL: Ink.sprite(DUNMORE_ROWS, { k: D, S, L, C: M }, SUN, 6, 20, true),
          pip: Ink.sprite(PIP_ROWS, { k: D, M, L, Y, B }, SUN, 5, 13),
        }),
        dark: Object.assign(cast(DARK), { pieces: paintPieces().print(DARK) }),
      };

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
      const cam = { x: null, y: null };
      // Biscuit: where he is, and where he's going (a hop between two spots)
      const kit = { x: 0, y: 0, from: null, to: null, t: 0, dur: 0, face: 1 };
      const placeCat = () => {
        const p = st.scene === 'terrace' ? CAT_T[Math.min(st.cat, 3)] : CAT_N[Math.min(st.cat2, 3)];
        kit.x = p.x; kit.y = p.y; kit.from = kit.to = null;
      };
      const hop = (to) => { kit.from = { x: kit.x, y: kit.y }; kit.to = to; kit.t = 0; kit.dur = 0.25 + Math.hypot(to.x - kit.x, to.y - kit.y) / 120; kit.face = to.x >= kit.x ? 1 : -1; ctx.snd.cue('pell.meow'); };
      let peak = body.y, wasGround = true;
      const snapCam = () => {
        cam.x = cam.y = null;
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
          st.x = body.x; st.y = body.y; st.face = body.face;
        },
        idle(dt) { world.tick(dt); catStep(dt); },
        draw(g) {
          const t = Shell.t, vw = View.w, vh = View.h, terrace = st.scene === 'terrace', A = terrace ? art.sun : art.dark, pt = terrace ? onTerrace : inHouse;
          // the camera goes with you, a little ahead of where you're going
          const [fx, fy] = pt(body.x, body.y), tx = fx + body.face * 16 - vw / 2, ty = fy - vh * 0.6;
          if (cam.x === null || Math.abs(cam.x - tx) > 200 || Math.abs(cam.y - ty) > 200) { cam.x = tx; cam.y = ty; }
          cam.x += (tx - cam.x) * 0.1; cam.y += (ty - cam.y) * 0.1;
          const cx = Math.round(cam.x), cy = Math.round(cam.y);
          const put = (s, x, y, lift = 0) => { const [ix, iy] = pt(x, y); Figure.draw(g, s, Math.round(ix) - cx, Math.round(iy) - cy - lift); };
          const drawCat = () => put(kit.face < 0 ? A.catL : A.cat, kit.x, kit.y);
          const drawPlayer = () => {
            const b = body, side = b.face < 0 ? 'l' : 'r', stride = Math.floor(b.walked / 8) & 1;
            const P = b.ladder ? (stride ? A.you.awayWalk : A.you.away).r : (!b.ground || (Math.abs(b.vx) > 6 && stride) ? A.you.walk : A.you.stand)[side];
            put(P, b.x, b.y);
            if (!b.ladder) { const [ix, iy] = pt(b.x, b.y); Figure.draw(g, A.you.lantern, Math.round(ix) - cx + 7 * b.face, Math.round(iy) - cy - 11); }
            if (st.hasCat) put(A.curl, b.x + (b.face < 0 ? 3 : -3), b.y, 13);
          };
          if (terrace) {
            g.fillStyle = SUN[N]; g.fillRect(0, 0, vw, vh);
            g.drawImage(A.terrace, GX - cx, GY - cy);
            // the people on the street
            const pellX = st.home ? PELL_ASIDE.x : PELL.x;
            put(body.x >= pellX ? A.pell : A.pellL, pellX, G); put(body.x >= DUNMORE.x ? A.dunmore : A.dunmoreL, DUNMORE.x, G); put(A.pip, PIP.x, G - 3);
            // Mrs. Pell's door, open once he's home
            if (st.home) { g.fillStyle = SUN[D]; for (let i = 0; i < 10; i++) { const [ix, iy] = at(DOOR3.x - 5 + i * 1.33, 0, 28); g.fillRect(Math.round(ix) - cx, Math.round(iy) - cy, 1, 28); } }
            if ((!st.hasCat && st.cat < 4) || kit.to) drawCat();
            drawPlayer();
          } else {
            g.fillStyle = DARK[D]; g.fillRect(0, 0, vw, vh);
            // dust, turning in the lamplight
            g.fillStyle = DARK[M];
            for (let i = 0; i < 40; i++) { const x = (hash(i, 1, 4) * 700 + t * (3 + (i % 5)) - cx * 0.6) % vw, y = (hash(i, 2, 4) * 300 + Math.sin(t * 0.7 + i) * 6 - cy * 0.6) % vh; g.fillRect(Math.round((x + vw) % vw), Math.round((y + vh) % vh), 2, 2); }
            g.drawImage(A.pieces, VX - cx, VY - cy);
            if (!st.hasCat) drawCat();
            drawPlayer();
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
