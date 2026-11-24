from __future__ import annotations

import chess

from ..chess.agents import Player
from ..chess.notation import color_name, termination_label
from ..chess.validation import require_positive
from .openings import Opening
from .records import LoggedMove, MatchResult


# plays one game between two agents from an optional opening and logs the agent moves
def play_game(
    white: Player,
    black: Player,
    *,
    game_number: int = 1,
    depth: int | None = None,
    max_plies: int = 300,
    opening: Opening | None = None,
) -> MatchResult:
    require_positive(max_plies, "Maximum plies must be at least 1")
    board = opening.board() if opening else chess.Board()
    moves: list[LoggedMove] = []

    while not board.is_game_over(claim_draw=True) and len(moves) < max_plies:
        agent = white if board.turn == chess.WHITE else black
        color = color_name(board.turn)
        search = agent.choose_move(board, depth)
        san = board.san(search.move)
        board.push(search.move)
        moves.append(
            LoggedMove(
                ply=len(moves) + 1,
                color=color,
                agent=agent.name,
                san=san,
                uci=search.move.uci(),
                fen=board.fen(),
                score=search.score,
                nodes=search.stats.nodes,
                cutoffs=search.stats.cutoffs,
            )
        )

    # a game cut off at the ply cap counts as a draw
    outcome = board.outcome(claim_draw=True)
    return MatchResult(
        game_number=game_number,
        white_agent=white.name,
        black_agent=black.name,
        result=outcome.result() if outcome else "1/2-1/2",
        termination=termination_label(outcome) if outcome else "maximum-plies",
        moves=tuple(moves),
        opening=opening.name if opening else None,
        opening_moves=opening.moves if opening else (),
    )
