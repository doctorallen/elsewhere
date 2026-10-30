'use strict';
// ---------------------------------------------------------------------------
// The save: one object in one key, on Tycho's save store. The shell's part
// is what crosses worlds (the seed, the name, whether you have the Lantern,
// the pack, the log, the quests done); the current quest's part is `q`, its
// own plain JSON, with `minds`, its Tyrell world, stashed by the bridge.
// ---------------------------------------------------------------------------
const SAVE_KEY = 'elsewhere.save.v1';
const Save = {
  store: null, last: 0,
  get data() { return this.store.data; },
  fresh() {
    return {
      v: 1,
      // the run's seed: the quests' worlds and the deck are drawn from it
      seed: 'run-1',
      name: '',
      lantern: false,
      // the main quest: in the log from the moment Aster gives it
      main: false,
      // the quest under way, the way in, its checklist, and its own state
      quest: null, way: null, checks: [], q: null, minds: null,
      // finished quests, newest last: { id, title, souvenir, note }
      done: [],
      // the souvenirs: { id, name, from }
      pack: [],
      // the player's own lines in the log, by quest id
      notes: {},
      // what the log hasn't been looked at since (a gold button)
      unread: false,
    };
  },
  // dev: a save of its own, begun already (the Lantern given, the log open)
  init(dev) {
    this.store = new Tycho.save.Store({
      key: dev ? SAVE_KEY + '.dev' : SAVE_KEY,
      fresh: () => (dev ? Object.assign(this.fresh(), { name: 'Wren', lantern: true, main: true }) : this.fresh()),
      accept: (s, f) => s && s.v === f.v,
      keepUnread: true,
      onRefused: () => Shell.toast("Progress can't be saved in this browser."),
    });
    if (dev) { this.store.data = this.store.o.fresh(); return false; }
    this.store.load();
    return this.store.loaded && !!this.data.quest;
  },
  write() { Shell.stash(); this.store.write(); this.last = Shell.t; },
  wipe() { this.store.wipe(); },
};
