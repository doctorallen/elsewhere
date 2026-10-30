# Nobody's lighthouse

The third quest of the first slice: a conversation, alone, in one room. The code is [lighthouse.js](lighthouse.js).

| Part | Here |
| --- | --- |
| **The ask** | "Ships used to come round the point every night. Why did they stop?" The lighthouse asks it, about a minute after you climb in. |
| **The world** | The lamp room at the top of a lighthouse at night, one room, nearly black. It's painted flat and dithered in cold iron and night blues (`Tycho.paint.Pix`, flat, with a 4 × 4 ordered dither), and darkened every frame by a light map multiplied over it: a near-black ambient, the window's night, and the Lantern's warm pool. Only what the Lantern touches shows: the great lens, the keeper's desk and log, a chair, the hatch down to the stairs, and the sea through diamond panes. |
| **The play** | Talk, and a few steps across the room. Stick and Use, or arrows and E. Use by the desk reads the keeper's log; anywhere else it talks to the lighthouse. |
| **The people** | One: the lighthouse, a Tyrell person (Voice) with a file of subjects. The quest threads are the ships, the keeper's log, and lighting the lamp. The side threads are the keeper, the weather, your Lantern ("That's a nice lamp. Small, but honest.") and the sea. They have `about` topics and a door from one subject into the next. `learn:` notes what it tells you, and warmth grows a point with each subject talked through. One answer needs warmth 2 before it can be chosen. |
| **The turn** | The keeper's log ends on 29 October, years ago: "They say it runs itself now." It didn't. The lighthouse stopped lighting its lamp and never noticed. The ships stopped coming because there was nothing to come to. |
| **The end** | It remembers how. It isn't the match; it's wanting to be seen. It lights its own lamp while you sit by it with the Lantern on the floor, and the Lantern does nothing. The room floods with light, the beam sweeps the sea, the score turns major, and a ship far out turns in. It gives you one of the keeper's matches, which you didn't need. |
| **The handoff** | Your boat at the foot of the stairs, the tide turned (`boat`). No quest takes that way in yet, so the slice ends here. |

**Souvenir:** a match. **Checklist:** hear about the ships, read the keeper's log, ask why the lamp is dark, see the lamp lit. **Note:** "A lighthouse remembered what it was for. I ought to remember what mine is for. Soon, probably."

**Sound:** the sea is a noise swell from `Tycho.audio` every few seconds, near or far, panned by where you stand in the room. The lamp catching is a breath of flame, the ship has a bell, and the score is a sparse minor chord every other bar until the lamp is lit.

**Its bot** (for `test/smoke.js`) reads the log at the desk, talks by the lens, and goes down the stairs at the end. Every talk is played with its first answer, and the first answer of every beat moves the quest on. `where()` gives the stage and the facts set so far.

**Stages**, saved with the quest: arrive (the boat, three lines) → climb (out of the hatch) → talk1 → log → talk2 (the turn, the lighting) → lighting → ship → thanks → leave → gone. A save from before the first talk starts the arrival again.
