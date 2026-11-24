# Match report

The harness in [`server/matches/harness.py`](../server/matches/harness.py) played 10 games at depth 2 with a 300 ply cap. Five openings each start two games, once with each agent as White. The full log of every move and result sits in [`server/reports/match-depth-2.json`](../server/reports/match-depth-2.json).

## Scoreline

| Agent | Wins | Draws | Losses | Points |
| --- | --- | --- | --- | --- |
| Material + Mobility | 6 | 3 | 1 | 7.5 |
| King Safety + Position | 1 | 3 | 6 | 2.5 |

Seven games ended in checkmate and three in threefold repetition. A game lasted 53.5 plies on average.

| Game | Opening | White | Result | Ending |
| --- | --- | --- | --- | --- |
| 1 | Italian Game | Material + Mobility | ½–½ | Repetition |
| 2 | Italian Game | King Safety + Position | 0–1 | Checkmate |
| 3 | Sicilian Defence | Material + Mobility | ½–½ | Repetition |
| 4 | Sicilian Defence | King Safety + Position | 0–1 | Checkmate |
| 5 | French Defence | Material + Mobility | 1–0 | Checkmate |
| 6 | French Defence | King Safety + Position | 0–1 | Checkmate |
| 7 | Queen's Gambit | Material + Mobility | ½–½ | Repetition |
| 8 | Queen's Gambit | King Safety + Position | 0–1 | Checkmate |
| 9 | King's Indian Defence | Material + Mobility | 0–1 | Checkmate |
| 10 | King's Indian Defence | King Safety + Position | 0–1 | Checkmate |

## Analysis

Material + Mobility won all five games it played as Black. In games 4, 8 and 10 it finished between 17 and 23 pawns' worth of material ahead before it mated. Its evaluation rewards pieces with many moves, so it opened lines and kept attacking pieces until King Safety + Position lost them. King Safety + Position scores its own shelter and pawn structure, so it kept its pawns still while its pieces ran short of squares. At depth 2 neither agent sees far enough to defend against a slow attack, and the agent that creates threats collects the material.

The three draws all came with Material + Mobility as White and material close to level. Both agents reached a position where repeating moves scored best for each side, and neither evaluation offered a reason to break the repetition. Game 7 ended 15 plies after the Queen's Gambit for this reason.

King Safety + Position won game 9 as Black. It captured 12 times to its opponent's 3 before it mated. The mobility term counts moves and ignores whether the pieces making them can be taken, so Material + Mobility can rate a loose position above a safe one.

The scoreline follows from the two evaluations. At depth 2 the agent that rewards activity creates threats faster than the agent that rewards structure can see them coming. A deeper search would show King Safety + Position more of those threats, and I expect the gap to narrow at depth 3 or 4.
