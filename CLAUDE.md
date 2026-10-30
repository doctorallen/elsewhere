# CLAUDE.md

Guidance for AI agents (and people) working in this repository.

Elsewhere is a game with no main quest: an epic opening that hands you one mission, and then nothing but side quests, each its own small world with its own look, people and way of playing. It's a phone-first pixel game in plain JavaScript on Tycho (a git submodule at `vendor/tycho`), with Tyrell's minds for the people. Read `DESIGN.md` for the game, `PLAN.md` for how it's being built, and each quest's `README.md` beside its script.

## Commands

```sh
git submodule update --init   # Tycho, the engine (with Tyrell), at vendor/tycho
npm install                   # the test tools only (puppeteer-core); the game installs nothing
npm test                      # check.sh, quests.js, golden.js, smoke.js
npm run check                 # the static checks
npm run quests                # every quest's declaration, and the handoffs' graph
npm run smoke                 # the slice played through on a phone; `node test/smoke.js <id>` for one quest
npm run golden                # each quest's first frame against test/golden.json (golden:update when meant)
node test/look.js <id> 200 800 # screenshots of a quest as its bot plays it, for building one
```

The browser tests use Chrome through puppeteer-core: `$CHROME`, or Google Chrome in /Applications on a Mac. Open the game with `npx http-server` or any static server; `?dev` shows the dev panel, `?quest=<id>&way=<way>` starts a quest on a save of its own.

## Layout

- `index.html`: the page. Tycho, Tyrell and the bridge, then the shell (`js/`), then each quest, then `js/main.js`.
- `js/`: the shell, what crosses worlds. `shell.js` (the registry, the current quest, its `ctx`, the handoff), `view.js` (the pixel canvas), `pad.js` (the controls, built per quest), `figure.js` (the player and the Lantern in any style), `save.js`, `log.js` (the quest log and the pack), `talk.js` (the talk box over Voice), `narrate.js`, `snd.js`, `dev.js`, `pwa.js`, `main.js`.
- `quests/<id>/`: one quest: `<id>.js` (its declaration and everything it needs) and `README.md` (its page).
- `test/`: the checks and the browser tests; `test/out/` (screenshots) isn't committed.

## Rules

- **A quest is one closure.** Its script is `'use strict'`, then `(() => { ... Elsewhere.quest({...}); Elsewhere.handoff(...); })();`. No globals (`test/check.sh` fails on one). It reads the shell's globals (Tycho, Tyrell, Figure) but never changes the shell's state except through `ctx`, and never touches another quest.
- **The shell owns what crosses worlds**: the Lantern, the pack, the log, the player's name, the save, the handoff, the loop. A quest owns its world: its view, look, controls, people and rules. The fields a quest declares are listed at the top of `js/shell.js`.
- **Every quest has a bot.** `q.bot()` gives the controls for the step (or pushes taps), and the first answer of every talk moves the quest on, so `node test/smoke.js <id>` plays it to its end.
- **The rule of the game:** no quest advances the main quest, and no quest is about the Hollow, the Lanterns or the Spire. Nobody in any world knows what a main quest is; "side quest" is said only in the log.
- **Determinism.** Anything painted or simulated draws from `ctx.rng(name)`, `ctx.seed` or `Tycho.seed`, never `Math.random` or the clock. `Tycho.seed.fxRand` is for sparkle nothing saves (flames, glints).
- **State is plain JSON.** A quest's `save()` returns what it needs to resume; its people are stashed by the shell through the bridge.
- **Draw within Tycho's GPU stand-in.** Each frame, quests draw on `View.g` with fillRect, drawImage, alpha, the four blends, transforms and gradients only, so the renderer can move onto `Tycho.gpu`. Offscreen canvases (pictures painted once) may use anything.
- **Engine changes go to Tycho**, as options any game can use, with Tycho's own rules (see `vendor/tycho/CLAUDE.md`), never as edits inside `vendor/tycho` here.

## Conventions

- American English everywhere. Comments and docs in plain English; each file opens with a comment saying what it is and why.
- Commits have short sentence-case subjects. Commit the new `test/golden.json` with a change that's meant to change a quest's picture.
