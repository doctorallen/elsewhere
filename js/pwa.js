'use strict';
// ---------------------------------------------------------------------------
// Installing, and staying current, on Tycho's installable app. The service
// worker (sw.js) fetches from the network first; when a new deploy has taken
// over, the game saves and reloads onto it.
// ---------------------------------------------------------------------------
// the deploy stamps this with the commit, as it does sw.js
const PAGE_BUILD = '__BUILD__';
const Pwa = {
  app: null,
  init() {
    if (!/^https?:/.test(location.protocol)) return;
    this.app = Tycho.pwa.start({
      build: PAGE_BUILD, askedKey: 'elsewhere.installAsked', canAsk: () => !Shell.modal(),
      onInstalled: () => Shell.toast('Installed. Elsewhere is on your home screen.'),
      onNewer: () => { Save.write(); this.app.reload(); },
    });
  },
};
