from __future__ import annotations

from dataclasses import asdict, dataclass, field
from threading import RLock

import chess

from .agents import Player
from .notation import color_name, termination_label
from .search import SearchResult


class GameError(Exception):
    pass


class GameOverError(GameError):
    pass


class TurnError(GameError):
    pass


@dataclass(frozen=True)
class MoveRecord:
    ply: int
    color: str
    player: str
    san: str
    uci: str
    fen: str

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


# one game on the server where a missing human colour means two agents play
@dataclass
class GameSession:
    board: chess.Board
    players: dict[chess.Color, Player]
    human_color: chess.Color | None
    depth: int | None
    moves: list[MoveRecord] = field(default_factory=list)
    lock: RLock = field(default_factory=RLock, repr=False)

    @property
    def mode(self) -> str:
        return "agent-vs-agent" if self.human_color is None else "human-vs-agent"

    @property
    def human_turn(self) -> bool:
        return self.human_color is not None and self.board.turn == self.human_color

    # reads the outcome once so the returned fields agree with each other
    def state(self) -> dict[str, object]:
        with self.lock:
            outcome = self.board.outcome(claim_draw=True)
            sides = (chess.WHITE, chess.BLACK)
            return {
                "fen": self.board.fen(),
                "turn": color_name(self.board.turn),
                "legal_moves": [move.uci() for move in self.board.legal_moves],
                "is_game_over": outcome is not None,
                "result": outcome.result() if outcome else None,
                "termination": termination_label(outcome) if outcome else None,
                "mode": self.mode,
                "players": {color_name(color): self._player_name(color) for color in sides},
                "human_color": color_name(self.human_color) if self.human_color is not None else None,
                "depth": self.depth,
                "depths": {color_name(color): self._depth_for(color) for color in sides},
                "moves": [move.to_dict() for move in self.moves],
            }

    def human_move(self, uci: str) -> MoveRecord:
        with self.lock:
            self._require_turn(human=True, message="It is not the human's turn")
            return self._push(self.board.parse_uci(uci), "human")

    def agent_move(self) -> tuple[MoveRecord, SearchResult]:
        with self.lock:
            self._require_turn(human=False, message="It is the human's turn")
            player = self.players.get(self.board.turn)
            if player is None:
                raise TurnError("No agent controls the current side")
            search = player.choose_move(self.board, self.depth)
            return self._push(search.move, player.name), search

    # runs the opponent agent from the human side on a copy so the real game stays untouched
    def hint(self) -> SearchResult:
        with self.lock:
            self._require_turn(human=True, message="Hints are only for the human's turn")
            agent = next(iter(self.players.values()))
            return agent.choose_move(self.board.copy(), self.depth)

    # replays saved moves through the live checks so repetition and ply numbering carry on
    def replay(self, ucis: list[str]) -> None:
        with self.lock:
            for uci in ucis:
                self._ensure_open()
                self._push(self.board.parse_uci(uci), self._player_name(self.board.turn))

    def _player_name(self, color: chess.Color) -> str:
        player = self.players.get(color)
        return player.name if player is not None else "human"

    # a session depth applies to both sides and otherwise each agent keeps its own
    def _depth_for(self, color: chess.Color) -> int | None:
        if self.depth is not None:
            return self.depth
        return getattr(self.players.get(color), "default_depth", None)

    def _ensure_open(self) -> None:
        if self.board.is_game_over(claim_draw=True):
            raise GameOverError("Game is already over")

    def _require_turn(self, *, human: bool, message: str) -> None:
        self._ensure_open()
        if self.human_turn != human:
            raise TurnError(message)

    # checks legality before the board or the history change
    def _push(self, move: chess.Move, player: str) -> MoveRecord:
        if not self.board.is_legal(move):
            raise ValueError(f"Illegal move {move.uci()}")
        color = color_name(self.board.turn)
        san = self.board.san(move)
        self.board.push(move)
        record = MoveRecord(len(self.moves) + 1, color, player, san, move.uci(), self.board.fen())
        self.moves.append(record)
        return record
