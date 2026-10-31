# Elsewhere: a brief

A design brief, October 2026. The game is not built yet; everything here is proposed.

## The pitch

Elsewhere is a game with no main quest. It opens like an epic: a prophecy, a dying mentor, a map with a red X, and one mission to set out on. Thirty seconds down the road someone asks for help finding a cat, and you never get back. Every quest after that is a side quest, and every side quest is its own small world, with its own look, its own people, its own way of playing and its own joke. A knight's errand on a side-scrolling parapet. A top-down afternoon running a noodle stall for a village of frogs. A conversation with a lighthouse. The thread between them is thin and funny: each quest ends by handing you the next, and the main quest recedes a little further every time, until the game is honest about what it is.

It's a phone-first pixel game in plain JavaScript on Tycho, the engine under Under the White Dragon, Lodestar and Merryfolk, with Tyrell's minds for the people and its director for what happens next. Each quest is a few minutes long and built by hand. The whole game is an anthology dressed as an epic, and it's for anyone who ever spent forty hours in an RPG and never finished the story.

## The opening

The first five minutes are played completely straight. The game has to look like it means it, or the joke never lands.

1. **A title card and a cold open.** Dark. A voice: the Hollow is spreading, the Seven Lanterns have gone out one by one, and the Last Lantern is in your hands. A painted sky with a monstrous shape in it. Music with strings. Nothing here is in on the joke.
2. **The mentor.** Old Aster dies in your arms in the first room, as mentors do, and gives you three things: the Lantern (a lit sprite you carry in every quest from now on), a map with the Lantern Road drawn across six regions, and the mission: carry the light to the Spire before the dark reaches the valley. The quest log opens with one entry, **Main quest: Carry the Lantern to the Spire**, and a long, important progress bar under it.
3. **The first mission.** You set out along the Lantern Road. It's a real side-scrolling walk, well built, with a few jumps and the first glimpses of the Hollow at the edges. You get about a screen and a half.
4. **The distraction.** A woman on a doorstep. Her cat is on the roof. Would you mind. The quest log adds a second entry, **Side quest: Mrs. Pell's cat**, in smaller type. You go up the drainpipe. The cat jumps across to a neighbor's roof, then into a skylight, and you follow it through into a house that isn't on the Lantern Road and isn't in this world. From here on there is no way back.
5. **The reveal that isn't one.** The main quest stays in the log for the whole game. Its progress bar never moves. Now and then a quest-giver mentions the Lantern ("That's a nice lamp"). The player works it out somewhere in the second hour, and the game never says it out loud until the end.

The Lantern matters: it's the one thing that crosses every world, so it's the player's identity, the thing that says this is still one game, and the hook for the ending.

## The rule and the pillars

The rule is simple and never broken: **no quest in the game advances the main quest, and no quest is ever about the Hollow, the Lanterns or the Spire.** Everything else follows from it.

- **Every quest is a different game.** A new place, new people, a new look, and as often as not a new way to play. Two quests in a row should never feel alike. The variety is the content; a quest that reuses the last one's world is a cut quest.
- **Each quest is complete in itself.** It has its own small problem, its own people, its own ending, and it can be understood by someone who's played nothing else. Nothing carries over except the Lantern, your name, and what the quest log remembers.
- **The quests are small and finished.** Five to fifteen minutes each, built by hand, no filler. A quest ends when its story ends, not when a counter runs out.
- **The people are real to themselves.** Quest-givers have needs, routines and opinions, run by Tyrell, and they talk through Voice. Mrs. Pell wants her cat back; she doesn't want to save the world and she isn't interested in yours.
- **The joke is never cruel.** The game loves side quests. It isn't a parody of RPGs that thinks their players are fools; it's a game for people who always do the side quests first, and it rewards them for it.
- **One game, not an anthology.** The Lantern, the quest log, the player's figure (reskinned to each world's style but recognizably them) and the running thread about the main quest hold it together. The player should feel they're getting further from home, not opening a menu of minigames.
- **Phone first, played sideways or upright as each quest asks.** Touch controls change with the quest (a stick and two buttons for a runner, a tap-and-drag for a top-down one, buttons only for a talk), each introduced in its first minute by Tycho's guide.

## The shape of a side quest

A quest is a folder of plain scripts that declares one world and one problem, and the game runs it like a cartridge. Every quest answers the same seven questions.

| Part | What it is | Example (Mrs. Pell's cat) |
| --- | --- | --- |
| **The ask** | Who wants what, said in one line by someone standing in front of you | "My cat's on the roof. Would you mind?" |
| **The world** | One hand-built place: its view (side-on, top-down, a single room, a screen of text), its palette and painting, its weather and time of day | A terrace of brick houses, side-on, late afternoon, laundry lines |
| **The play** | The one verb this quest is about, and the controls for it | Climb: drainpipes, gutters, ledges; a stick and Jump |
| **The people** | Two to six residents with homes, a routine and something to say; one of them is the quest-giver | Mrs. Pell, the neighbor who hates the cat, a child who knows where it goes |
| **The turn** | The moment the quest stops being what it looked like | The cat leads you through a skylight into a house with no floor |
| **The end** | What done means, and the goodbye | The cat delivered; Mrs. Pell gives you a saucer, which stays in your pack forever |
| **The handoff** | How the next quest finds you | The house's cellar door opens onto a beach |

Some rules of thumb:

- **Five to fifteen minutes.** Long enough for a turn, short enough that nobody has to save mid-quest (though they can; the save keeps the quest and where you are in it).
- **One new thing to learn, at most.** A quest can introduce a new control scheme or a new kind of play, but not both, and the guide shows it in the first minute.
- **The look changes every time, in one hand.** Each quest brings its own eight inks and its own place, drawn in the house style below, and the player is printed in each world's inks by the same recipe, so they're always recognizable.
- **Failure is a detour, not a death.** There's no health and no game over. Fall off the roof and you land in the neighbor's garden, where there's a different conversation.
- **It leaves a souvenir.** Every quest puts one small thing in the pack (a saucer, a frog's hat, a word in a dead language). They do nothing. The pack is the player's real progress bar.
- **It can be replayed.** From the quest log, any finished quest can be visited again, by its seed, exactly as it was.

## The house style

Chosen in October 2026 from a page of studies, across resolution, palette and point of view:

- **Isometric, 320 by 180.** The 2:1 grid at the game's own canvas size. It says what the game is: each quest a small world you could pick up.
- **Eight inks to a frame, chosen per quest.** Enough for the traveler to keep a blue coat, ginger hair and a red scarf in every world, with a few left for the place. A quest's palette is its identity, and a change of palette can be an event: dusk at the frog stall, the lamp catching at the lighthouse.
- **The frogs' rule.** A dark outline round everything, flat color inside, a few bold marks, no noise. Detail was tried at this size and took the charm out: speckle, grain and fine dithering all went. Sparse clusters of marks stand for the rest (a few bricks mean a brick wall). Fat rows of dots are the only gradient.
- **The world doesn't stop at the frame.** A hard edge reads as a floating island, so the land runs off every side and the camera moves over it (full bleed). Paint well past what's on screen.
- **Horizon, where the sky matters.** The Road keeps a fixed band of dusk behind the land, because the opening needs the Hollow standing over the valley.
- **Floating is a meaning, not a default.** Only things that are meant to float may float. The house with no floor is the one place so far.

The rules don't have to move for the look: a side-on quest keeps its platform runner, and its plane is laid along the grid (the Road along the road, the terrace along the front of the houses). Height stays height, so jumps, ladders and falls are unchanged.

## The thread

The game never shows a menu of quests. You always arrive in the next one by doing something in the last one: a door, a fall, a boat, a wrong turn, a phone ringing, waking up. The handoff is part of the quest's own story, written by hand, and each quest declares which handoffs it can offer and which it can accept (a quest that starts on a beach can be reached by any quest that ends at water).

**The director chooses.** Tyrell's Gaff holds the unplayed quests as a deck and draws the next one when a handoff fires: never the same kind of world or play twice running, favoring a quest whose way in matches the way out, with a few quests gated on what's in the pack or how far along the player is. The draw is seeded by the save, so the same player sees the same order on a replay, and different players see different orders. A handful of quests are fixed in place: the first (the cat), one about a third of the way in that first says the quiet part aloud, and the last.

**The quest log is the running joke.** It's a real, useful screen: the main quest at the top with its progress bar at zero and a line of flavor text that changes ("The dark is said to be spreading." "Somebody should probably look into the Hollow."), then every side quest, done ones with their souvenir, the current one with its checklist. Over time the side quests push the main quest down the page, until it needs scrolling to find.

**What carries across:**

- The Lantern, lit, in the player's hand or on their belt in every world's style.
- The pack of souvenirs, which quest-givers sometimes notice ("Is that one of Mrs. Pell's saucers?").
- The player's name and figure, redrawn in each world's style.
- A few people. Mrs. Pell turns up again in a later world, a different cat on a different roof, and doesn't remember you. Three or four recurring faces across the game, each a Tyrell person whose file on you carries over, so the second meeting lands differently from the first.
- Rumors. A thing you did in one world is sometimes news in the next (Tyrell's gossip, lifted across worlds as a fact the next quest's residents can talk about).

**What doesn't:** skills, levels, money, gear. There's nothing to grind and no number goes up except the count of quests done.

## A dozen sample quests

These are illustrations of the range, not a list to build. Each is a different world, a different view and a different verb; the Tycho column says which of the engine's parts does the heavy lifting.

| Quest | World and view | The play | The turn | Tycho |
| --- | --- | --- | --- | --- |
| **Mrs. Pell's cat** | A brick terrace, isometric, eight inks | Climb drainpipes and ledges after a cat | The skylight opens onto a house with no floor | Platform mover, chunked painter, Voice |
| **The frog stall** | A pond village of frogs, isometric, eight inks | Run a noodle stall for one lunch rush: take orders, serve, remember who likes what | The mayor's order is for a fly, and the fly has a name | Top-down mover, items, Tyrell routines and needs |
| **Nobody's lighthouse** | A lighthouse at night, one room, isometric, nearly black | A conversation. The lighthouse talks, and wants to know why ships have stopped coming | It stopped lighting its lamp years ago and hasn't noticed | Voice alone, the audio engine for the sea |
| **The last tram** | A city after midnight, side-on, neon and rain | Catch a tram across six stops, changing at each; the timetable is wrong on purpose | Every passenger is going to the same funeral, and it's yours | Platform mover, the light model, bloom and reflections, Bree for the passengers |
| **Mend the quilt** | A grandmother's parlor, top-down, warm | A tile puzzle: lay patches so the pattern matches the one in her head, which she describes badly | Each patch is a scene from a quest you haven't played yet | Grid, items, letter-row sprites |
| **The dig** | A hillside dig in the rain, side-on, earth tones | Dig down through strata with a brush and a trowel; what you find is logged | Three meters down there's a roof, and under it a lit room with a TV on | Grid changes, collide over tiles, the test kit's goldens for every find |
| **A word for snow** | A village of ice-fishers, top-down, white and blue | Learn eleven words of their language by watching and guessing, then use one correctly | The word you needed means "guest", and there's a feast | Cityspeak lines by rule, Tyrell's regard moving as you get words right |
| **The committee** | A village hall, a single screen of seated figures | Chair a meeting about a bench. Call on people, keep order, get a vote | Half the room has a grudge from a quest you did earlier, and it comes up | Bree's arguments and grudges, Voice, Fellowship's regard |
| **Lost on the moor** | A moor in fog, top-down, nearly monochrome | Find your way by sound alone: a bell, a dog, a stream, with the fog hiding the ground past a few tiles | The bell is on the dog | The audio engine's panning and distance, the light model as fog |
| **The orchestra pit** | Under a stage during a performance, side-on, dark wood | Keep the machinery running: pull ropes, swap scenery, cue the moon, while the show goes on above | The play being performed is the opening of this game, badly | Harm's triggers and timers reused as cues, the loop's fixed step |
| **Pigeon post** | A rooftop city of pigeon lofts, side-on, dawn | Deliver eleven letters to the right lofts, reading the addresses from clues; you can only jump | One letter is addressed to Old Aster, your dead mentor | Platform mover with coyote time, the painter's parallax layers |
| **The slow quest** | A garden allotment, top-down, through the seasons | Grow one marrow for the fair. Water it, wait, come back. Real days pass between visits | It wins. There's a rosette. That's it | Tyrell's clock against the real one, the save, the installable app's return to foreground |

The spread to aim for across the whole game: about a third side-scrolling, a third top-down, a third something else (a single room, a text screen, a puzzle, a conversation). No more than two quests in ten with a time limit. At least one in five with nothing to do but talk.

## Built on Tycho

Elsewhere is the fourth game on Tycho and the first that needs all of it at once. Each of the three games so far takes one view and one way of playing; this one takes a different slice of the engine for every quest, which is exactly what the shelf is for. A quest declares its content (places, art recipes, numbers, words) and its rules, and Tycho brings everything else. The game itself is a thin shell: the Lantern, the pack, the quest log, the director, and a loader that swaps one quest's scripts for the next's.

| Tycho part | What Elsewhere does with it |
| --- | --- |
| `seed`, `math`, `color`, `loop` | Every quest's world, painting and sprites from a seed, so a replay from the log is the same quest. One fixed-step loop for all of them |
| `gpu`, `light`, `post` | One renderer, a different light model and finish per quest: flat and bright for the frogs, bloom and wet streets for the tram, near-black for the lighthouse |
| `sprite`, `paint` | Each quest brings its own materials, ramps and shape recipes. The player's figure is one recipe drawn in each quest's style |
| `fx` | Rain, dust, the rising words, the cat's dust cloud |
| `grid`, `collide`, `move`, `path` | The side-scrolling quests on the platform mover, the top-down ones on the top-down body, both against the same collision space; flow fields and routes for the residents |
| `input` | A control scheme per quest, declared as actions: a stick and two buttons, tap-and-drag, buttons only. The gestures for the few quests with a map |
| `items` | The pack of souvenirs: things of their own, counted and shown, never used |
| `guide` | Each quest's first minute: the steps that teach its one verb |
| `harm` | Not for fighting. Its triggers, cycles and marks drive the stage machinery, the tram's doors, anything on a timer |
| `save`, `pwa` | One save holds the shell's state and the current quest's, keyed by quest id; the installable app brings the slow quest's marrow back when you return |
| `audio` | Each quest's score and sound made in code from its own recipes: the sea for the lighthouse, the fog's bell and dog on the moor |
| `ui`, `dev`, `inspect`, `loader` | Toasts and buttons, a dev drawer that can jump to any quest at any point, the minds inspector for the residents, loading a quest's scripts in slices |
| **Tyrell** | The residents of every world: needs, routines, regard and a file on the player; Voice for every conversation; Bree for what the residents say to each other and the committee's arguments; Cityspeak for every line; Gaff as the director drawing the next quest and the small events inside one; Esper's time walk for the dev tools |
| **The bridge** | The clock, seats, who's on screen and who saw what, as in the White Dragon |
| **The test kit** | A golden per quest (its painting and sprites), a smoke run that plays every quest end to end on a phone, and a run that draws the handoffs' graph and checks every quest can be reached and left |

**What the engine would need added or finished.** Each of these is a Tycho change, made for Elsewhere but as a parameter any game can use:

- **Cartridges.** A way to load one quest's scripts and unload them cleanly, with the engine's caches (painted chunks, the sprite cache, the atlas, the audio bank) reset between quests. Tycho's loader loads in slices today; it doesn't yet unload.
- **A figure recipe.** One description of a person (hair, coat, what they hold) drawn by several styles' painters. The White Dragon's `person` is one style; the pixels layer's planned `figure` part is where this belongs.
- **People across worlds.** Tyrell's world is one world. A recurring face needs their person, regard and file on the player carried from one Tyrell world into the next, and a rumor needs a fact lifted across. This is a small bridge feature.
- **Several control schemes in one game.** The controls hold one set of actions. A quest needs to declare its own set and have the stick, buttons and keys rebound, and the drawn stick restyled, when it starts.
- **The world layer's `gen`** for the few quests that want a generated place (the moor, the dig), which Lodestar has in its own code and the plan lists as next.

Nothing here breaks Tycho's rules: no defaults change, each addition is an option, and each is tested against the games already on the engine.

## Tone, the joke, and the ending

The tone is warm and dry. The worlds are strange the way Wonderland is strange: matter-of-fact about themselves, never winking. The frogs don't know they're frogs in a game; they're running a lunch service. The comedy comes from the player's situation (carrying the Last Lantern, chairing a meeting about a bench) and from the writing, never from the characters being stupid. Each quest should be able to be sad, or quiet, or sincere, and some should be. The lighthouse isn't a gag.

**The running joke has three registers,** used sparingly:

- The quest log, dead straight, with its progress bar at zero and its flavor text drifting from urgent to resigned.
- The world, in passing: the Lantern noticed and misunderstood, the mentor's name on a letter, the opening performed as a play.
- The player's own log, once a quest or so, in the voice of someone who meant to get going: "I should really get back to that."

The game never says "side quest" out loud to the player in the world, only in the log. Nobody in any world knows what a main quest is.

**The title.** The game is called Elsewhere. On the cold open's title card it reads as a fantasy word over the painted sky, and gives nothing away. Ten minutes in it starts to mean something: every quest is elsewhere, and elsewhere is the only place the game ever goes. By the end it's the riddle's answer. The main quest is here, on the Road, and you were always somewhere else. The fake epic keeps its own name, The Last Lantern, on the cold open and at the top of the log, so the two titles sit one over the other the way the two games do.

**The ending.** The game does end, after the fixed last quest, and it keeps faith with the player. The last quest is small and domestic, like the first. Done, the handoff is a door, and through it is the Lantern Road where you left it, one screen and a half along, Mrs. Pell's doorstep behind you. The log opens. The main quest is at the bottom of a very long page. You can select it. Selecting it rolls the credits over the Road, the Lantern walking on alone toward the Spire with the strings coming back in, and under the credits, in the log's small type, a last line: **Side quest: see what's at the Spire.** Then a new game is offered, with the deck reshuffled, and the quests you didn't get to.

The dark never arrives. It was never going to. That's the only thing the game ever says about it, and it says it by not saying it.

## Scope and a first slice

The full game is about forty quests, three to four hours of play, with the deck making each run's order its own. That's a lot of hand-built worlds, so the first slice proves the idea before any of that is built.

**The first slice is the opening plus three quests,** about twenty minutes:

1. The cold open, Aster, the Lantern Road, and the quest log with its one entry.
2. **Mrs. Pell's cat**, side-on, the first distraction.
3. **The frog stall**, top-down, so the second quest changes view, palette, controls and verb all at once.
4. **Nobody's lighthouse**, a conversation alone, so the third proves a quest can be nothing but Voice and still be a quest.
5. The handoffs between them written by hand (no director yet), and the log filling.

What the slice has to prove, in order: that the opening reads as sincere; that the first distraction is funny and the player goes willingly; that the view and controls can change between quests without the game feeling like a menu; that three worlds can be built in a style each in reasonable time on the engine as it stands. If the fourth doesn't hold, the game's content costs too much and the number of quests comes down before anything else does.

**After the slice:** the cartridge loading and the figure recipe in Tycho, the director over a deck of six to eight quests, the recurring faces across worlds, then quests in batches of five, each batch adding at least one new kind of play. The ending is built last, once the shape of a run is known.

**Repository and tooling,** as the other games: a new repository with Tycho as a submodule at `vendor/tycho`, plain scripts loaded by `index.html`, each quest in its own folder of scripts, `npm test` running the check, a golden per quest, the handoffs' graph and the smoke run, and every push to `main` deploying to GitHub Pages once the checks pass. A `DESIGN.md` carrying this brief, with each quest's own page beside it.

## Open questions

- [ ] **How many quests, really?** Forty is a guess at what makes a run feel like a journey. Twenty might be enough if each is richer; sixty if they're shorter. The slice's build cost per quest decides this.
- [ ] **Fixed order or a deck?** The deck gives replays and keeps the director honest about variety, but a fixed order lets the running joke build more carefully. A middle way: a few quests pinned, the rest drawn.
- [ ] **Does the player ever choose?** As written, the next quest always comes from the handoff. A quest that offers two doors (two side quests, pick one, the other waits in the deck) might feel more like a side quest than a corridor does.
- [ ] **Who is the player?** A silent figure with a name, as in the White Dragon, or someone with a voice in the log. The log's own lines ("I should really get back to that") assume the second.
- [ ] **The Lantern as a tool.** It's carried and never used. A single use per world (light a dark room, warm a frozen lock) would tie it in tighter, but every use is a step toward it mattering, which it mustn't.
- [ ] **Multiplayer rumors.** Facts lifted across worlds could, with a tiny service, be lifted across players too (someone else's cat on your roof). Probably a later game, but worth deciding against on purpose.
