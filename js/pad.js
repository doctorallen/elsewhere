'use strict';
// ---------------------------------------------------------------------------
// The controls, declared by each quest and built fresh when it starts. A
// quest picks a layout:
//   'stick'  a stick wherever the left thumb lands, and up to two buttons on
//            the right (`a`, `b`: their labels, or null for none)
//   'tap'    taps and drags on the view itself, in the view's pixels
//   'none'   nothing but the talk's answers and the screens' buttons
// On a desktop the keys always work: arrows or WASD, Space for `a`, E or
// Enter for `b`. Under it all is Tycho's Controls: a quest reads `move`,
// `take('a')`, `held('b')`; a test drives the bot.
// ---------------------------------------------------------------------------
const Pad = {
  C: null, layout: 'none', off: [],
  // taps and drags since the quest last looked (the 'tap' layout)
  taps: [], down: null,
  start(o = {}) {
    this.stop();
    this.layout = o.layout || 'none';
    const C = (this.C = new Tycho.input.Controls({
      keys: Object.assign({ ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'a', KeyK: 'a', KeyE: 'b', Enter: 'b', KeyJ: 'b' }, o.keys || {}),
      axes: { left: 'left', right: 'right', up: 'up', down: 'down', round: !!o.round },
      presses: ['a', 'b'],
      stick: { radius: 40, dead: 6, inside: true, onChange: (s) => this.drawStick(s) },
      bot: { x: 'x', y: 'y', held: { a: 'a', b: 'b' }, press: { a: 'aHit', b: 'bHit' } },
      blocked: () => Shell.modal(),
      guard: 0.3,
    }));
    const L = { keyboard: window, prevent: ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] };
    if (this.layout === 'stick') {
      L.stick = $('stickzone');
      L.buttons = {};
      for (const k of ['a', 'b']) {
        const b = $(k === 'a' ? 'bA' : 'bB'), label = o[k];
        b.hidden = !label; b.textContent = label || '';
        if (label) L.buttons[k] = b;
      }
      $('pads').hidden = false; $('stickzone').hidden = false;
    } else { $('pads').hidden = true; $('stickzone').hidden = true; }
    this.off.push(C.listen(L));
    if (this.layout === 'tap') {
      const cv = View.cv;
      const at = (e) => View.at(e.clientX, e.clientY);
      const dn = (e) => { if (Shell.modal()) return; const [x, y] = at(e); this.down = { id: e.pointerId, x, y, x0: x, y0: y, t: performance.now() }; this.taps.push({ kind: 'down', x, y }); };
      const mv = (e) => { if (!this.down || this.down.id !== e.pointerId) return; const [x, y] = at(e); this.down.x = x; this.down.y = y; this.taps.push({ kind: 'move', x, y }); };
      const up = (e) => { if (!this.down || this.down.id !== e.pointerId) return; const [x, y] = at(e); this.taps.push({ kind: 'up', x, y, tap: Math.hypot(x - this.down.x0, y - this.down.y0) < 4 }); this.down = null; };
      cv.addEventListener('pointerdown', dn); addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
      this.off.push(() => { cv.removeEventListener('pointerdown', dn); removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); });
    }
  },
  stop() {
    for (const f of this.off) f();
    this.off = []; this.taps = []; this.down = null;
    if (this.C) this.C.block();
    this.C = null; this.drawStick(null);
  },
  update() { if (this.C) this.C.update(); },
  // a button shown or hidden while the quest runs (Use, with nothing in reach)
  show(k, on) { const b = $(k === 'a' ? 'bA' : 'bB'); if (b.textContent) b.hidden = !on; },
  get move() { return this.C ? this.C.move : { x: 0, y: 0 }; },
  take(a) { return this.C ? this.C.take(a) : false; },
  held(a) { return this.C ? this.C.held(a) : false; },
  // the taps and drags waiting, taken
  events() { const t = this.taps; this.taps = []; return t; },
  // a test's taps
  push(ev) { this.taps.push(ev); },
  block() { if (this.C) this.C.block(); this.down = null; },
  drawStick(s) {
    const el = $('stick');
    if (!s) { el.hidden = true; return; }
    el.hidden = false; el.style.left = s.bx + 'px'; el.style.top = s.by + 'px';
    const dx = s.x - s.bx, dy = s.y - s.by, d = Math.hypot(dx, dy), k = d > 40 ? 40 / d : 1;
    $('knob').style.transform = `translate(${dx * k}px, ${dy * k}px)`;
  },
};
