#!/bin/sh
# Static checks: every script parses, index.html and the files agree with
# each other, no global is declared in two of the shell's files (they all
# share one scope, so the second would silently replace the first), and a
# quest declares no globals at all: it's one closure that calls
# Elsewhere.quest (and Elsewhere.handoff), nothing else at its top level.
set -e
cd "$(dirname "$0")/.."

for f in js/*.js quests/*/*.js test/*.js sw.js; do node --check "$f"; done

grep -o 'src="[^"]*"' index.html | cut -d'"' -f2 | while read -r f; do
  test -f "$f" || { echo "index.html names a missing script: $f"; exit 1; }
done
for f in js/*.js quests/*/*.js; do
  grep -q "src=\"$f\"" index.html || { echo "$f is not loaded by index.html"; exit 1; }
done
for f in $(grep -o 'href="[^"]*"' index.html | cut -d'"' -f2 | grep -v '^http' | grep -v '^#'); do
  test -f "$f" || { echo "index.html links a missing file: $f"; exit 1; }
done

# Tycho, the engine, with Tyrell inside it, is a git submodule: it must be
# checked out, and what the page loads from it there
test -f vendor/tycho/dist/tyrell.js || { echo "vendor/tycho is missing: git submodule update --init"; exit 1; }

# the service worker is Tycho's: sw.js imports it and keeps its stamp for the deploy
grep -q "importScripts('vendor/tycho/dist/tycho-sw.js')" sw.js || { echo "sw.js does not import Tycho's worker"; exit 1; }
grep -q "__BUILD__" sw.js || { echo "sw.js lost its __BUILD__ stamp"; exit 1; }
grep -q "__BUILD__" js/pwa.js || { echo "js/pwa.js lost its __BUILD__ stamp"; exit 1; }
node -e "const m = JSON.parse(require('fs').readFileSync('manifest.webmanifest', 'utf8')); for (const i of m.icons) if (!require('fs').existsSync(i.src)) { console.log('manifest.webmanifest names a missing icon: ' + i.src); process.exit(1); }"

dups=$(grep -hoE '^(function|const|let|var|class) [A-Za-z0-9_$]+' js/*.js | awk '{print $2}' | sort | uniq -d)
if [ -n "$dups" ]; then echo "declared in more than one file: $dups"; exit 1; fi

# a quest's top level is 'use strict', comments, and its closure
for f in quests/*/*.js; do
  if grep -nE '^(function|const|let|var|class) ' "$f"; then echo "$f declares a global (keep it inside the quest's closure)"; exit 1; fi
done

# painting and generation are seeded: Math.random and the clock never
if grep -nE 'Math\.random|Date\.now' js/ink.js js/figure.js js/view.js quests/*/*.js | grep -v '^\s*//'; then echo "painting and generation must be seeded (Tycho.seed, ctx.rng), never Math.random or the clock"; exit 1; fi
echo "check: ok"
