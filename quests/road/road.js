'use strict';
// ---------------------------------------------------------------------------
// The opening: The Last Lantern, played completely straight. Three scenes.
//   cold   a painted sky with the Hollow in it, seven lights going out on the
//          hills, the narrator's voice, the title, and the player's name
//   aster  one stone room at night: Old Aster dies on a cot by the fire and
//          gives you the Lantern, the map and the mission; the log opens
//   road   the Lantern Road, a screen and a half of it, east toward the
//          Spire, the Hollow at the edges; then a woman on a doorstep
// The Road is on the isometric grid, the land running off past the frame and a
// band of dusk fixed behind it, with the Hollow in it; the walking and jumping
// are the side-on runner's, its plane laid along the grid.
// Nothing here is in on the joke. It ends at Mrs. Pell's doorstep: the
// handoff 'doorstep' starts her quest. The Road is kept as it is, because the
// ending comes back to it (one screen and a half along, her door behind you).
// ---------------------------------------------------------------------------
(() => {
  const { clamp } = Tycho.math;
  const NUM = { w: 8, h: 22, speed: 80, walk: 46, accel: 900, airAccel: 600, friction: 1200, jump: 212, gravity: 700, maxFall: 380, coyote: 0.1, climb: 50 };
  // the world's height, the ground, the scenes' widths
  const H = 200, GROUND = 170, ROAD_W = 600, ROOM_W = 430;
  // where things are
  const ASTER_X = 262, STOOL_X = 308, ROOM_DOOR = 404, PELL_X = 512, PELL_STOP = 470;

  // ---- the view: the Road on the 2:1 grid ---------------------------------
  // The rules are the runner's own, side-on: x along the Road, y up and down.
  // The picture lays that plane along the grid, so x runs off down the Road
  // and height is height; `y` here is only how far across the Road a thing is.
  const K = 0.7;
  const at = (x, y, z = 0) => [(x - y) * K, (x + y) * K / 2 - z];
  // where the land stops and the sky starts, in the view's pixels
  const HORIZON = 62;
  const GX = -280, GY = -190, GW = 960, GH = 560;

  // ---- the eight inks: dusk on the Road, and firelight in Aster's room ----
  const D = 0, M = 1, P = 2, O = 3, L = 4, G = 5, V = 6, B = 7;
  const DUSK = ['#1a1030', '#6a2a6a', '#a83c6a', '#e0683c', '#ffd890', '#3d7a52', '#8fbf6a', '#3f5fa8'];
  const FIRE = ['#0c0a14', '#3a3448', '#a83a32', '#f08030', '#fff0c8', '#6a5e70', '#7a4c2c', '#3f5fa8'];
  const LOOK = { k: D, h: O, H: P, s: L, c: B, C: M, r: P, l: M, g: O, G: L };

  const HOLLOW = [[160, 6], [184, 14], [180, 44], [176, 58], [216, 52], [272, 80], [282, 100], [224, 72], [188, 88], [192, 128], [128, 128], [132, 88], [96, 72], [38, 100], [48, 80], [104, 52], [144, 58], [140, 44], [136, 14]];
  // the dusk in flat bands, each breaking up into the next in rows of fat dots
  function paintDusk(S, h) {
    const w = S.w, dots = (y, n, c, step = 8) => { for (let j = 0; j < n; j += 4) for (let x = (j & 4 ? step / 2 : 0); x < w; x += step) S.rect(x, y + j, 2, 2, c); };
    [[0, D], [0.08, M], [0.26, P], [0.43, O], [0.6, L]].forEach(([k, c]) => S.rect(0, Math.round(h * k), w, h, c));
    dots(Math.round(h * 0.08), 8, D); dots(Math.round(h * 0.22), 6, P); dots(Math.round(h * 0.39), 6, O); dots(Math.round(h * 0.56), 6, L);
  }
  // the cold open, a painted card: the sky, and the Hollow a sheet of its own so it can come on
  function paintColdSky() {
    const S = new Ink.Sheet(560, 200); paintDusk(S, 180);
    [[60, 36, 74], [420, 58, 80], [104, 88, 54]].forEach(([x, y, w]) => { S.rect(x, y, w, 5, L); S.rect(x + 8, y - 3, w - 26, 3, L); S.rect(x + 4, y + 5, w - 8, 1, O); });
    return S;
  }
  function paintHollow() { const S = new Ink.Sheet(320, 150); S.poly(Ink.curve(HOLLOW), D); return S; }
  function paintColdLand() {
    const S = new Ink.Sheet(560, 200), R2 = new Tycho.seed.Rng(8);
    const ridge = Ink.curve([[-10, 136], [90, 122], [190, 130], [290, 124], [390, 132], [470, 122], [570, 134], [570, 160], [-10, 160]], false);
    S.poly([[470, 58], [475, 58], [478, 96], [482, 96], [486, 134], [462, 134], [466, 96], [470, 96]], D);
    S.poly(ridge, M); S.path(ridge.slice(0, 48), D);
    S.rect(0, 148, 560, 52, V); S.rect(0, 148, 560, 1, D); S.rect(0, 149, 560, 2, G);
    for (let i = 0; i < 24; i++) S.tuft(R2.f(0, 556), R2.f(156, 198), G);
    S.orect(-2, 166, 564, 15, L); for (let x = 30; x < 560; x += 72) S.rect(x, 172, 10, 1, O);
    const tree = (x, y) => { S.rect(x - 1, y - 6, 3, 6, D); S.opoly([[x - 11, y - 5], [x, y - 20], [x + 11, y - 5]], G); S.opoly([[x - 8, y - 14], [x, y - 28], [x + 8, y - 14]], G); };
    [[64, 166], [86, 158], [410, 162], [510, 164]].forEach(([x, y]) => tree(x, y));
    return S;
  }
  // the strip of sky over the Road: the dusk, the Hollow small and far, the Spire, the hills
  function paintSkyStrip() {
    const S = new Ink.Sheet(600, HORIZON + 10); S.rect(0, 0, 600, S.h, L); paintDusk(S, HORIZON + 4);
    S.poly(Ink.curve(HOLLOW.map(([x, y]) => [300 + (x - 160) * 0.5, y * 0.5 + 1])), D); S.rect(291, 14, 4, 2, L); S.rect(305, 14, 4, 2, L);
    S.poly([[470, 10], [473, 10], [475, 34], [478, 34], [480, 62], [464, 62], [467, 34], [469, 34]], D);
    const ridge = Ink.curve([[-10, HORIZON - 6], [90, HORIZON - 14], [190, HORIZON - 8], [290, HORIZON - 14], [390, HORIZON - 8], [490, HORIZON - 14], [610, HORIZON - 8], [610, HORIZON + 12], [-10, HORIZON + 12]], false);
    S.poly(ridge, M); S.path(ridge.slice(0, 48), D); S.rect(0, HORIZON, 600, 1, D); S.rect(0, HORIZON + 1, 600, 2, G); S.rect(0, HORIZON + 3, 600, 7, V);
    return S;
  }
  // the land: the beaten Road across it, the stream through it, its stones and the fallen log
  function paintLand() {
    const S = new Ink.Sheet(GW, GH); S.ox = GX; S.oy = GY; S.rect(GX, GY, GW, GH, V);
    const I = new Ink.Iso(S, at), R2 = new Tycho.seed.Rng(6);
    for (let i = 0; i < 180; i++) S.tuft(R2.f(GX, GX + GW), R2.f(GY, GY + GH), G);
    I.top(-400, -12, 1200, 24, 0, L);
    for (let x = -390; x < 800; x += 62) I.line(x, -4, 0, x + 16, -4, 0, O), I.line(x + 26, 5, 0, x + 40, 5, 0, O);
    // the stream: a channel you can fall in, a stone to step on
    I.top(250, -400, 40, 800, -12, B); I.right(250, -400, -12, 800, 12, M);
    for (let y = -390; y < 400; y += 34) I.line(258 + (y & 15), y, -12, 268 + (y & 15), y, -12, M);
    I.box(264, -8, -12, 12, 16, 6, [G, M, D]);
    I.box(120, -7, 0, 18, 14, 11, [G, M, D]); I.box(180, -6, 0, 12, 12, 5, [G, M, D]);
    I.box(360, -8, 0, 32, 16, 12, [O, M, D]); for (const y of [-3, 3]) I.line(360, y, 12, 392, y, 12, D);
    // the milestone, a carved arrow east
    I.box(214, -24, 0, 8, 6, 22, [L, G, M]); I.line(215, -18, 13, 221, -18, 13, D);
    return S;
  }
  // what stands up out of the land (drawn apart, so the sky never cuts it)
  function paintTree() {
    const S = new Ink.Sheet(24, 32), x = 12, y = 31;
    S.rect(x - 1, y - 6, 3, 7, D); S.opoly([[x - 11, y - 5], [x, y - 20], [x + 11, y - 5]], G); S.opoly([[x - 8, y - 14], [x, y - 28], [x + 8, y - 14]], G);
    return S;
  }
  function paintPost() { const S = new Ink.Sheet(8, 18); S.rect(3, 4, 2, 14, D); S.rect(1, 1, 6, 4, D); return S; }
  const COT = { x: 320, y: 30, w: 190, h: 210 };
  function paintCottage() {
    const S = new Ink.Sheet(COT.w, COT.h); S.ox = COT.x; S.oy = COT.y;
    const I = new Ink.Iso(S, at), x = 470, y = -60, w = 122, d = 46, h = 44;
    I.box(x, y, 0, w, d, h, [L, L, O]);
    I.left(500, -14, 0, 18, 32, P); I.left(540, -14, 16, 22, 15, O); I.line(551, -14, 16, 551, -14, 31, D); I.line(540, -14, 23, 562, -14, 23, D); I.left(478, -14, 16, 14, 15, O);
    I.box(496, -13, 0, 26, 6, 2, [L, O, M]);
    S.opoly([at(x + w, y, h), at(x + w, y + d, h), at(x + w, y + d / 2, h + 22)], O);
    S.opoly([at(x, y + d, h), at(x + w, y + d, h), at(x + w, y + d / 2, h + 22), at(x, y + d / 2, h + 22)], M);
    for (const k of [0.33, 0.66]) I.line(x, y + d - d / 2 * k, h + 22 * k, x + w, y + d - d / 2 * k, h + 22 * k, D);
    I.box(560, -42, h + 12, 10, 8, 18, [O, P, D]);
    return S;
  }
  // Aster's room, cut away: the far wall along the room, the hearth, the window, the cot, the stool, the door
  const ROOM = { x: -120, y: -110, w: 460, h: 340 }, WALK_Y = 70;
  function paintRoom() {
    const S = new Ink.Sheet(ROOM.w, ROOM.h); S.ox = ROOM.x; S.oy = ROOM.y;
    const I = new Ink.Iso(S, at), R2 = new Tycho.seed.Rng(4);
    I.box(0, 0, -6, 430, 110, 6, [V, M, D]);
    for (let y = 22; y < 110; y += 22) I.line(0, y, 0, 430, y, 0, D);
    I.left(0, 0, 0, 430, 74, M); I.right(0, 0, 0, 110, 74, G);
    for (let i = 0; i < 26; i++) { const x = R2.f(8, 410), z = R2.f(8, 64); I.line(x, 0, z, x + 14, 0, z, D); I.line(x + 7, 0, z + 6, x + 21, 0, z + 6, D); }
    I.top(-3, -3, 436, 3, 74, G); I.top(-3, -3, 3, 116, 74, G);
    // the hearth, a black mouth in the stone
    I.box(14, 0, 0, 82, 12, 52, [G, G, D]); I.left(30, 12, 0, 50, 30, D);
    // the window: night outside
    I.left(170, 0, 30, 36, 28, B); I.line(188, 0, 30, 188, 0, 58, D); I.line(170, 0, 44, 206, 0, 44, D);
    // the cot, its pillow, the blanket; the stool; the door
    I.box(234, 8, 0, 64, 24, 8, [G, M, D]); I.box(234, 10, 8, 12, 20, 3, [L, G, D]); I.box(248, 8, 8, 50, 24, 4, [P, P, D]);
    I.box(308, 14, 0, 14, 10, 14, [G, M, D]);
    I.left(390, 0, 0, 30, 54, V); for (const x of [398, 406, 414]) I.line(x, 0, 0, x, 0, 54, D);
    return S;
  }
  const ASTER = ['.LLLLLL.', 'LLLLLLLL', 'LssssLLL', 'LsesssLL', 'LsssssLL', '.LLLLLL.', '..LLLL..'];
  // the cat, the same Biscuit on any roof
  const CAT = ['.k...k...............kk.', 'kok.kok.............kook', 'koooook..............kok', 'kokookok.............kok', 'koooLook...........kook.', '.koooookkkkkkkkkkkkook..', '.kooOooOooOooOoooooook..', '..koOooOooOooOoooooook..', '..kooooooooooooooooook..', '..kLLoooooooooooooook...', '..kok.kok.....kok.kok...', '..kok.kok.....kok.kok...', '..kk..kk......kk..kk....'];
  const PELL = ['....kkkk....', '...kSSSSk...', '..kSSSSSSk..', '..kSLLLLSk..', '...kLkLLk...', '...kLLLLk...', '....kkkk....', '...kCCCCk...', '..kCCCCCCk..', '.kCCCCCCCCk.', '.kCkLLLLkCk.', '.kCkLLLLkCk.', '..kkLLLLkk..', '...kLLLLk...', '..kCLLLLCk..', '..kCCCCCCk..', '.kCCCCCCCCk.', '.kkkkkkkkkk.', '...kk..kk...'];
  // the seven lights on the far hills; the middle one is the last, and the
  // others go out in this order
  const LIGHTS = [[0.12, 0.7], [0.24, 0.66], [0.37, 0.69], [0.5, 0.66], [0.63, 0.69], [0.76, 0.67], [0.88, 0.69]];
  const DOUSED = [0, 6, 1, 5, 2, 4];

  // ---- the people ---------------------------------------------------------
  function people(w) {
    w.place({ id: 'room', region: 'room' });
    w.place({ id: 'road', region: 'road' });
    w.place({ id: 'cottage', tags: ['home'], region: 'road' });
    w.link('room', 'road', 2); w.link('road', 'cottage', 1);
    w.action({ id: 'lie', label: 'lying still', at: 'room', minutes: 600, base: 1, pose: 'sleep' });
    w.action({ id: 'wait', label: 'waiting on the step', at: 'cottage', minutes: 60, base: 1, pose: 'stand' });
    w.person('aster', { name: 'Aster', home: 'room', routine: [[0, 'room', 'lie']] });
    w.person('pell', { name: 'Mrs. Pell', home: 'cottage', routine: [[0, 'cottage', 'wait']] });
    const v = w.voice;
    v.approach({ id: 'kind', base: 1 });
    v.approach({ id: 'plain', base: 0 });
    v.thread({ id: 'aster.last', opens: true, if: ['person=aster'], beats: {
      start: { text: "You came. Good. I haven't long, so listen to me.", answers: [
        { say: "I'm here, Aster.", approach: 'kind', to: 'lantern' },
        { say: "Don't talk. Save your strength.", approach: 'kind', to: 'lantern' },
      ] },
      lantern: { text: 'There were seven Lanterns once. This is the last of them. When it goes out, there is nothing between the Hollow and the valley.', answers: [
        { say: 'What do I have to do?', approach: 'plain', to: 'mission' },
        { say: 'Why me?', approach: 'plain', to: 'why' },
      ] },
      why: { text: "Because you're the one who came. That's all it ever is.", answers: [
        { say: 'What do I have to do?', approach: 'plain', to: 'mission' },
      ] },
      mission: { text: "Carry it east along the Road, to the Spire. Light the great lamp there, and the dark goes back where it came from. The map shows the way. Whatever happens, {name}, don't stop. Don't let anything turn you aside.", then: ['fact.given=1'], answers: [
        { say: "I won't stop.", approach: 'kind', to: 'end' },
        { say: 'I promise.', approach: 'kind', to: 'end' },
      ] },
      end: { who: 'aside', text: "Aster's hand goes still on yours. The fire settles.", end: true },
    } });
    v.thread({ id: 'pell.cat', opens: true, if: ['person=pell'], beats: {
      start: { text: "Oh! Excuse me, dear, you there with the lamp. My cat's on the roof. Would you mind?", answers: [
        { say: 'Of course.', approach: 'kind', to: 'thanks' },
        { say: "I'm on a quest, actually. The Hollow is coming.", approach: 'plain', to: 'minute' },
      ] },
      minute: { text: "It'll only take a minute. He's just up there, look at him. He won't come down for me.", answers: [
        { say: 'All right. One minute.', approach: 'kind', to: 'thanks' },
      ] },
      thanks: { text: "Oh, you are kind. The drainpipe's round the side. Mind the gutters, they're older than I am.", then: ['fact.agreed=1'], end: true },
    } });
  }

  // ---- the quest -----------------------------------------------------------
  Elsewhere.quest({
    id: 'road', title: 'The Last Lantern', opening: true,
    ask: 'Carry the Lantern to the Spire.',
    view: 'iso', hold: 'landscape',
    accepts: ['start'], offers: ['doorstep'],
    souvenir: null, checklist: [],
    controls: { layout: 'stick', a: 'Jump', b: 'Use' },
    talkLook: 'serif',
    sounds: {
      gong: { g: 0.6, gap: 0.6, pri: true, fn: (S, o, t) => {
        Tycho.audio.tone(S, o, t, { f: 55, w: 'sine', a: 0.01, d: 1.6, g: 0.9, send: 0.6 });
        Tycho.audio.tone(S, o, t, { f: 110, w: 'triangle', a: 0.01, d: 0.9, g: 0.4, send: 0.6 });
        Tycho.audio.noise(S, o, t, { f: 220, q: 2, a: 0.02, d: 0.6, g: 0.3, send: 0.8 });
      } },
      douse: { g: 0.25, gap: 0.2, fn: (S, o, t) => { Tycho.audio.tone(S, o, t, { f: 880, f2: 440, glide: 0.4, w: 'sine', a: 0.005, d: 0.3, g: 0.4, send: 0.9 }); } },
    },
    // strings: slow, in a minor key, for the epic
    score: { bpm: 48, beats: 4, root: 146.83, chords: [[0, 7, 15], [-4, 3, 8], [-2, 5, 10], [-5, 2, 7]], w: 'sawtooth', lp: 1100, g: 0.55 },
    make(ctx, way, saved) {
      const s = Object.assign({ scene: 'cold', x: 40, y: GROUND, face: 1, given: false, gone: false, asked: false }, saved || {});
      const world = ctx.world({ start: 21 * 60 }, people);
      const body = { x: s.x, y: s.y, vx: 0, vy: 0, face: s.face, ground: true, coyote: 0, drop: 0, ladder: null, walked: 0 };
      const runner = new Tycho.move.Platform(NUM);
      let space = null, W = ROOM_W, t = 0, coldAt = 0, lit = 7;
      const cam = { x: -999, y: -999 };
      // the scenes' pictures, painted once
      const cold = { sky: paintColdSky().print(DUSK), hollow: paintHollow().print(DUSK), land: paintColdLand().print(DUSK) };
      const art = {};
      // the trees either side of the Road, and the dead lanterns along it
      const R2 = new Tycho.seed.Rng(9), BEHIND = [], BEFORE = [], POSTS = [];
      for (let i = 0; i < 46; i++) { const x = R2.f(-160, 660), y = R2.f(24, 150) * (i & 1 ? 1 : -1); if (Math.abs(x - 270) < 56 || Math.abs(y) < 26 || (x > 440 && x < 610 && y < 0)) continue; (y < 0 ? BEHIND : BEFORE).push([x, y]); }
      for (let x = -120; x < 460; x += 96) POSTS.push([x, -16]);
      for (const l of [BEHIND, BEFORE]) l.sort((a, b) => a[0] + a[1] - b[0] - b[1]);
      const lazy = () => {
        if (art.road) return;
        const you = Ink.traveler(DUSK, LOOK);
        art.room = { pal: FIRE, room: paintRoom().print(FIRE), you: Ink.traveler(FIRE, LOOK), aster: Ink.sprite(ASTER, { L, s: O, e: D }, FIRE, 0, 0).c, asterGone: Ink.sprite(ASTER, { L, s: G, e: G }, FIRE, 0, 0).c };
        art.road = { pal: DUSK, land: paintLand().print(DUSK), sky: paintSkyStrip().print(DUSK), tree: paintTree().print(DUSK), post: paintPost().print(DUSK), cottage: paintCottage().print(DUSK), you,
          cat: Ink.sprite(CAT, { k: D, o: O, O: M, L }, DUSK, 12, 12), pell: Ink.sprite(PELL, { k: D, S: M, L, C: P }, DUSK, 6, 18) };
      };
      function enter(scene) {
        s.scene = scene; lazy();
        if (scene === 'aster') { W = ROOM_W; space = new Tycho.collide.Space().boxes([{ x0: -20, y0: GROUND, x1: ROOM_W + 20, y1: GROUND + 60 }]).bounds(8, ROOM_W - 8); }
        if (scene === 'road') {
          W = ROAD_W;
          space = new Tycho.collide.Space().boxes([
            { x0: -20, y0: GROUND, x1: 250, y1: GROUND + 60 }, { x0: 290, y0: GROUND, x1: ROAD_W + 20, y1: GROUND + 60 },
            { x0: 250, y0: GROUND + 18, x1: 290, y1: GROUND + 60 }, { x0: 264, y0: GROUND + 6, x1: 276, y1: GROUND + 60 },
            { x0: 120, y0: GROUND - 11, x1: 138, y1: GROUND }, { x0: 180, y0: GROUND - 5, x1: 192, y1: GROUND },
            { x0: 360, y0: GROUND - 12, x1: 392, y1: GROUND },
          ]).bounds(4, ROAD_W - 4);
        }
      }
      function startCold() {
        s.scene = 'cold'; coldAt = t; lit = 7;
        ctx.narrate([
          { text: 'In the old days there were seven Lanterns, and the valley slept by their light.', hold: 5 },
          { text: 'Then the Hollow came down out of the north, and one by one, the Lanterns went out.', hold: 6, cue: 'gong' },
          { text: 'Six are dark now. The Hollow is at the edge of the valley.', hold: 5 },
          { text: 'One Lantern still burns.', hold: 4 },
          { text: 'The Last Lantern', title: true, hold: 4.5, cue: 'gong' },
          { text: 'Bearer, what are you called?', ask: (v) => ctx.setName(v), value: '' },
        ], { onEnd: () => ctx.fade(() => { enter('aster'); body.x = 40; body.y = GROUND; ctx.save(); }) });
      }
      if (s.scene === 'cold') startCold(); else enter(s.scene);
      // what Use does where you stand: [its prompt, what it does], or null
      function use() {
        if (s.scene !== 'aster') return null;
        if (!s.given && Math.abs(body.x - ASTER_X) < 34) return ['Kneel by Aster', () => ctx.talk('aster', { name: 'Aster', noDrop: true, noBye: true, words: { greet: '…', bye: '…' }, onEnd: afterAster })];
        if (s.given && body.x > ROOM_DOOR - 22) return ['Out to the Road', () => ctx.fade(() => { enter('road'); body.x = 24; body.y = GROUND; body.vx = 0; ctx.save(); })];
        if (!s.given && body.x > ROOM_DOOR - 22) return ['The door', () => ctx.toast('Not yet. Aster is calling for you.')];
        return null;
      }
      function afterAster() {
        if (!world.fact('given') || s.given) return;
        s.given = true; s.gone = true;
        ctx.giveLantern(); ctx.openMain();
        ctx.lines(['Aster is gone.', 'You take up the Lantern. It is warm, and lighter than it looks.', 'Outside, the Road runs east, toward the Spire.'], () => ctx.save());
      }
      function askPell() {
        s.asked = true; body.vx = 0;
        ctx.talk('pell', { name: 'Mrs. Pell', noDrop: true, noBye: true, words: { greet: 'Hello, dear.', bye: 'Off you go.' }, onEnd: () => { if (world.fact('agreed')) ctx.done('doorstep'); else s.asked = false; } });
      }
      return {
        step(dt) {
          t += dt; world.tick(dt);
          if (s.scene === 'cold') return;
          const m = ctx.pad.move;
          runner.step(space, body, { ax: m.x, ay: m.y, jump: ctx.pad.held('a'), jumpHit: ctx.pad.take('a') }, dt);
          if (body.vx > 4) body.face = 1; else if (body.vx < -4) body.face = -1;
          const u = use();
          ctx.prompt(u ? u[0] : null);
          if (ctx.pad.take('b') && u) { ctx.prompt(null); u[1](); }
          if (s.scene === 'road' && !s.asked && body.x > PELL_STOP) askPell();
        },
        idle(dt) { t += dt; },
        draw(g) {
          const vw = ctx.view.w, vh = ctx.view.h, oy = vh - H;
          if (s.scene === 'cold') {
            const k = t - coldAt, i = Narrate.open ? Narrate.i : 6;
            // the lights go out one by one as the voice says so
            const want = i < 2 ? 7 : Math.max(1, 7 - Math.floor((k - 7) / 0.9));
            if (want < lit) { lit = want; ctx.snd.cue('douse'); }
            const ox = Math.round((vw - 560) / 2);
            g.drawImage(cold.sky, ox, oy);
            const drift = Math.min(1, k / 30), hy = Math.round(oy + 2 + drift * 18), hx = Math.round(vw / 2 - 160);
            g.drawImage(cold.hollow, hx, hy);
            if (Math.sin(k * 2.1) > -0.8) { g.fillStyle = DUSK[L]; g.fillRect(hx + 146, hy + 26, 7, 4); g.fillRect(hx + 167, hy + 26, 7, 4); }
            g.drawImage(cold.land, ox, oy);
            const out = new Set(DOUSED.slice(0, 7 - lit));
            LIGHTS.forEach(([fx, fy], n) => {
              const x = Math.round(vw * fx), y = Math.round(oy + H * fy);
              g.fillStyle = DUSK[D]; g.fillRect(x, y, 2, 8); g.fillRect(x - 2, y - 3, 6, 4);
              if (!out.has(n)) { g.fillStyle = DUSK[L]; g.fillRect(x - 1, y - 2, 4, 2); g.fillStyle = DUSK[O]; g.fillRect(x, y - 2, 2, 1); }
            });
            return;
          }
          const room = s.scene === 'aster', A = room ? art.room : art.road, rowY = room ? WALK_Y : 0;
          // the player's feet on the grid: x along the way, how high off the ground
          const [hx, hy] = at(body.x, rowY, GROUND - body.y);
          const [fx0, fy0] = at(body.x, rowY);
          // the camera goes with them, and the land runs on past the frame
          const tx = fx0 - vw / 2, ty = fy0 - vh * (room ? 0.58 : 0.64);
          cam.x += (tx - cam.x) * 0.14; cam.y += (ty - cam.y) * 0.14;
          if (Math.abs(cam.x - tx) > 150 || Math.abs(cam.y - ty) > 150) { cam.x = tx; cam.y = ty; }
          const cx = Math.round(cam.x), cy = Math.round(cam.y);
          const going = body.ground && Math.abs(body.vx) > 6 && Math.floor(body.walked / 9) & 1;
          const side = body.face < 0 ? 'l' : 'r', P2 = (going || !body.ground ? A.you.walk : A.you.stand)[side];
          const drawPlayer = () => {
            const px = Math.round(hx) - cx, py = Math.round(hy) - cy;
            // (in the air, a little shadow says where the ground is)
            if (!body.ground) { g.fillStyle = A.pal[room ? D : G]; g.fillRect(Math.round(fx0) - cx - 6, Math.round(fy0) - cy - 1, 12, 2); }
            Figure.draw(g, P2, px, py);
            if (s.given) Figure.draw(g, A.you.lantern, px + 7 * body.face, py - 11);
          };
          if (room) {
            g.fillStyle = FIRE[D]; g.fillRect(0, 0, vw, vh);
            g.drawImage(A.room, ROOM.x - cx, ROOM.y - cy);
            // the fire, a few flames in the hearth's mouth
            for (let i = 0; i < 8; i++) {
              const [ix, iy] = at(38 + i * 5.5, 14), mid = 1 - Math.abs(i - 3.5) / 4.5, fh = Math.round((4 + mid * 12 + Tycho.seed.fxRand.f(5)) * (s.gone ? 0.5 : 1)), x = Math.round(ix) - cx, y = Math.round(iy) - cy;
              g.fillStyle = FIRE[O]; g.fillRect(x, y - fh, 3, fh); g.fillStyle = FIRE[L]; g.fillRect(x + 1, y - Math.round(fh * 0.45), 1, Math.round(fh * 0.45));
            }
            const [ax, ay] = at(240, 20, 12);
            g.drawImage(s.gone ? A.asterGone : A.aster, Math.round(ax) - cx - 4, Math.round(ay) - cy - 4);
            if (!s.given) { const [lx, ly] = at(STOOL_X + 7, 19, 22); Figure.draw(g, A.you.lantern, Math.round(lx) - cx, Math.round(ly) - cy); }
            drawPlayer();
            return;
          }
          // the Road: the land, then the sky standing fixed behind it
          g.fillStyle = DUSK[V]; g.fillRect(0, 0, vw, vh);
          g.drawImage(A.land, GX - cx, GY - cy);
          g.drawImage(A.sky, Math.round((vw - 600) / 2 - clamp(cam.x, -60, 500) * 0.03), 0);
          const stand = (list, sp) => { for (const [x, y] of list) { const [ix, iy] = at(x, y), sy = Math.round(iy) - cy; if (sy > HORIZON + 4 && sy < vh + 40) g.drawImage(sp, Math.round(ix) - cx - (sp.width >> 1), sy - sp.height + 1); } };
          stand(BEHIND, A.tree); stand(POSTS, A.post);
          g.drawImage(A.cottage, COT.x - cx, COT.y - cy);
          { const [ix, iy] = at(532, -37, 66); Figure.draw(g, A.cat, Math.round(ix) - cx, Math.round(iy) - cy + (Math.floor(t * 1.5) % 2)); }
          { const [ix, iy] = at(PELL_X, -6); Figure.draw(g, A.pell, Math.round(ix) - cx, Math.round(iy) - cy); }
          // the stream's glints
          g.fillStyle = DUSK[L];
          for (let i = 0; i < 6; i++) { const [ix, iy] = at(254 + ((t * 9 + i * 11) % 32), -70 + i * 26, -12); g.fillRect(Math.round(ix) - cx, Math.round(iy) - cy, 3, 1); }
          drawPlayer();
          stand(BEFORE, A.tree);
          // the Hollow at the edges: dark wisps reaching in from the left and the top
          g.fillStyle = DUSK[D];
          for (let i = 0; i < 26; i++) {
            const top = i % 2 === 0, base = (i * 37) % (top ? vw : vh), reach = 8 + (Tycho.seed.hash(i, 9, 2) * 22 | 0) + Math.sin(t * 0.8 + i) * 5;
            for (let k = 0; k < reach; k += 3) {
              const sway = Math.sin(t * 1.3 + i * 2 + k * 0.15) * (k * 0.25), w = Math.round(1 + (reach - k) / 7);
              if (top) g.fillRect(Math.round(base + sway), k, w, 3); else g.fillRect(k, Math.round(base + sway), 3, w);
            }
          }
        },
        save() { return { scene: s.scene, x: Math.round(body.x), y: Math.round(body.y), face: body.face, given: s.given, gone: s.gone, asked: false }; },
        end() { ctx.prompt(null); },
        // the tests' player: through the room, along the Road, jumping what's in the way
        bot() {
          if (s.scene === 'cold') return null;
          const goal = s.scene === 'aster' ? (!s.given ? ASTER_X : ROOM_DOOR) : PELL_X;
          const dir = Math.sign(goal - body.x) || 1, near = Math.abs(goal - body.x) < 10;
          const ahead = space.hits(body.x + dir * 10 - 3, body.y - 10, body.x + dir * 10 + 3, body.y - 1);
          const gap = !space.solidAt(body.x + dir * 12, body.y + 3);
          return { x: near ? 0 : dir, y: 0, aHit: body.ground && (!!ahead || gap), a: !body.ground, bHit: near };
        },
        where() { return { scene: s.scene, x: Math.round(body.x), y: Math.round(body.y), given: s.given }; },
      };
    },
  });
  Elsewhere.handoff('road', 'doorstep', 'pell');
})();
