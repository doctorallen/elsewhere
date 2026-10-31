# Mrs. Pell's cat

The first distraction, thirty seconds down the Lantern Road. A brick terrace on the isometric grid, late on a warm afternoon, running off past both ends of the frame; then the house at number nine, which has no floor.

| Part | |
| --- | --- |
| **The ask** | "My cat's on the roof. Would you mind?" Mrs. Pell, on her doorstep, as you arrive |
| **The world** | A terrace of four houses (three, five, seven and nine), slate roofs, a dormer, a taller roof at seven, an alley with washing across it, Mr. Dunmore's roses, a sky going gold. Painted with `Ink` in eight inks; the runner's side-on plane is laid along the front of the houses, so climbing and falling are unchanged. The house with no floor is the one place in the game that's meant to float |
| **The play** | Climb: a drainpipe to the gutters, a jump over the dormer, up onto seven, across the alley (or onto the washing line), on the platform runner. Stick and Jump, Use to talk |
| **The people** | Mrs. Pell, Mr. Dunmore next door (who hates the cat), and Pip on the step of seven (who knows where it goes), in a Tyrell world of their own, talking through Voice |
| **The turn** | Biscuit drops through the skylight of number nine, which has no floor: a wardrobe, a bed, a staircase, a rug with an armchair and a clock, a dresser, a table, all hanging in the dark |
| **The end** | Biscuit caught in the laundry basket and carried out of nine's front door, which opens onto the street. Mrs. Pell gives you his saucer |
| **The handoff** | "Go out through my cellar, dear. It's quicker." Her door, `cellar`, to the frog stall |

Failing is a detour: fall from the roofs and you land in Mr. Dunmore's roses (he has a new line each time); fall out of the house with no floor and you land there too. The quest keeps where Biscuit has got to.

Checklist: get up on the roof; follow Biscuit over the rooftops; catch him; bring him home. Mrs. Pell says the line about the lamp after the ask, and once he's home the log has the player's own line: "The Spire. I should really get back to that."

The save keeps the scene (`terrace` or `house`), where you are, how far the cat has got in each, and what's been said; the people's world is stashed beside it.

**The bot** (`q.bot()`, for `node test/smoke.js pell`): answers the ask, walks to the drainpipe and climbs it, walks right along the gutter jumping wherever a wall or the dormer is ahead, jumps the alley from seven's edge, waits by the skylight for Biscuit to go through and uses it; in the house it walks right and jumps at every piece's edge, uses the cat in the basket, walks off the table onto the hall floor and uses the front door; then home to Mrs. Pell and out through her cellar.
