'use strict';
// ---------------------------------------------------------------------------
// The view: one pixel canvas the size of the screen in a quest's own pixels,
// scaled up by whole steps so the art stays crisp. A quest says how many
// pixels its short side wants (`px`, 180 by default) and which way up it
// plays (`hold`); the view works out the rest. Everything a quest draws goes
// through `View.g`, a 2D context. Quests keep to what Tycho's GPU stand-in
// also takes (fillRect, drawImage, alpha, the four blends, transforms,
// gradients), so the renderer can move onto Tycho.gpu without them changing.
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const View = {
  cv: null, g: null,
  w: 320, h: 180, k: 1,
  px: 180, hold: 'any',
  // a fade over everything, 0..1, and its color
  fade: 0, fadeCol: '#000',
  init() {
    this.cv = $('view');
    this.g = this.cv.getContext('2d', { alpha: false });
    addEventListener('resize', () => this.resize());
    addEventListener('orientationchange', () => setTimeout(() => this.resize(), 120));
    this.resize();
  },
  // a quest's view: its short side in pixels and which way up it plays
  setup(o = {}) {
    this.px = o.px || 180; this.hold = o.hold || 'any';
    this.resize();
  },
  resize() {
    const W = innerWidth, H = innerHeight;
    this.k = Math.max(1, Math.floor(Math.min(W, H) / this.px));
    this.w = Math.ceil(W / this.k); this.h = Math.ceil(H / this.k);
    this.cv.width = this.w; this.cv.height = this.h;
    this.cv.style.width = this.w * this.k + 'px'; this.cv.style.height = this.h * this.k + 'px';
    this.g.imageSmoothingEnabled = false;
    $('rotate').hidden = !this.wrongWay();
  },
  // the phone held the wrong way for this quest
  wrongWay() {
    if (this.hold === 'landscape') return innerHeight > innerWidth * 1.05;
    if (this.hold === 'portrait') return innerWidth > innerHeight * 1.05 && matchMedia('(hover: none)').matches;
    return false;
  },
  // a point on the page in the view's pixels
  at(clientX, clientY) { return [clientX / this.k, clientY / this.k]; },
  // the fade, drawn over the quest's frame
  finish() {
    if (this.fade > 0) { const g = this.g; g.globalAlpha = Math.min(1, this.fade); g.fillStyle = this.fadeCol; g.fillRect(0, 0, this.w, this.h); g.globalAlpha = 1; }
  },
};
