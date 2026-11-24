from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class LoggedMove:
    ply: int
    color: str
    agent: str
    san: str
    uci: str
    fen: str
    score: int
    nodes: int
    cutoffs: int


# one finished match game with every agent move and the search effort behind it
@dataclass(frozen=True)
class MatchResult:
    game_number: int
    white_agent: str
    black_agent: str
    result: str
    termination: str
    moves: tuple[LoggedMove, ...]
    opening: str | None = None
    opening_moves: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, object]:
        return {
            "game_number": self.game_number,
            "opening": self.opening,
            "opening_moves": list(self.opening_moves),
            "white_agent": self.white_agent,
            "black_agent": self.black_agent,
            "result": self.result,
            "termination": self.termination,
            "moves": [asdict(move) for move in self.moves],
        }
