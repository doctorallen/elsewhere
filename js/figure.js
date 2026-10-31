'use strict';
// ---------------------------------------------------------------------------
// Drawing a sprite: Ink's, anchored at its feet, its glow (if it has one) added
// over it. The player is painted by Ink.traveler, once per palette, so they're
// the same traveler everywhere (ginger hair, a blue coat, a red scarf, the
// Lantern in hand) in whatever eight inks the world has. The pack's own
// picture of the Lantern is here too, since it belongs to no world.
// ---------------------------------------------------------------------------
const Figure = {
  // a sprite at (x, y) on g: its anchor there
  draw(g, s, x, y, alpha = 1) {
    const dx = Math.round(x - s.ax), dy = Math.round(y - s.ay);
    if (alpha !== 1) g.globalAlpha = alpha;
    g.drawImage(s.c, dx, dy);
    if (s.e) { g.globalCompositeOperation = 'lighter'; g.drawImage(s.e, dx, dy); g.globalCompositeOperation = 'source-over'; }
    if (alpha !== 1) g.globalAlpha = 1;
  },
  lantern() { return Ink.traveler(['#1a1030', '#ffc84a', '#ffe9a8'], { k: 0, g: 1, G: 2 }).lantern; },
};
