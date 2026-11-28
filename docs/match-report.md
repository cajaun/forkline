# Match report

The harness in [`server/matches/harness.py`](../server/matches/harness.py) played two 10-game matches, one at depth 2 and one at depth 3, each with a 300 ply cap. Five openings each start two games, once with each agent as White. The full logs of every move and result sit in [`server/reports/match-depth-2.json`](../server/reports/match-depth-2.json) and [`server/reports/match-depth-3.json`](../server/reports/match-depth-3.json). The search is deterministic, so running the harness again gives the same games.

## Depth 2

### Scoreline

| Agent | Wins | Draws | Losses | Points |
| --- | --- | --- | --- | --- |
| Material + Mobility | 4 | 2 | 4 | 5 |
| King Safety + Position | 4 | 2 | 4 | 5 |

Eight games ended in checkmate and two in threefold repetition. A game lasted 77.4 plies on average.

| Game | Opening | White | Result | Ending |
| --- | --- | --- | --- | --- |
| 1 | Italian Game | Material + Mobility | 0–1 | Checkmate |
| 2 | Italian Game | King Safety + Position | 1–0 | Checkmate |
| 3 | Sicilian Defence | Material + Mobility | 1–0 | Checkmate |
| 4 | Sicilian Defence | King Safety + Position | 1–0 | Checkmate |
| 5 | French Defence | Material + Mobility | 1–0 | Checkmate |
| 6 | French Defence | King Safety + Position | 0–1 | Checkmate |
| 7 | Queen's Gambit | Material + Mobility | 1–0 | Checkmate |
| 8 | Queen's Gambit | King Safety + Position | ½–½ | Repetition |
| 9 | King's Indian Defence | Material + Mobility | 0–1 | Checkmate |
| 10 | King's Indian Defence | King Safety + Position | ½–½ | Repetition |

### Analysis

The match finished level, but the two agents won in different ways.

King Safety + Position won all four of its games on material. In each one Material + Mobility fell between 20 and 27 points behind before it was mated. Material + Mobility moves its pieces to the squares where they have the most moves and does not ask whether those squares are defended. King Safety + Position counts material the same way and picks up the pieces left loose.

Material + Mobility won by reaching the king. In three of its four wins, games 3, 6 and 7, it mated with material within 4 points of level. In game 3 King Safety + Position was 15 points ahead at one stage and was still mated. Its evaluation rewards a king tucked behind pawns, but it has no term for enemy pieces gathering near that king, so an attack can build while it scores the position as winning.

Both draws were repetitions. Game 8 ended 23 plies after the Queen's Gambit, with material never more than 2 points apart.

## Depth 3

### Scoreline

| Agent | Wins | Draws | Losses | Points |
| --- | --- | --- | --- | --- |
| Material + Mobility | 4 | 0 | 6 | 4 |
| King Safety + Position | 6 | 0 | 4 | 6 |

All ten games ended in checkmate. A game lasted 77.9 plies on average.

| Game | Opening | White | Result | Ending |
| --- | --- | --- | --- | --- |
| 1 | Italian Game | Material + Mobility | 0–1 | Checkmate |
| 2 | Italian Game | King Safety + Position | 0–1 | Checkmate |
| 3 | Sicilian Defence | Material + Mobility | 0–1 | Checkmate |
| 4 | Sicilian Defence | King Safety + Position | 1–0 | Checkmate |
| 5 | French Defence | Material + Mobility | 0–1 | Checkmate |
| 6 | French Defence | King Safety + Position | 1–0 | Checkmate |
| 7 | Queen's Gambit | Material + Mobility | 1–0 | Checkmate |
| 8 | Queen's Gambit | King Safety + Position | 1–0 | Checkmate |
| 9 | King's Indian Defence | Material + Mobility | 1–0 | Checkmate |
| 10 | King's Indian Defence | King Safety + Position | 0–1 | Checkmate |

### Analysis

One more ply moved the match one point toward King Safety + Position, which won 6–4 with three wins as White and three as Black.

Depth 2 covers an agent's move and the reply. Depth 3 adds the agent's next move, so a search can find a two-move tactic: attack a piece, let the opponent answer, then take it. The search has no quiescence step, so anything just past that horizon still goes unseen. The extra ply helps the agent that wins by material. All six King Safety + Position wins again came from a material lead, with Material + Mobility between 14 and 19 points behind at its worst.

Material + Mobility's four wins all came with a material lead of its own, between 6 and 12 points at the end. Game 10 was the shortest of either match: it mated King Safety + Position 16 plies after the King's Indian Defence.

Depth 3 searched far more positions per move: 1,151 for Material + Mobility and 1,581 for King Safety + Position, up from 154 and 152 at depth 2. Alpha-Beta cut 129 and 139 branches per move, up from 27 and 26.

## What the piece-square tables changed

King Safety + Position first ran without piece-square tables. Its only term for piece placement gave 8 points to a knight or bishop off its home rank. That version lost the depth-2 match 2.5–7.5 and won the depth-3 match 7–3. With the tables it puts knights and bishops near the centre, rooks on the seventh rank and its king in a castled corner, and the depth-2 match finished level at 5–5.

So the tables mattered most at the shallow depth, where King Safety + Position used to run out of good squares. At depth 3 it was already winning on material, and it still does.

## Conclusion

Neither strategy is stronger everywhere. Material + Mobility wins with fast attacks on the king when its opponent cannot see them coming. King Safety + Position wins longer games by collecting the pieces that the activity-first agent leaves loose, and each extra ply of search shows it more of those chances.

## Against the reference agent

[`server/chess/reference.py`](../server/chess/reference.py) is a basic opponent. It looks one ply ahead and picks the move that leaves it with the most material, breaking ties by checks and then captures. Each agent played it four times, twice with each colour, from the Italian Game and the Sicilian Defence.

| Agent depth | Material + Mobility | King Safety + Position |
| --- | --- | --- |
| 1 | 4 draws | 1 win, 3 draws |
| 2 | 4 wins | 4 wins |

At depth 1 both agents look exactly as far ahead as the reference agent. Seven of the eight games were drawn by repetition. King Safety + Position won the other, mating in 32 plies as Black from the Sicilian Defence. At depth 2 both agents won every game by checkmate, in 11 to 125 plies. The second ply lets an agent see the reply to its own move, so it stops making captures that lose the piece back.
