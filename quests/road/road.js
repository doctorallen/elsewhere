'use strict';
// ---------------------------------------------------------------------------
// The opening: The Last Lantern, played completely straight. Three scenes.
//   cold   a painted sky with the Hollow in it, seven lights going out on the
//          hills, the narrator's voice, the title, and the player's name
//   aster  one stone room at night: Old Aster dies on a cot by the fire and
//          gives you the Lantern, the map and the mission; the log opens
//   road   the Lantern Road, a screen and a half of it, east toward the
//          Spire, the Hollow at the edges; then a woman on a doorstep
// Nothing here is in on the joke. It ends at Mrs. Pell's doorstep: the
// handoff 'doorstep' starts her quest. The Road is kept as it is, because the
// ending comes back to it (one screen and a half along, her door behind you).
// ---------------------------------------------------------------------------
(() => {
  const { clamp } = Tycho.math;
  const { noise, hash } = Tycho.seed;
  const { rampOf } = Tycho.color;
  // the player in the epic's style: soft, painterly, outlined dark
  const STYLE = { key: 'road', h: 24, flat: false, line: true, ink: '#0a0810' };
  const NUM = { w: 8, h: 22, speed: 80, walk: 46, accel: 900, airAccel: 600, friction: 1200, jump: 212, gravity: 700, maxFall: 380, coyote: 0.1, climb: 50 };
  // the world's height, the ground, the scenes' widths
  const H = 200, GROUND = 170, ROAD_W = 600, ROOM_W = 430;
  // where things are
  const ASTER_X = 262, STOOL_X = 308, ROOM_DOOR = 404, PELL_X = 512, PELL_STOP = 470;
  const R = (hexes, n = 8, deep = 0.5, high = 0.25) => rampOf(hexes, n, deep, high);

  // ---- painting ------------------------------------------------------------
  // the dusk sky: deep violet at the top, ember at the horizon, slow clouds
  function paintSky(w, h, seed, hor = 0.82) {
    const P = new Tycho.paint.Pix(w, h);
    const SKY = R(['#0c0a1c', '#2a1e48', '#5e3460', '#b45a48', '#e8a060'], 12, 0.4, 0.2);
    P.area(0, 0, w - 1, h - 1, SKY, (x, y) => clamp(y / (h * hor) + (noise(x / 60, y / 14, seed) - 0.5) * 0.18, 0, 1), { seed });
    // long thin clouds lit from below
    for (let y = 20; y < h * 0.7; y++) for (let x = 0; x < w; x++) {
      const c = noise(x / 90, y / 6, seed + 9) - 0.62 + (y / h) * 0.1;
      if (c > 0) P.tint(x, y, [232, 150, 110], Math.min(0.5, c * 2.2) * (y / h));
    }
    return P.canvases().c;
  }
  // far mountains and, at the far right, the Spire: a needle, its lamp dark
  function paintMountains(w, h, seed) {
    const P = new Tycho.paint.Pix(w, h), M = R(['#1a1428', '#3a2c48', '#6a4a5a'], 7, 0.4, 0.1);
    const ridge = (x) => 96 + noise(x / 70, 0.5, seed) * 46 + noise(x / 20, 3.5, seed) * 8;
    P.area(0, 60, w - 1, h - 1, M, (x, y) => clamp(0.15 + (y - ridge(x)) / 160 + (noise(x / 9, y / 9, seed) - 0.5) * 0.15, 0, 0.7), { inside: (x, y) => y > ridge(x), seed, fog: 0.35, fogc: [120, 70, 90] });
    const sx = Math.round(w * 0.86), top = 28;
    P.area(sx - 4, top, sx + 4, 140, M, (x, y) => (x < sx ? 0.25 : 0.12) + (y - top) / 600, { inside: (x, y) => Math.abs(x - sx) <= 1 + (y - top) / 26, seed: seed + 1, fog: 0.25, fogc: [120, 70, 90] });
    return P.canvases().c;
  }
  // near hills with dark trees
  function paintHills(w, h, seed) {
    const P = new Tycho.paint.Pix(w, h), G = R(['#141c18', '#24342a', '#3e5236', '#6a7a48'], 8, 0.5, 0.15), T = R(['#0c1210', '#1c2a22', '#2e4030'], 6, 0.5, 0.1);
    const ridge = (x) => 126 + noise(x / 50, 1.5, seed) * 26;
    P.area(0, 90, w - 1, h - 1, G, (x, y) => clamp(0.65 - (y - ridge(x)) / 120 + (noise(x / 12, y / 6, seed) - 0.5) * 0.2, 0, 1), { inside: (x, y) => y > ridge(x), seed });
    for (let i = 0; i < 18; i++) {
      const tx = hash(i, 3, seed) % w, ty = ridge(tx) + 4, th = 14 + (hash(i, 5, seed) % 16);
      P.area(tx - 8, ty - th, tx + 8, ty, T, (x, y) => 0.3 + (x < tx ? 0.25 : 0) - ((y - ty + th) / th) * 0.2, { inside: (x, y) => Math.abs(x - tx) < (y - ty + th) * 0.45, seed: seed + i });
    }
    return P.canvases().c;
  }
  // the road itself: the grass bank, the beaten road, the stream, the stones,
  // the milestone, and Mrs. Pell's cottage at the end of it
  function paintRoad(seed) {
    const P = new Tycho.paint.Pix(ROAD_W, H);
    const GRASS = R(['#1e2e1c', '#34502c', '#5a7a3a', '#8aa050'], 9, 0.5, 0.2), DIRT = R(['#2a1e16', '#5a4430', '#8a6a48', '#b0905e'], 9, 0.5, 0.2);
    const STONE = R(['#26222a', '#4a4650', '#7a7480', '#a8a0a0'], 8, 0.5, 0.2), WATER = R(['#0e1830', '#1e3858', '#3a6a88', '#8ab0c0'], 8, 0.4, 0.2);
    // grass behind the road
    P.area(0, GROUND - 22, ROAD_W - 1, GROUND - 1, GRASS, (x, y) => clamp(0.35 + (noise(x / 7, y / 3, seed) - 0.5) * 0.5 - (GROUND - y) / 60, 0, 1), { seed });
    // the road: packed earth, ruts
    P.area(0, GROUND, ROAD_W - 1, H - 1, DIRT, (x, y) => clamp(0.55 - (y - GROUND) / 70 + (noise(x / 10, y / 2, seed + 2) - 0.5) * 0.35 + ((y - GROUND) % 9 === 3 ? -0.15 : 0), 0, 1), { seed: seed + 2, inside: (x) => x < 250 || x > 290 });
    // the stream, its bed, a stepping stone
    P.area(250, GROUND + 8, 290, H - 1, WATER, (x, y) => clamp(0.45 + (noise(x / 6, y / 2, seed + 3) - 0.5) * 0.5 - (y - GROUND) / 90, 0, 1), { seed: seed + 3 });
    P.area(250, GROUND, 290, GROUND + 7, DIRT, (x, y) => 0.25 + (y - GROUND) / 40, { seed: seed + 4 });
    P.block(264, GROUND + 6, 276, GROUND + 18, STONE, { base: 0.55 });
    // boulders and a fallen log
    P.area(118, GROUND - 12, 140, GROUND, STONE, (x, y) => clamp(0.7 - (y - GROUND + 12) / 18 - (x - 118) / 60, 0, 1), { inside: (x, y) => ((x - 129) * (x - 129)) / 121 + ((y - GROUND) * (y - GROUND)) / 144 < 1, seed: seed + 5 });
    P.area(178, GROUND - 6, 194, GROUND, STONE, (x, y) => 0.5 - (y - GROUND + 6) / 20, { inside: (x, y) => ((x - 186) * (x - 186)) / 64 + ((y - GROUND) * (y - GROUND)) / 36 < 1, seed: seed + 6 });
    const BARK = R(['#1e140e', '#3e2a1c', '#6a4a30'], 7, 0.5, 0.15);
    P.area(358, GROUND - 13, 394, GROUND, BARK, (x, y) => clamp(0.7 - Math.abs(y - (GROUND - 7)) / 9 + (x % 7 === 0 ? -0.2 : 0), 0, 1), { seed: seed + 7 });
    // the milestone: a worn stone, a carved arrow east
    P.block(214, GROUND - 22, 224, GROUND, STONE, { base: 0.5 });
    for (let i = 0; i < 5; i++) P.put(216 + i, GROUND - 14, [40, 36, 44]);
    P.put(219, GROUND - 15, [40, 36, 44]); P.put(219, GROUND - 13, [40, 36, 44]);
    // the cottage: whitewashed, a slate roof, a red door with a step
    const WALL = R(['#4a4440', '#8a8078', '#c8beb0', '#e8e0d0'], 8, 0.5, 0.2), SLATE = R(['#1a1a24', '#2e2e3e', '#4a4a5e'], 6, 0.5, 0.15), DOOR = R(['#3a1010', '#7a2a22', '#a84a36'], 6, 0.5, 0.2);
    P.block(470, GROUND - 64, 592, GROUND, WALL, { base: 0.55 });
    P.area(462, GROUND - 100, 600, GROUND - 62, SLATE, (x, y) => clamp(0.3 + ((y - GROUND) % 5 === 0 ? -0.2 : 0) + (noise(x / 4, y, seed) - 0.5) * 0.3, 0, 1), { inside: (x, y) => y > GROUND - 100 + Math.abs(x - 531) * 0.55, seed: seed + 8 });
    P.block(560, GROUND - 118, 572, GROUND - 82, STONE, { base: 0.4 });
    P.block(500, GROUND - 40, 518, GROUND - 2, DOOR, { base: 0.5 });
    P.block(496, GROUND - 3, 522, GROUND + 1, STONE, { base: 0.6 });
    // a window, lit warm from inside
    P.area(540, GROUND - 44, 562, GROUND - 26, R(['#5a3010', '#c88030', '#ffd080'], 6), (x, y) => (x === 551 || y === GROUND - 35 ? 0.1 : 0.7), { glow: 0.45, seed: seed + 9 });
    return P.canvases();
  }
  // the stone room: a hearth, a window, the cot, the stool, the door
  function paintRoom(seed) {
    const P = new Tycho.paint.Pix(ROOM_W, H);
    const WALL = R(['#141018', '#2c2630', '#4a4048', '#6a5e60'], 9, 0.5, 0.15), WOOD = R(['#1a120c', '#3a2818', '#5e4228', '#806040'], 8, 0.5, 0.15);
    P.area(0, 0, ROOM_W - 1, GROUND - 1, WALL, (x, y) => {
      const row = Math.floor(y / 11), sx = (x + (row % 2) * 9) % 18, joint = y % 11 === 0 || sx === 0;
      return clamp(0.4 + (hash(Math.floor((x + (row % 2) * 9) / 18), row, seed) % 100) / 400 + (joint ? -0.3 : 0), 0, 1);
    }, { seed });
    P.area(0, GROUND, ROOM_W - 1, H - 1, WOOD, (x, y) => clamp(0.5 - (y - GROUND) / 60 + ((x + (y - GROUND) * 7) % 23 === 0 ? -0.3 : 0), 0, 1), { seed: seed + 1 });
    // the hearth, a black mouth in the stone
    P.block(14, GROUND - 62, 96, GROUND, WALL, { base: 0.55 });
    P.area(30, GROUND - 38, 80, GROUND - 1, R(['#060406', '#140c0c', '#2a1610']), (x, y) => (y - GROUND + 38) / 60, { seed: seed + 2 });
    // the window: night, a moon's light
    P.area(170, 44, 206, 92, R(['#0a1428', '#1a2c50', '#4a6a9a']), (x, y) => (x === 188 || y === 68 ? 0.05 : 0.45 + (y - 44) / 200), { seed: seed + 3, glow: 0.15 });
    // the cot and the stool
    P.block(234, GROUND - 14, 298, GROUND - 8, WOOD, { base: 0.55 });
    P.block(236, GROUND - 8, 240, GROUND, WOOD, { base: 0.35 });
    P.block(292, GROUND - 8, 296, GROUND, WOOD, { base: 0.35 });
    P.block(302, GROUND - 16, 316, GROUND - 12, WOOD, { base: 0.6 });
    P.block(304, GROUND - 12, 307, GROUND, WOOD, { base: 0.35 });
    P.block(311, GROUND - 12, 314, GROUND, WOOD, { base: 0.35 });
    // the door: an arch of planks
    P.area(390, GROUND - 56, 420, GROUND - 1, WOOD, (x, y) => clamp(0.45 + ((x - 390) % 6 === 0 ? -0.25 : 0), 0, 1), { inside: (x, y) => y > GROUND - 56 + 15 - Math.sqrt(Math.max(0, 225 - (x - 405) * (x - 405))), seed: seed + 4 });
    return P.canvases();
  }
  // the Hollow over the sky: something vast and hooded, reaching
  function paintHollow(w, h) {
    const [c, g] = Tycho.sprite.canvas(w, h), [e, eg] = Tycho.sprite.canvas(w, h);
    g.fillStyle = '#07050c';
    const blob = (x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(1, r), 0, Math.PI * 2); g.fill(); };
    const cx = w / 2;
    for (let i = 0; i < 60; i++) { const t = i / 59, x = cx + Math.sin(t * 5.5) * 10, y = h * 0.95 - t * h * 0.62; blob(x, y, 30 - t * 14 + Math.sin(t * 9) * 3); }
    blob(cx, h * 0.3, 22); blob(cx - 10, h * 0.24, 14); blob(cx + 12, h * 0.25, 13);
    for (const s of [-1, 1]) for (let i = 0; i < 70; i++) { const t = i / 69; blob(cx + s * (20 + t * w * 0.42), h * 0.52 - Math.sin(t * Math.PI) * 30 + t * 40, 12 * (1 - t) + 2); }
    eg.fillStyle = '#b070ff';
    for (const [x, y] of [[cx - 8, h * 0.3], [cx + 6, h * 0.3]]) { eg.fillRect(Math.round(x), Math.round(y), 3, 1); eg.fillRect(Math.round(x) + 1, Math.round(y) - 1, 1, 3); }
    return { c, e };
  }
  // Aster on the cot: an old face in a white beard, a red blanket
  function paintAster(gone) {
    const S = Tycho.sprite.Shapes.soft(70, 24, 11, { ink: [10, 8, 16] }); S.line = true;
    const blanket = R(['#3a1418', '#7a2a2a', '#a84a3e'], 6), skin = Figure.ramp(gone ? '#b8a8a0' : '#d8a888'), hair = Figure.ramp('#d8d4cc');
    S.ax = 35; S.ay = 23;
    S.ell(12, 12, 6, 5, R(['#8a8478', '#c8c0b0', '#eee8dc'], 5)); S.part(); // the pillow
    S.shape([[18, 10], [66, 10], [68, 22], [16, 22]], blanket, { down: 0.4, folds: 3 }); S.part();
    S.ell(15, 11, 5, 4.5, skin); S.part(false);
    S.ell(13, 8, 5, 3, hair); S.ell(19, 14, 3.4, 3, hair); S.part(false);
    if (!gone) { S.px(17, 10, [30, 20, 24]); S.cap(22, 15, 30, 18, 1.4, 1.3, skin); }
    return S.done();
  }
  // Mrs. Pell in the epic's style: a gray bun, a lilac cardigan, an apron
  function paintPell() {
    const u = 23 / 30, W = 24, Hh = 30;
    const S = Tycho.sprite.Shapes.soft(W, Hh, 21, { ink: [10, 8, 16] }); S.line = true;
    const F = Hh - 2, cx = W / 2, X = (v) => cx + v * u, Y = (v) => F - v * u;
    S.ax = Math.round(cx); S.ay = F;
    const skirt = Figure.ramp('#3a3448'), card = Figure.ramp('#9a7aa8'), apron = Figure.ramp('#d8d0c0'), skin = Figure.ramp('#e0b090'), hair = Figure.ramp('#b8b4b0'), shoe = Figure.ramp('#2a2020');
    S.cap(X(-1), Y(1), X(-1), Y(6), 1.4 * u, 1.3 * u, shoe); S.cap(X(1.5), Y(1), X(1.5), Y(6), 1.4 * u, 1.3 * u, shoe); S.part();
    S.shape([[X(-3.5), Y(20)], [X(3.5), Y(20)], [X(5), Y(5)], [X(-5), Y(5)]], skirt, { down: 0.3 }); S.part();
    S.shape([[X(-3.5), Y(21)], [X(3.5), Y(21)], [X(4), Y(12)], [X(-4), Y(12)]], card, { down: 0.3 }); S.part();
    S.shape([[X(-2.5), Y(16)], [X(3), Y(16)], [X(3.5), Y(6)], [X(-2.5), Y(6)]], apron, { down: 0.2 }); S.part();
    S.ell(X(0.5), Y(24.5), 3 * u, 3.3 * u, skin); S.part(false);
    S.ell(X(-0.6), Y(26.5), 3.3 * u, 2 * u, hair); S.ell(X(-2.6), Y(27), 1.8 * u, 1.8 * u, hair);
    S.px(X(1.8), Y(24.4), [30, 20, 24]); S.part();
    // a hand raised, waving you over
    S.cap(X(-2), Y(19.5), X(3.5), Y(14), 1.4 * u, 1.2 * u, card);
    S.cap(X(3.5), Y(14), X(5), Y(19), 1.2 * u, 1.1 * u, card);
    return S.done();
  }
  // the cat: ginger, on the ridge, its tail moving
  const CAT_PAL = { o: '#d07030', d: '#8a4018', k: '#1a1010', w: '#f0e0c0' };
  const CAT = [
    ['......o.o.', '.....oooo.', 'o....okok.', 'o.ddoooow.', '.oooooo...', '.o.o..o.o.'],
    ['..........', '.....oo.o.', 'o....oooo.', '.o.ddokok.', '.ooooooow.', '.o.o..o.o.'],
  ];
  // the seven lights on the far hills; the middle one is the last, and the
  // others go out in this order
  const LIGHTS = [[0.12, 0.74], [0.24, 0.7], [0.37, 0.76], [0.5, 0.69], [0.63, 0.75], [0.76, 0.71], [0.88, 0.73]];
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
    view: 'side', hold: 'landscape',
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
      let space = null, W = ROOM_W, t = 0, coldAt = 0, lit = 7, cam = 0;
      // the scenes' pictures, painted once
      const sky = paintSky(520, H, 3), coldSky = paintSky(520, H, 5, 0.95), hollow = paintHollow(300, 150);
      const mountains = paintMountains(520, H, 7), hills = paintHills(420, H, 8);
      let road = null, room = null, aster = null, asterGone = null, pell = null, cats = null;
      const lazy = () => {
        if (!room) { room = paintRoom(4); aster = paintAster(false); asterGone = paintAster(true); }
        if (!road) { road = paintRoad(6); pell = paintPell(); cats = CAT.map((rows) => ({ c: Tycho.sprite.spriteFrom(rows, CAT_PAL), e: null, ax: 5, ay: 6 })); }
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
            const ox = Math.round((vw - 520) / 2);
            g.drawImage(coldSky, ox, oy);
            const drift = Math.min(1, k / 30), hy = Math.round(oy + 2 + drift * 18), hx = Math.round(vw / 2 - 150);
            g.globalAlpha = 0.85 + Math.sin(k * 0.7) * 0.1; g.drawImage(hollow.c, hx, hy); g.globalAlpha = 1;
            g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6 + Math.sin(k * 2.1) * 0.3; g.drawImage(hollow.e, hx, hy); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
            g.drawImage(mountains, ox, oy + 20);
            g.drawImage(hills, Math.round((vw - 420) / 2), oy + 26);
            const out = new Set(DOUSED.slice(0, 7 - lit));
            LIGHTS.forEach(([fx, fy], n) => {
              const x = Math.round(vw * fx), y = Math.round(oy + H * fy);
              if (!out.has(n)) { g.fillStyle = '#ffe0a0'; g.fillRect(x, y, 1, 1); Figure.halo(g, x, y + 0.5, n === 3 ? 14 : 8, 'rgba(255,200,110,', n === 3 ? 0.5 : 0.3); }
              else { g.fillStyle = '#2a1e30'; g.fillRect(x, y, 1, 1); }
            });
            return;
          }
          cam = W <= vw ? (W - vw) / 2 : clamp(body.x - vw / 2, 0, W - vw);
          const cx = Math.round(cam), left = body.face < 0;
          const pose = !body.ground ? (body.vy < 0 ? 'jump' : 'fall') : Math.abs(body.vx) > 6 ? 'walk' + (Math.floor(body.walked / 5) & 3) : 'stand';
          const drawPlayer = () => {
            if (!s.given) { Figure.draw(g, Figure.pose(STYLE, pose, left), body.x - cx, body.y + oy); return null; }
            return Figure.player(g, STYLE, pose, body.x - cx, body.y + oy, left);
          };
          if (s.scene === 'aster') {
            g.fillStyle = '#000'; g.fillRect(0, 0, vw, vh);
            g.drawImage(room.c, -cx, oy);
            // the fire, a few flames
            for (let i = 0; i < 8; i++) {
              const fx = Math.round(38 + i * 5.5 - cx), mid = 1 - Math.abs(i - 3.5) / 4.5, fh = Math.round((5 + mid * 12 + Tycho.seed.fxRand.f(5)) * (s.gone ? 0.5 : 1)), fy = GROUND - 1 + oy;
              g.fillStyle = '#c84a1a'; g.fillRect(fx, fy - fh, 1, fh); g.fillRect(fx - 1, fy - Math.round(fh * 0.6), 3, Math.round(fh * 0.6));
              g.fillStyle = '#ffa040'; g.fillRect(fx, fy - Math.round(fh * 0.7), 1, Math.round(fh * 0.7));
              g.fillStyle = '#ffe080'; g.fillRect(fx, fy - Math.round(fh * 0.3), 1, Math.round(fh * 0.3));
            }
            g.fillStyle = '#3a1a0e'; g.fillRect(Math.round(34 - cx), GROUND - 3 + oy, 46, 3); // the logs
            Figure.draw(g, s.gone ? asterGone : aster, 268 - cx, GROUND - 12 + oy);
            if (!s.given) Figure.draw(g, Figure.lantern(STYLE), STOOL_X + 1 - cx, GROUND - 26 + oy);
            const at = drawPlayer();
            // the dark of the room, the fire's light and the Lantern's
            g.fillStyle = 'rgba(4,3,12,0.42)'; g.fillRect(0, 0, vw, vh);
            Figure.halo(g, 58 - cx, GROUND - 14 + oy, 110, 'rgba(255,140,60,', 0.32 + Tycho.seed.fxRand.f(0.05));
            Figure.halo(g, 188 - cx, 70 + oy, 60, 'rgba(110,150,255,', 0.12);
            if (!s.given) Figure.halo(g, STOOL_X + 1 - cx, GROUND - 20 + oy, 70, 'rgba(255,210,120,', 0.4);
            else if (at) Figure.halo(g, at[0], at[1], 90, 'rgba(255,210,120,', 0.5);
            return;
          }
          // the road
          g.drawImage(sky, Math.round(-cam * 0.05), oy);
          g.drawImage(mountains, Math.round(-cam * 0.2), oy + 14);
          g.drawImage(hills, Math.round(-cam * 0.5), oy + 18);
          g.drawImage(road.c, -cx, oy);
          if (road.e) { g.globalCompositeOperation = 'lighter'; g.drawImage(road.e, -cx, oy); g.globalCompositeOperation = 'source-over'; }
          // the stream's glints
          for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(200,220,255,0.5)'; g.fillRect(Math.round(252 + ((t * 9 + i * 11) % 36) - cx), GROUND + 10 + i * 3 + oy, 2, 1); }
          Figure.draw(g, pell, PELL_X - cx, GROUND - 2 + oy);
          Figure.draw(g, cats[Math.floor(t * 1.5) % 2], 532 - cx, GROUND - 99 + oy);
          const at = drawPlayer();
          if (at) Figure.halo(g, at[0], at[1], 50, 'rgba(255,210,120,', 0.22);
          // the Hollow at the edges: dark wisps reaching in from the left and the top
          for (let i = 0; i < 26; i++) {
            const top = i % 2 === 0, base = (i * 37) % (top ? vw : vh), reach = 10 + (hash(i, 9, 2) % 26) + Math.sin(t * 0.8 + i) * 6;
            for (let k = 0; k < reach; k += 2) {
              const sway = Math.sin(t * 1.3 + i * 2 + k * 0.15) * (k * 0.25), a = 0.75 * (1 - k / reach);
              g.fillStyle = `rgba(14,6,22,${a.toFixed(2)})`;
              if (top) g.fillRect(Math.round(base + sway), k, Math.round(3 + (reach - k) / 8), 2); else g.fillRect(k, Math.round(base + sway), 2, Math.round(3 + (reach - k) / 8));
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
