'use strict';
// ---------------------------------------------------------------------------
// Ink: what a quest paints its pictures with, once, offscreen. A sheet holds
// palette indexes rather than colors, so a world's eight inks are a real limit
// and the same sheet can be printed in another palette (a frog stall at dusk).
//
// The house rule is the frogs': a dark outline round everything, flat color
// inside, a few bold marks, no noise. `Sheet` has the outlined shapes for it,
// `Iso` puts them on the 2:1 grid, and `traveler` is the player by that rule.
// Everything here is seeded by what it's given: the same call, the same picture.
// ---------------------------------------------------------------------------
const Ink = (() => {
  const CLEAR = 255;
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  class Sheet {
    // `dark` is the outline's ink; a sheet starts clear
    constructor(w, h, dark = 0) { this.w = w; this.h = h; this.dark = dark; this.d = new Uint8Array(w * h).fill(CLEAR); this.ox = 0; this.oy = 0; }
    // a color is a palette index, or a function (x, y) => index or -1 for nothing
    px(x, y, c) {
      x = Math.round(x - this.ox); y = Math.round(y - this.oy);
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
      const v = typeof c === 'function' ? c(x + this.ox, y + this.oy) : c;
      if (v >= 0) this.d[y * this.w + x] = v;
    }
    rect(x, y, w, h, c) { x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, c); }
    frame(x, y, w, h, c) { this.rect(x, y, w, 1, c); this.rect(x, y + h - 1, w, 1, c); this.rect(x, y, 1, h, c); this.rect(x + w - 1, y, 1, h, c); }
    line(x0, y0, x1, y1, c) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
      for (;;) { this.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    }
    disc(cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const a = (x - cx) / rx, b = (y - cy) / ry; if (a * a + b * b <= 1) this.px(x, y, c); } }
    ring(cx, cy, rx, ry, c) { const n = Math.ceil((rx + ry) * 4); let lx = null, ly; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry); if (lx !== null) this.line(lx, ly, x, y, c); lx = x; ly = y; } }
    poly(p, c) {
      let t = Infinity, u = -Infinity; for (const q of p) { t = Math.min(t, q[1]); u = Math.max(u, q[1]); }
      for (let y = Math.floor(t); y <= Math.ceil(u); y++) {
        const xs = [], Y = y + 0.5;
        for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; if ((a[1] <= Y && b[1] > Y) || (b[1] <= Y && a[1] > Y)) xs.push(a[0] + (Y - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
        xs.sort((m, n) => m - n);
        for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x <= Math.floor(xs[i + 1] - 0.5); x++) this.px(x, y, c);
      }
    }
    path(p, c, closed = false) { for (let i = 0; i + 1 < p.length; i++) this.line(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], c); if (closed) this.line(p[p.length - 1][0], p[p.length - 1][1], p[0][0], p[0][1], c); }
    // the same, outlined
    orect(x, y, w, h, c) { this.rect(x, y, w, h, c); this.frame(x, y, w, h, this.dark); }
    opoly(p, c) { this.poly(p, c); this.path(p, this.dark, true); }
    odisc(x, y, rx, ry, c) { this.disc(x, y, rx, ry, c); this.ring(x, y, rx, ry, this.dark); }
    // rows of letters, '.' clear, `map` from letter to color
    rows(rows, x, y, map, flip = false) {
      const W = rows[0].length;
      rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const v = map[r[i]]; if (v !== undefined) this.px(x + (flip ? W - 1 - i : i), y + j, v); } });
    }
    // a little mark of grass
    tuft(x, y, c) { for (const [a, b] of [[0, 0], [2, 0], [1, 1], [4, 1], [3, 2]]) this.px(x + a, y + b, c); }
    // on a canvas, in a palette of hex colors
    print(pal) {
      const c = document.createElement('canvas'); c.width = this.w; c.height = this.h;
      const g = c.getContext('2d'), im = g.createImageData(this.w, this.h), P = pal.map(hex);
      for (let i = 0; i < this.d.length; i++) { const v = this.d[i]; if (v === CLEAR) continue; const p = P[v]; im.data[i * 4] = p[0]; im.data[i * 4 + 1] = p[1]; im.data[i * 4 + 2] = p[2]; im.data[i * 4 + 3] = 255; }
      g.putImageData(im, 0, 0);
      return c;
    }
  }

  // a smooth shape through points (Catmull-Rom), closed or open
  const curve = (p, closed = true, seg = 8) => {
    const out = [], n = p.length, at = (i) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = at(i - 1), b = at(i), c = at(i + 1), d = at(i + 2);
      for (let s = 0; s < seg; s++) { const t = s / seg, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((k) => 0.5 * (2 * b[k] + (c[k] - a[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * t3))); }
    }
    if (!closed) out.push(p[n - 1]);
    return out;
  };

  // the 2:1 grid: `at(x, y, z)` from a quest's world to the picture
  class Iso {
    constructor(sheet, at) { this.s = sheet; this.at = at; }
    top(x, y, w, d, z, c) { const P = this.at; this.s.opoly([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)], c); }
    // a face looking down and left, along x; and one down and right, along y
    left(x, y, z, w, h, c) { const P = this.at; this.s.opoly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y, z), P(x, y, z)], c); }
    right(x, y, z, d, h, c) { const P = this.at; this.s.opoly([P(x, y, z + h), P(x, y + d, z + h), P(x, y + d, z), P(x, y, z)], c); }
    box(x, y, z, w, d, h, [t, l, r]) { this.left(x, y + d, z, w, h, l); this.right(x + w, y, z, d, h, r); this.top(x, y, w, d, z + h, t); }
    line(x0, y0, z0, x1, y1, z1, c) { this.s.line(...this.at(x0, y0, z0), ...this.at(x1, y1, z1), c); }
  }

  // a sprite, as Figure draws them: its canvas, and the anchor at its feet
  const sprite = (rows, map, pal, ax, ay, flip = false) => {
    const w = Math.max(...rows.map((r) => r.length)), S = new Sheet(w, rows.length);
    S.rows(rows.map((r) => r.padEnd(w, '.')), 0, 0, map, flip);
    return { c: S.print(pal), e: null, w, h: rows.length, ax: flip ? w - 1 - ax : ax, ay };
  };

  // ---- the traveler: ginger hair, a blue coat, a red scarf, 24 px by the rule ----
  const HEAD = ['.....kkkkkk.......', '...kkhhhhhhkk.....', '..khhhhhhhhhhk....', '.khhhhhhhhhhhhk...', '.khhHHhhhssshhk...', '.khhHhhssssssk....', '.khhHhsssksssk....', '.khhhhsssksssk....', '..khhhsssssssk....', '...kkhsssssskk....', '.....kkkkkkk......'];
  const BODY = ['...krrrrrrrrk.....', '..krrrrrrrrrrk....', '.krrkccccccckk....', '.krkcccccccccksk..', '.kk.kCcccccck.kk..', '....kCcccccck.....', '....kCCcccccck....', '...kCCCcccccck....', '...kkkkkkkkkkk....'];
  const STAND = ['.....kll..llk.....', '.....kll..llk.....', '.....kkk..kkk.....', '.....kkk..kkkk....'];
  const WALK = ['....kll....llk....', '...kll......llk...', '...kkk......kkk...', '..kkkk......kkkk..'];
  const BACK = ['.....kkkkkk.......', '...kkhhhhhhkk.....', '..khhhhhhhhhhk....', '.khhhhhhhhhhhhk...', '.khhHhhhhhhhHhk...', '.khhHhhhhhhhHhk...', '.khhHHhhhhHHhhk...', '.khhHHhhhhHHhhk...', '..khHHhhhhHHhk....', '...kkhhhhhhkk.....', '...krrrrrrrrk.....', '..krrrrrrrrrrk....', '.kccccrrccccck....', '.kcCcccrrcccCk....', '.kcCccccccccCk....', '..kCccccccccCk....', '..kCCcccccCCCk....', '..kCCcccccCCCk....', '..kkkkkkkkkkkk....'];
  const GLASS = ['..kk..', '.k..k.', 'kkkkkk', 'kggggk', 'kgGGgk', 'kgGGgk', 'kggggk', 'kkkkkk'];
  // look: which ink is hair (h, H), skin (s), coat (c, C), scarf (r), legs (l), glass (g, G), outline (k)
  const traveler = (pal, look) => {
    const pose = (rows, flip) => sprite(rows, look, pal, 8, rows.length - 1, flip);
    const sides = (rows) => ({ r: pose(rows, false), l: pose(rows, true) });
    return {
      stand: sides([...HEAD, ...BODY, ...STAND]), walk: sides([...HEAD, ...BODY, ...WALK]),
      away: sides([...BACK, ...STAND]), awayWalk: sides([...BACK, ...WALK]),
      lantern: sprite(GLASS, look, pal, 2, 0),
    };
  };
  return { CLEAR, Sheet, Iso, curve, sprite, traveler };
})();
