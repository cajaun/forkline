from __future__ import annotations

from dataclasses import dataclass

import chess


@dataclass(frozen=True)
class Opening:
    name: str
    moves: tuple[str, ...]

    # plays the book moves from the start so each line gets a legality check
    def board(self) -> chess.Board:
        board = chess.Board()
        for uci in self.moves:
            board.push_uci(uci)
        return board


# open and semi open and closed lines so each evaluator meets varied pawn structures
OPENINGS: tuple[Opening, ...] = (
    Opening("Italian Game", ("e2e4", "e7e5", "g1f3", "b8c6", "f1c4")),
    Opening("Sicilian Defence", ("e2e4", "c7c5")),
    Opening("French Defence", ("e2e4", "e7e6")),
    Opening("Queen's Gambit", ("d2d4", "d7d5", "c2c4")),
    Opening("King's Indian Defence", ("d2d4", "g8f6", "c2c4", "g7g6")),
    Opening("Caro-Kann Defence", ("e2e4", "c7c6")),
    Opening("English Opening", ("c2c4", "e7e5")),
    Opening("Ruy Lopez", ("e2e4", "e7e5", "g1f3", "b8c6", "f1b5")),
    Opening("Scandinavian Defence", ("e2e4", "d7d5")),
    Opening("London System", ("d2d4", "d7d5", "c1f4")),
)


# games come in pairs on one opening with each agent taking White once
def opening_for_game(game_number: int) -> Opening:
    return OPENINGS[((game_number - 1) // 2) % len(OPENINGS)]
