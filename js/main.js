'use strict';
// ---------------------------------------------------------------------------
// Boot, and the loop: fixed steps of 1/60 s (at most four a frame, so a slow
// phone slows down rather than walking through walls), then a frame.
// ---------------------------------------------------------------------------
function boot() {
  View.init(); Snd.init(); Log.init(); Talk.init(); Narrate.init(); Shell.init(); Dev.init();
  const asked = Dev.asked();
  // (a quest asked for in the address plays on a save of its own)
  const loaded = Save.init(!!asked);
  const S = Save.data;
  if (asked) Shell.begin(asked.id, asked.way);
  else if (loaded) Shell.begin(S.quest, S.way, S.q, true);
  else if (S.over) Shell.over();
  else Shell.begin('road', 'start');
  addEventListener('visibilitychange', () => { if (document.hidden) Save.write(); });
  addEventListener('pagehide', () => Save.write());
  $('loading').hidden = true;
  Pwa.init();
  window.Game = { Shell, Save, View, Pad, Talk, Narrate, Log, Elsewhere, ready: true };
  // (a test can hold the loop, to step and draw by hand)
  if (!window.ELSEWHERE_HOLD) requestAnimationFrame(loop);
}
const Steps = new Tycho.loop.Stepper({ dt: 1 / 60, max: 4 });
function loop(now) {
  const dt = Steps.since(now);
  Steps.advance(dt, (h) => Shell.step(h));
  Shell.draw(dt);
  Snd.tick(dt);
  requestAnimationFrame(loop);
}
boot();
