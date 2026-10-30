'use strict';
// ---------------------------------------------------------------------------
// The player and the Lantern, drawn in each world's style by one recipe.
// The player is the same traveler everywhere (ginger hair, a long blue coat,
// a red scarf, the Lantern in the right hand), so they're recognizable from
// one world to the next; a quest's style changes the size, the materials,
// flat or soft painting, and the ink round them. This is the stand-in for
// the figure recipe Tycho's pixels layer plans: one description, several
// painters.
//
// A style: { key, h (px tall), flat, ink, coat, hair, skin, legs, boots,
// scarf, glass }. Each pose is a sprite { c, e, w, h, ax, ay } facing right,
// anchored at the feet, with `hx`, `hy` where the Lantern hangs (from the
// anchor). Poses: stand, walk0..walk3, jump, fall, climb0, climb1, sit, kneel.
// ---------------------------------------------------------------------------
const Figure = {
  cache: new Map(),
  BASE: { coat: '#3a5a8c', hair: '#c8642e', skin: '#e8b48a', legs: '#4a3a32', boots: '#2a1e1a', scarf: '#c83a32', glass: '#ffd27a' },
  ramp(hex, n = 5) { const c = Tycho.color.rgb(hex); return Tycho.color.rampOf([Tycho.color.mixRgb(c, [6, 4, 10], 0.55), c, Tycho.color.mixRgb(c, [255, 245, 230], 0.35)], n, 0.5, 0.25); },
  style(st) { return Object.assign({ key: 'base', h: 28, flat: true }, this.BASE, st || {}); },
  // the player in a pose, in a style (made once, kept)
  pose(st, pose = 'stand', left = false) {
    st = this.style(st);
    const key = st.key + ':' + st.h + ':' + pose + (left ? ':L' : '');
    let s = this.cache.get(key);
    if (!s) {
      if (left) { const r = this.pose(st, pose, false); s = Tycho.sprite.flipSprite(r); s.hx = -r.hx; s.hy = r.hy; }
      else s = this.paint(st, pose);
      this.cache.set(key, s);
    }
    return s;
  },
  // a walk's frame by distance walked
  walk(st, dist, left) { return this.pose(st, 'walk' + (Math.floor(dist / 5) & 3), left); },
  paint(st, pose) {
    const u = st.h / 30, W = Math.ceil(22 * u) + 4, H = Math.ceil(32 * u) + 3;
    const look = st.ink ? { ink: Tycho.color.rgb(st.ink) } : undefined;
    const S = st.flat ? Tycho.sprite.Shapes.figure(W, H, 7, look) : Tycho.sprite.Shapes.soft(W, H, 7, look);
    if (!st.flat && st.line) S.line = true;
    const F = H - 2, cx = W / 2, Y = (v) => F - v * u, X = (v) => cx + v * u;
    S.ax = Math.round(cx); S.ay = F;
    const coat = this.ramp(st.coat), hair = this.ramp(st.hair), skin = this.ramp(st.skin), legs = this.ramp(st.legs), boots = this.ramp(st.boots, 4), scarf = this.ramp(st.scarf, 4);
    const dark = (r) => r.map((c) => Tycho.color.mixRgb(c, [6, 4, 10], 0.32));
    // the stride: [back foot, front foot] as [dx, lift], the bob, the hand
    const walk = /^walk(\d)$/.exec(pose), ph = walk ? (+walk[1] / 4) * Math.PI * 2 : 0;
    let feet = [[-1.5, 0], [1.8, 0]], bob = 0, hand = [4.5, 15], backHand = [-3, 15.5];
    if (walk) { const s = Math.sin(ph), c = Math.cos(ph); feet = [[-3.4 * s, Math.max(0, -c) * 1.6], [3.4 * s, Math.max(0, c) * 1.6]]; bob = -0.6 * Math.abs(c); hand = [4 + 1.2 * s, 15.2]; backHand = [-2.5 - 1.2 * s, 15.6]; }
    if (pose === 'jump') { feet = [[-2.5, 3], [2.8, 1.6]]; hand = [5, 18]; backHand = [-4.5, 19]; }
    if (pose === 'fall') { feet = [[-1.5, 1.5], [2, 2.6]]; hand = [5.5, 20]; backHand = [-4.5, 20.5]; }
    if (pose === 'climb0' || pose === 'climb1') { const a = pose === 'climb0'; feet = [[-0.8, a ? 3 : 0], [0.8, a ? 0 : 3]]; hand = [2.5, a ? 26 : 23]; backHand = [-1.5, a ? 23 : 26]; }
    if (pose === 'sit') { feet = [[3, 0], [5.5, 0]]; bob = -5; hand = [5, 10]; backHand = [2, 10]; }
    if (pose === 'kneel') { feet = [[-3, 0], [3.5, 0]]; bob = -4; hand = [6, 9]; backHand = [1, 11]; }
    const hip = 13 + bob, sh = 21 + bob, head = 25.5 + bob;
    const leg = (f, back) => {
      const [dx, lift] = f, R = back ? dark(legs) : legs, B = back ? dark(boots) : boots;
      const kneeX = pose === 'sit' ? dx + 1 : dx * 0.55 + 0.6, kneeY = pose === 'sit' ? hip : pose === 'kneel' && !back ? 2 : 7 + lift * 0.6;
      const fx = dx, fy = 1.4 + lift;
      S.cap(X(back ? -0.8 : 0.8), Y(hip), X(kneeX), Y(kneeY), 2 * u, 1.7 * u, R);
      S.cap(X(kneeX), Y(kneeY), X(fx), Y(fy), 1.6 * u, 1.3 * u, R);
      S.part();
      S.cap(X(fx - 0.6), Y(fy - 0.4), X(fx + 2), Y(fy - 0.4), 1.5 * u, 1.3 * u, B);
    };
    const arm = (h, back) => { const R = back ? dark(coat) : coat; S.cap(X(back ? -1.5 : 1.5), Y(sh - 0.8), X(h[0]), Y(h[1]), 1.7 * u, 1.4 * u, R); S.part(); S.ell(X(h[0]), Y(h[1] - 0.6), 1.2 * u, 1.2 * u, back ? dark(skin) : skin); };
    // behind: the back arm and leg
    arm(backHand, true); S.part();
    leg(feet[0], true); S.part();
    leg(feet[1], false); S.part();
    // the coat, to the knee, a little open at the front
    const hem = pose === 'sit' ? hip - 2 : 7.5 + bob * 0.5, sway = walk ? Math.sin(ph) * 0.6 : pose === 'jump' || pose === 'fall' ? -1.5 : 0;
    S.shape([[X(-2.6), Y(sh + 0.5)], [X(2.8), Y(sh + 0.5)], [X(3.8 + sway * 0.3), Y(hem)], [X(-4 + sway), Y(hem - 0.5)]], coat, { down: 0.35 });
    S.part();
    S.box(X(-3.2), Y(hip + 1.6), X(3.4), Y(hip + 0.6), dark(legs)); // a belt
    S.part();
    // the scarf, its tail behind
    S.cap(X(-2.4), Y(sh + 0.8), X(2.4), Y(sh + 0.8), 1.4 * u, 1.4 * u, scarf);
    S.cap(X(-2), Y(sh + 0.4), X(-4.5 - sway), Y(sh - 3.5), 1.1 * u, 0.8 * u, dark(scarf));
    S.part();
    // the head: a face turned three-quarters toward the way they face, hair over it
    S.ell(X(0.3), Y(head), 3.2 * u, 3.5 * u, skin);
    S.part(false);
    S.ell(X(-0.8), Y(head + 1.5), 3.4 * u, 2.6 * u, hair);
    S.cap(X(-2.8), Y(head + 0.5), X(-2.6), Y(head - 2.5), 1.4 * u, 1.1 * u, hair);
    S.px(X(1.6), Y(head - 0.2), [30, 20, 24]);
    S.part();
    // the front arm, reaching for where the Lantern hangs
    arm(hand, false);
    const spr = S.done();
    spr.hx = Math.round(X(hand[0] + 0.3)) - spr.ax; spr.hy = Math.round(Y(hand[1] - 1.5)) - spr.ay;
    return spr;
  },
  // the Lantern in a style: a little frame round a lit glass, its glass on
  // the glow picture. Anchored at its handle.
  lantern(st) {
    st = this.style(st);
    const key = 'lantern:' + st.key + ':' + st.h;
    let s = this.cache.get(key);
    if (s) return s;
    const u = Math.max(1, st.h / 30), W = Math.ceil(7 * u) + 2, H = Math.ceil(10 * u) + 2;
    const look = st.ink ? { ink: Tycho.color.rgb(st.ink) } : undefined;
    const S = st.flat ? Tycho.sprite.Shapes.figure(W, H, 3, look) : Tycho.sprite.Shapes.soft(W, H, 3, look);
    const cx = W / 2, metal = this.ramp('#6a5a48', 4), glass = Tycho.color.rgb(st.glass);
    S.ax = Math.round(cx); S.ay = 1;
    S.limb(cx - 1.2 * u, 1.5, cx + 1.2 * u, 1.5, 1, metal); S.part();
    S.box(cx - 2.6 * u, 2.5 * u, cx + 2.6 * u, 3.6 * u, metal); S.part();
    for (let y = Math.round(3.6 * u); y < Math.round(8.2 * u); y++) for (let x = Math.round(cx - 2 * u); x <= Math.round(cx + 2 * u); x++) {
      const edge = x === Math.round(cx - 2 * u) || x === Math.round(cx + 2 * u);
      S.px(x, y, edge ? metal[1] : Tycho.color.mixRgb(glass, [90, 40, 0], (y - 3.6 * u) < 2 * u ? 0.3 : 0.45), !edge); // (added to itself as it glows)
    }
    S.part();
    S.box(cx - 2.6 * u, 8.2 * u, cx + 2.6 * u, 9.4 * u, metal);
    s = S.done();
    this.cache.set(key, s);
    return s;
  },
  // a sprite at (x, y) on g: its anchor there, its glow added over it
  draw(g, s, x, y, alpha = 1) {
    const dx = Math.round(x - s.ax), dy = Math.round(y - s.ay);
    if (alpha !== 1) g.globalAlpha = alpha;
    g.drawImage(s.c, dx, dy);
    if (s.e) { g.globalCompositeOperation = 'lighter'; g.drawImage(s.e, dx, dy); g.globalCompositeOperation = 'source-over'; }
    if (alpha !== 1) g.globalAlpha = 1;
  },
  // the player and the Lantern together: the body's feet at (x, y), facing
  // left or right; returns where the Lantern's glass is (for its light)
  player(g, st, pose, x, y, left, o = {}) {
    const s = this.pose(st, pose, left), L = this.lantern(st);
    const hx = x + s.hx, hy = y + s.hy + (o.swing || 0);
    if (o.belt) { this.draw(g, s, x, y); return [x, y - s.h * 0.4]; }
    this.draw(g, s, x, y);
    this.draw(g, L, hx, hy);
    return [hx, hy + L.h * 0.5];
  },
  // a soft round light: additive, warm at the middle, gone at r
  halo(g, x, y, r, col = 'rgba(255,200,110,', k = 0.35) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col + k + ')'); gr.addColorStop(0.4, col + k * 0.35 + ')'); gr.addColorStop(1, col + '0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over';
  },
};
