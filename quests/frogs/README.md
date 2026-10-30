# The frog stall

A pond village of frogs, seen from above and painted in soft brush strokes, bright and flat. Old Ribbit's cook has gone to his sister's, and lunch is in ten minutes.

| Part | The frog stall |
| --- | --- |
| **The ask** | Old Ribbit: "My cook's gone to his sister's and lunch is in ten minutes. Would you mind?" |
| **The world** | A grassy bank in a pond, top-down, in brush strokes (`Tycho.paint.Pix`'s stroked mode). A noodle stall on a deck with a striped awning, three pots on the back counter, a front counter over a cove of lily pads, reeds and flowers. The light is flat and bright, turning gold and then violet at dusk, when the stall's lanterns are lit |
| **The play** | Serving one lunch rush (about three minutes). Frogs hop up to the counter on their lily pads. Tap a frog to take its order, tap the pot that makes it (noodles, dumplings or tea), then drag the bowl from your hands to the frog, or tap the frog. Everyone has a usual: serve a regular their usual before they ask and they're delighted. Patience runs out gently, and a frog that leaves just comes back later, still hungry |
| **The people** | Pip, Bram, Nettle, Dorrit and Sedge, the regulars. Mayor Quillon. Old Ribbit, who fishes off a pad through the rush. Horace, a fly. All are Tyrell people: lunch is a need that rises, each frog's usual and visits are variables, and regard for you rises when you get a usual right (more when you remember it) and falls a little when you keep someone waiting |
| **The turn** | The Mayor's usual is a fly. The fly is Horace, who has a wife, forty-one children and a standing appointment with a windowsill. Let him go and give the Mayor noodles ("These are rather good, actually"), or serve him up ("It was better as a hope") |
| **The end** | The rush ends however it goes. Ribbit puts a very small hat on your head (**a frog's hat**, the souvenir), the afternoon goes in washing-up, and at dusk a raft waits at the end of the bank |
| **The handoff** | The raft across the pond toward a lighthouse that's been dark for years (`water`, to Nobody's lighthouse) |

You arrive by the cellar door from Mrs. Pell's house (`cellar`). It stands on its own in the reeds, drawn flat in the terrace's style.

## Controls

The `tap` layout. Tap where to go (paths are found with `Tycho.path.AStar` over 8 px tiles, and the body moves with `Tycho.move.topdown`). Tap a frog, a pot, the fly, Ribbit or the raft to go to it and act. Drag the bowl in your hands onto a frog to serve it. A line under the view guides the first minute (`Tycho.guide`).

## The checklist

1. Put on the apron (Ribbit's talk)
2. Feed the lunch rush (the rush is over)
3. Remember someone's usual (a regular served before they ask)
4. The Mayor's order

## How its bot plays it

`bot()` taps and drags the way a thumb would, in view pixels, through `ctx.pad.push`. It taps Ribbit and answers him. Through the rush it takes an order from any frog it doesn't know yet, and cooks for the first waiting frog whose usual it knows. It drags the bowl to a frog waiting for that dish, so regulars on later visits are served before they ask. When the Mayor arrives it talks to him, then taps Horace and lets him go, then cooks the Mayor noodles. At dusk it taps the raft. A whole run takes about 10,500 steps (175 s). `node test/smoke.js frogs` plays it.
