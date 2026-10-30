'use strict';
// ---------------------------------------------------------------------------
// The service worker: makes the game installable and playable offline, but
// never stale. Tycho's worker (vendor/tycho/dist/tycho-sw.js) does the work:
// network first, the cached copy only without a network, and a new worker
// for every deploy (BUILD is replaced with the commit), which the page
// reloads onto (js/pwa.js). It keeps what index.html names.
// ---------------------------------------------------------------------------
self.TYCHO_SW = { name: 'elsewhere', build: '__BUILD__' };
importScripts('vendor/tycho/dist/tycho-sw.js');
