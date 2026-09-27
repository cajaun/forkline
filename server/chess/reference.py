"""A small deterministic player used as a test reference"""

from __future__ import annotations

from dataclasses import dataclass

import chess

from .evaluation import PIECE_VALUES, material_score
from .search import SearchResult, SearchStats


@dataclass(frozen=True)
class ReferenceAgent:
    name: str = "material-reference"

    def choose_move(self, board: chess.Board, depth: int | None = None) -> SearchResult:
        if board.is_game_over(claim_draw=True):
            raise ValueError("Cannot search a finished game")

        perspective = board.turn
        best_move: chess.Move | None = None
        best_key: tuple[int, int, int, int, str] | None = None
        legal_moves = list(board.legal_moves)

        for move in legal_moves:
            # score each move from the side choosing it
            gives_check = board.gives_check(move)
            capture_value = 0
            if board.is_capture(move):
                captured = board.piece_at(move.to_square)
                capture_value = PIECE_VALUES.get(captured.piece_type, 0) if captured else 100
            board.push(move)
            score = material_score(board, perspective)
            board.pop()
            # later tuple fields resolve equal evaluations deterministically
            key = (score, int(gives_check), capture_value, int(move.promotion or 0), move.uci())
            if best_key is None or key > best_key:
                best_key = key
                best_move = move

        if best_move is None:
            raise ValueError("No legal move is available")
        return SearchResult(
            move=best_move,
            score=best_key[0],
            stats=SearchStats(nodes=len(legal_moves)),
        )
