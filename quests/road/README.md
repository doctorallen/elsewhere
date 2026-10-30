# The Last Lantern (the opening)

`road.js`. The first five minutes, played completely straight: the game has to look like it means it, or the joke never lands. It's the one quest the shell treats as the opening (`opening: true`): it has no souvenir and no checklist, and it isn't written in the log as done.

| Part | |
| --- | --- |
| **The ask** | Old Aster, dying: carry the Lantern east along the Road to the Spire, and don't let anything turn you aside |
| **The world** | Three scenes, side-on, soft painterly strokes. A dusk sky with the Hollow in it, a vast hooded shape, and seven lights on the hills going out one by one. A stone room at night, lit by a fire. The Lantern Road, with the Spire on the far horizon and the Hollow's wisps at the edges of the screen |
| **The play** | Walk and jump on Tycho's platform runner, and listen. The stick and Jump, the Use button for Aster and the door |
| **The people** | Aster and Mrs. Pell, in one Tyrell world, talking through Voice |
| **The turn** | Mrs. Pell, on her doorstep: "My cat's on the roof. Would you mind?" |
| **The end** | She thanks you, and the drainpipe's round the side |
| **The handoff** | `doorstep`, to Mrs. Pell's cat |

The scenes:

1. **The cold open.** The narrator, a line at a time (tap to move on): the seven Lanterns, the Hollow, the one still burning. The title, *The Last Lantern*, over the sky. Then "Bearer, what are you called?", and the name you give is the one every world uses.
2. **Aster.** Kneel by the cot and Aster talks: the Lanterns, the mission, "whatever happens, don't stop". When it's said, Aster is gone; you take up the Lantern, and the log opens with one entry, **Main quest: Carry the Lantern to the Spire**, its bar at zero.
3. **The Road.** A boulder, a stream with a stepping stone, a fallen log, a milestone pointing east. At the end, a whitewashed cottage, a cat on the ridge of its roof, and a woman waving you over. She stops you whether you meant to stop or not.

The Road is kept as data, because the ending comes back to it: one screen and a half along, Mrs. Pell's door behind you.

The score is slow strings in a minor key, with a gong under the narrator's darkest lines.

**Its bot** walks to Aster and presses Use, then walks to the door, then walks east, jumping whatever is ahead and any gap, until Mrs. Pell stops it. The test answers every talk with its first answer and calls itself Wren.
