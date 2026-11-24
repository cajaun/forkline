from __future__ import annotations

from dataclasses import dataclass

import chess

from .evaluation import capture_value, material_score
from .search import SearchResult, SearchStats


# a one ply material player the tests use as a basic opponent
@dataclass(frozen=True)
class ReferenceAgent:
    name: str = "material-reference"

    def choose_move(self, board: chess.Board, depth: int | None = None) -> SearchResult:
        if board.is_game_over(claim_draw=True):
            raise ValueError("Cannot search a finished game")

        perspective = board.turn
        legal_moves = list(board.legal_moves)

        # material decides and checks then captures then the move text break ties the same way each run
        def key(move: chess.Move) -> tuple[int, int, int, int, str]:
            gives_check = board.gives_check(move)
            taken = capture_value(board, move)
            board.push(move)
            score = material_score(board, perspective)
            board.pop()
            return (score, int(gives_check), taken, int(move.promotion or 0), move.uci())

        best_key, best_move = max((key(move), move) for move in legal_moves)
        return SearchResult(move=best_move, score=best_key[0], stats=SearchStats(nodes=len(legal_moves)))
