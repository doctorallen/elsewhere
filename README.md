# Elsewhere

A game with no main quest. It opens like an epic and hands you one mission; thirty seconds down the road someone asks for help finding a cat, and you never get back. Every quest after that is a side quest, and every side quest is its own small world, with its own look, its own people and its own way of playing.

A phone-first pixel game in plain JavaScript on [Tycho](https://github.com/doctorallen/tycho), the engine under [Under the White Dragon](https://github.com/doctorallen/under-the-white-dragon), [Lodestar](https://github.com/doctorallen/lodestar) and [Merryfolk](https://github.com/doctorallen/merryfolk), with Tyrell's minds for the people.

The design is in [DESIGN.md](DESIGN.md) and the plan in [PLAN.md](PLAN.md). What's built is the first slice: the opening and three quests, about twenty minutes.

| Quest | World and view | The play | Page |
| --- | --- | --- | --- |
| **The Last Lantern** (the opening) | A painted sky, a stone room, the Lantern Road; side-on | Walk, jump, listen | [quests/road](quests/road/README.md) |
| **Mrs. Pell's cat** | A brick terrace, side-on, flat pixel art | Climb after a cat | [quests/pell](quests/pell/README.md) |
| **The frog stall** | A pond village of frogs, top-down, soft strokes | Run a noodle stall for one lunch rush | [quests/frogs](quests/frogs/README.md) |
| **Nobody's lighthouse** | A lighthouse at night, one room, nearly black | A conversation | [quests/lighthouse](quests/lighthouse/README.md) |

## Playing it

It's a static page: serve the folder (any static server) and open it on a phone held sideways, or on a desktop (arrows or WASD, Space to jump, E to use, L for the log, 1–4 to answer). `?dev` shows the dev panel (jump to any quest, finish one, start over); `?quest=<id>` starts a quest on a save of its own.

```sh
git clone --recurse-submodules https://github.com/doctorallen/elsewhere
cd elsewhere && npx http-server -c-1 .
```

## Testing

```sh
npm install   # the test tools only
npm test      # the static checks, the quests' graph, the goldens, and the slice played through on a phone in Chrome
```

See [CLAUDE.md](CLAUDE.md) for the layout and the rules a quest keeps.
