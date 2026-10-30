# Elsewhere: the plan

How to build what [DESIGN.md](DESIGN.md) describes, October 2026. The first slice (the opening and three quests, about twenty minutes) comes first and is planned in detail. Everything after it is planned only far enough to keep the slice from painting the game into a corner.

## The approach

Three choices shape the rest.

1. **The slice runs on Tycho as it stands.** The brief lists five things the engine would need added (cartridges, a figure recipe, people across worlds, several control schemes, `gen`). The slice needs none of them in Tycho itself. Tycho already provides what a hand-made version needs. `Controls.listen()` returns a function that unhooks the controls. `Painter.reset(level)` drops the painted chunks. The GPU atlas holds its pictures by `WeakRef`, so a quest's sprites go when nothing points at them. And `Tyrell.create()` makes a fresh world. The shell builds each of these per quest and lets it go after. Once three quests have shown what a cartridge actually needs, it moves into Tycho as options. Designing the engine change before that would be guessing.
2. **A quest is one object, not a pile of globals.** The other games are plain scripts that share one scope (`test/check.sh` fails on a name declared twice). With forty quests that scope gets crowded fast, and nothing could ever be unloaded. So each quest's scripts sit inside a closure and register a single object: `Elsewhere.quest({ id, ... })`. The shell is the only thing with globals. That keeps quests apart now and makes them unloadable later.
3. **The shell owns everything that crosses worlds, and a quest owns its world.** The Lantern, the pack, the log, the player's name, the save, the handoff and the loop belong to the shell. The view, the look, the controls, the people and the rules belong to the quest. The shell hands each quest a small `ctx` and never reaches inside one.

## The quest contract

Every quest answers the brief's seven questions in a single declaration. This is the shape to build to; the slice will change the details.

```js
Elsewhere.quest({
  id: 'pell',
  title: "Mrs. Pell's cat",
  // the brief's table
  ask: "My cat's on the roof. Would you mind?",
  view: 'side',                      // 'side' | 'top' | 'room' | 'text'
  hold: 'landscape',                 // 'landscape' | 'portrait' | 'any'
  accepts: ['street'],               // the ways in it can take
  offers: ['cellar'],                // the ways out it can give
  souvenir: { id: 'saucer', name: 'A saucer', sprite: [...] },
  checklist: ['Get on the roof', 'Follow the cat', 'Bring it home'],

  // the world, built when the quest starts and dropped when it ends
  look:     { palette, light, post, figure },  // the player and the Lantern drawn in this style
  controls: { keys, axes, presses, stick, layout: 'stick+2' },
  guide:    [ /* the first minute's steps: Tycho.guide */ ],
  people:   (world) => { /* Tyrell definitions: needs, places, routines, Voice lines */ },

  start(ctx, way, saved) { /* way: the handoff it came in by; saved: its own state, or null */ },
  step(dt) {},
  draw(gpu) {},
  save() { return { /* plain JSON */ }; },
  end() {},                          // let go of everything it made
});
```

What the shell gives a quest in `ctx`:

| `ctx.` | What it is |
| --- | --- |
| `player` | The name, and `figure(style)`: the player's sprite in this quest's style (a slice stand-in for the planned figure recipe) |
| `lantern` | `sprite(style)` and `where` (in hand or on the belt), so every world can draw it lit |
| `pack` | `has(id)` and `list()`, read only: quest-givers can notice what you carry |
| `log` | `tick(i)` for a checklist line, and `note(text)` for the player's own line in the log |
| `say(person, topic)` | A conversation through Voice, in the shell's dialogue box |
| `controls` | The quest's `Tycho.input.Controls`, built from its declaration and already listening |
| `seed` | The quest's seed, made from the save's seed and the quest's id (a replay from the log uses the same one) |
| `done(way)` | The quest is over: the souvenir goes in the pack, the log updates, and the handoff `way` picks the next quest |
| `fail(to)` | A detour, not a death: move to a fallback spot in the same quest (the neighbor's garden) |

## Phase 0: the repository

Set it up the way the White Dragon is set up, so CI, deploys and tests work like the others from the first day.

- `vendor/tycho` as a git submodule, pinned.
- `index.html` loading `tycho.js`, `tyrell.js`, `tycho-minds.js`, then `js/` (the shell), then `quests/<id>/*.js`.
- `css/`, `icons/`, `manifest.webmanifest`, `sw.js` importing Tycho's worker with its `__BUILD__` stamp.
- `test/check.sh`, adapted from the White Dragon's: every script parses, `index.html` and the files on disk agree, no global is declared twice in `js/`, and **a quest declares no globals at all** (only an IIFE and `Elsewhere.quest`). Seeded randomness only in `quests/` and the shell's painting.
- `.github/workflows/pages.yml`, copied from the White Dragon's with the copy step pointed at `quests/`.
- `package.json` with `puppeteer-core` for the tests, as the others have it.
- A `CLAUDE.md` for the repository: the contract above, the layout, and the rules (no quest touches another quest or the shell's state; everything a quest saves is plain JSON).

**Done when** an empty page deploys to Pages with CI green.

## Phase 1: the shell

Build the frame that every quest runs inside, using one throwaway test quest (a gray room with a door) that it can start, play, save and leave.

- **`js/shell.js`**: boot, the fixed-step loop (`Tycho.loop.Stepper` and `Governor`, as in the White Dragon's `main.js`), and the current quest. Starting a quest builds its controls, painter, Tyrell world and guide. Ending one calls `end()`, runs the controls' unlisten, resets the painter and lets the world go. Switching quests fades out, swaps, then fades in.
- **`js/quests.js`**: the `Elsewhere.quest` registry, a check of each declaration (a missing field fails loudly in dev and in the tests), and the handoff table. In the slice that table is written by hand: `{ from: 'pell', way: 'cellar' } → 'frogs'`.
- **`js/save.js`**: a `Tycho.save.Store` holding the shell's state (seed, name, pack, log, the current quest and the way it came in) and the current quest's state under `quest:<id>`, along with its Tyrell world through `TychoMinds.stash`/`restore`. It saves on `visibilitychange` and `pagehide`, as the White Dragon does.
- **`js/pack.js`**: `Tycho.items.things` for the souvenirs, which are only ever looked at.
- **`js/log.js`**: the quest log screen. The main quest sits at the top with its bar at zero and a flavor line that changes with how many quests are done, then the current quest with its checklist, then finished ones with their souvenirs. Newest goes at the top, so the main quest really does get pushed down the page.
- **`js/talk.js`**: one dialogue box over Voice for every quest. The quest supplies the look and the shell the box. (Restyling it per quest can wait.)
- **`js/hud.js`**: the controls laid out per quest (`stick+2`, `drag`, `buttons`), the log button, and the quest's title card as it starts.
- **Rotation**: each quest's `hold` sets the layout. A quest that wants landscape asks you to turn the phone with a plain card, not a lock.
- **Dev**: `Tycho.dev` with a Quests tab: jump to any quest by any way in, finish the current one, give a souvenir, read the save. The minds inspector for the current quest's people.

**Done when** the test quest starts, can be saved and reloaded mid-quest, ends, and hands off to itself, and the log and pack show it.

## Phase 2: the opening

This is the part that has to be played completely straight. It is one quest as far as the shell is concerned (`id: 'road'`), with three scenes.

1. **The cold open.** A title card reading *The Last Lantern* over a painted sky, the narration on screen line by line, and a monstrous shape in the clouds. Strings from `Tycho.audio`: the one score in the slice that has to sound expensive.
2. **Aster.** One room. Aster dies, hands over the Lantern, the map and the mission, and the log opens with its single entry and the long bar. Aster is a Tyrell person, so the death is a scene Voice plays, not a cutscene.
3. **The Lantern Road.** A screen and a half of side-scrolling on `Tycho.move.Platform`: a few jumps, the Hollow at the edges, and parallax. Then Mrs. Pell's doorstep. Talking to her starts the handoff (`way: 'doorstep'`) into Mrs. Pell's cat.

The Road has to be kept, because the ending comes back to it. Build it as data the last quest can load again, with Mrs. Pell's door shown shut.

**Done when** someone who hasn't read the brief plays it and thinks they've started a fantasy game.

## Phase 3: Mrs. Pell's cat (side-on, climb)

| | |
| --- | --- |
| World | A brick terrace in late afternoon, laundry lines, flat pixel art on `Tycho.paint` |
| Play | Climbing on `Platform` with grabs and ladders (drainpipes, gutters, ledges). Stick and Jump, which the opening already taught, so this quest teaches nothing new in its controls |
| People | Mrs. Pell, the neighbor who hates the cat, and a child who knows where the cat goes: three Tyrell people with homes and a routine over a short afternoon, talking through Voice |
| The cat | Not a Tyrell person. A small hand-written chase: it waits, runs to the next spot, and waits again |
| Failure | Falling lands you in the neighbor's garden and starts the neighbor's conversation (`ctx.fail('garden')`) |
| Turn | The skylight opens onto a house with no floor |
| End | The cat comes home, the saucer goes in the pack, and the cellar door is the way out (`'cellar'`) |
| Running joke | Mrs. Pell says "That's a nice lamp", the first time anyone notices the Lantern |

## Phase 4: the frog stall (top-down, serve)

This is the quest that tests the shell, because everything changes at once: the view, the palette, the controls (tap-and-drag) and the verb.

| | |
| --- | --- |
| World | A pond village, top-down, soft strokes (the painter's stroked mode), and a light model that is flat and bright |
| Play | One lunch rush: take orders, serve them and remember who likes what. Tap where to go and drag a bowl to a frog. The guide teaches it in the first minute |
| People | Five or six frogs, each with a Tyrell need for lunch, a regular order and patience that runs out. Regard goes up when you get their usual right |
| Turn | The mayor's order is for a fly, and the fly has a name (and is a person, with something to say about it) |
| End | The rush ends however it goes and the souvenir is a frog's hat. The way out is the pond at dusk (`'water'`) |

The time limit is the lunch rush, which counts toward the brief's "no more than two in ten".

## Phase 5: Nobody's lighthouse (one room, talk)

| | |
| --- | --- |
| World | A lighthouse at night, one room, nearly black: the light model with almost nothing lit except the Lantern |
| Play | Buttons only: a conversation through Voice with the lighthouse, which is one Tyrell person with a long file of topics |
| Sound | The sea from `Tycho.audio`, close and far as the conversation moves around the room |
| Turn | The lighthouse stopped lighting its lamp years ago and hasn't noticed |
| End | You light it (the one place in the slice where the Lantern almost matters, so be careful with it). The souvenir is a match, and the way out is a boat (`'boat'`) |

The boat hands off to a "to be continued" card for now, until there's a fourth quest.

## Phase 6: the slice, judged

The brief names four things the slice has to prove. Check each one deliberately.

1. **The opening reads as sincere.** Play-test it with three people who haven't been told anything.
2. **The first distraction is funny, and players go willingly.** Watch whether they try to walk past Mrs. Pell.
3. **Changing view and controls doesn't feel like a menu.** The handoffs between the three quests are where this succeeds or fails.
4. **Three worlds can be built in reasonable time.** **Track the hours for each quest from Phase 3 on** (world, people, play, polish). This number decides how many quests the game gets, so it is the most important thing the slice produces.

Tests at this point, modeled on the other games:

- `test/check.sh`: the static checks above.
- `test/golden.js`: one golden per quest (its painting and its sprites from its seed), with `--update`.
- `test/smoke.js`: plays the opening and all three quests end to end on a phone-sized page with the controls' bot, and checks the log and the pack at the end.
- `test/quests.js`: every registered quest declares every field, every `offers` has a quest that `accepts` it, and every quest can be reached and left (the handoff graph from the brief).
- `test/save.js`: save and reload in the middle of each quest, and the same frame comes back.

## After the slice

These are in order, each one decided only once the slice has answered its question.

1. **Cartridges in Tycho.** Turn what the shell does by hand (build and tear down controls, painter, atlas pages, audio bank, Tyrell world) into a Tycho part with a test against the three games, and give `Tycho.loader` an unload. Then quests load their scripts when the handoff fires instead of all at boot.
2. **The figure recipe in Tycho** (the pixels layer's planned `figure`): one description of the player drawn by each quest's painter. By then the three styles in the slice will show what the recipe has to cover.
3. **Controls declared per quest in Tycho.** The shell's per-quest `Controls` and layout become an option on `Tycho.input` that rebinds the stick, the buttons and the keys, and restyles the stick.
4. **The director.** A Gaff deck over six to eight quests, seeded by the save. It never repeats a view or verb twice in a row, prefers a way in that matches the way out, and keeps a few quests pinned: the first, the one a third of the way in, and the last. The handoff table becomes the fallback.
5. **Recurring faces and rumors.** A bridge feature that carries one Tyrell person's state and file on the player from one world into the next, and lifts a fact across worlds. Mrs. Pell comes back first.
6. **`gen` in Tycho's world layer**, taken from Lodestar's code, for the moor and the dig.
7. **Quests in batches of five**, each batch adding at least one new kind of play and keeping to the brief's spread (a third side-on, a third top-down, a third other; one in five only talk).
8. **The ending**, built last: the door back to the Road, the long log, the credits and the reshuffled new game.

Each Tycho change follows Tycho's own rules: a new option rather than a changed default, a test against the games already on it, a page in `docs/` and `dist/` rebuilt.

## Decisions needed before Phase 3

Most of the brief's open questions can wait for the slice. Three can't:

- **Who is the player?** The log's own lines ("I should really get back to that") need a voice. Recommendation: someone with a voice in the log and silent in the world.
- **Phone orientation.** Landscape for the side-on quests and either for the rest, or one orientation for the whole game. Recommendation: per quest, as the brief says, with a turn card. The slice will show whether turning the phone in the middle of play is too disruptive.
- **The Lantern in the lighthouse.** Lighting the lamp with it is the most natural ending for that quest, and it is also the first step toward the Lantern mattering. Recommendation: the lighthouse lights its own lamp once it remembers how, and the Lantern only sits there.

## Risks

- **Cost per quest** is the risk the brief already names. Watch the Phase 6 number closely.
- **Global scope with forty quests.** The closure rule and the check in `check.sh` should catch this. If they don't, the cartridge work moves earlier.
- **Tyrell worlds coming and going.** Making and dropping a world for each quest is new: no game so far has more than one. Test early (Phase 1's test quest) that a dropped world leaves nothing behind and that `stash`/`restore` still works when quests switch.
- **Too many looks for one renderer.** The light models and finishes differ a lot between quests. Phase 4's soft strokes and Phase 5's near-black are the cases to prove before more styles are added.
