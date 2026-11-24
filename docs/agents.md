# Search and agents

Cajaun Campbell (620169526) built both agents, the shared search, the match harness and the app.

## Minimax with Alpha-Beta pruning

[`server/chess/search.py`](../server/chess/search.py) holds one search class, `MinimaxAlphaBeta`, and both agents run it. An agent differs from the other agent in its evaluation function alone.

Minimax treats chess as two players taking turns. The search plays out every legal move to a fixed depth, scores the positions it reaches, and passes those scores back up the tree. On the agent's own turns it keeps the highest score. On the opponent's turns it keeps the lowest, because it assumes the opponent picks the reply that hurts the agent most. The root move with the best backed-up score becomes the agent's move.

Alpha-Beta pruning skips branches that cannot change that choice. The search carries two numbers down the tree. Alpha holds the best score the agent can already force, and beta holds the best score the opponent can already force. Once a branch shows a score outside that window, the player above it would avoid the branch, so the search stops looking at its remaining moves and counts a cutoff.

The search adds three pieces that make pruning cut more:

- **Move ordering.** `ordered_moves` tries checks first, then captures of valuable pieces, then promotions. Strong moves early tighten alpha and beta sooner.
- **A transposition table.** The search stores scores by position, depth and side. If two move orders reach the same position, it reuses the stored score or bound instead of searching again.
- **Terminal scores.** Checkmate scores 100,000 minus the distance to mate, so the agent prefers a faster win and a slower loss. A draw scores zero.

The app's Gameplay setting sets the depth from 1 to 5 plies for each agent.

## The two strategies

Both agents count material the same way: pawn 100, knight 320, bishop 330, rook 500, queen 900. The rest of each evaluation in [`server/chess/evaluation.py`](../server/chess/evaluation.py) pulls the agents toward different games.

### Material + Mobility

This agent plays for activity. On top of material it adds:

- 7 points for each legal move it has beyond the opponent's count
- a bonus for pieces on d4, e4, d5 and e5
- 15 points for each castling right it keeps

Mobility rewards open lines, so the agent trades pawns, opens files and brings pieces out to squares with many moves. It treats an attack on the opponent's pieces as progress, because each threatened piece loses squares.

### King Safety + Position

This agent plays for structure. On top of material it adds:

- 18 points for each pawn in front of its king and a penalty for each gap
- a 45 point penalty when its king sits in check
- penalties for doubled and isolated pawns and a small reward for advanced pawns
- 8 points for each knight or bishop off its home rank

It keeps pawns at home in front of the king and avoids pawn moves that weaken its structure. It has no reason to seek open lines or chase pieces.

### How they differ

The first agent asks how many moves each side has. The second asks how safe each king is and how sound the pawns are. Those questions lead to opposite pawn moves. Material + Mobility pushes and trades pawns to free its pieces. King Safety + Position holds its pawns still to keep its shelter and its structure scores.

The mobility term costs more to compute, since the agent generates legal moves for both sides at every leaf. In the depth 2 match it searched 175 nodes and made 36 cutoffs per move on average, against 156 nodes and 22 cutoffs for King Safety + Position. Its active positions give it more checks and captures, which the move ordering tries first, so more of its branches end in cutoffs.
