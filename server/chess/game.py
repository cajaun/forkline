"""Stateful game operations shared by the HTTP API and tests."""

from __future__ import annotations

from dataclasses import dataclass, field
from threading import RLock

import chess

from .agents import Player
from .search import SearchResult


class GameError(Exception):
    """Base error for invalid session operations."""


class GameOverError(GameError):
    """The session cannot accept another move."""


class TurnError(GameError):
    """The requested player cannot move in the current position."""


@dataclass(frozen=True)
class MoveRecord:
    ply: int
    color: str
    player: str
    san: str
    uci: str
    fen: str

    def to_dict(self) -> dict[str, object]:
        return {
            "ply": self.ply,
            "color": self.color,
            "player": self.player,
            "san": self.san,
            "uci": self.uci,
            "fen": self.fen,
        }


def color_name(color: chess.Color) -> str:
    return "white" if color == chess.WHITE else "black"


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
        # a missing human color marks an agent-vs-agent session
        return "agent-vs-agent" if self.human_color is None else "human-vs-agent"

    def state(self) -> dict[str, object]:
        with self.lock:
            # snapshot the outcome once so all returned fields agree
            outcome = self.board.outcome(claim_draw=True)
            players = {
                color_name(color): self.players[color].name if color in self.players else "human"
                for color in (chess.WHITE, chess.BLACK)
            }
            depths = {
                color_name(color): (
                    self.depth
                    if self.depth is not None
                    else getattr(self.players[color], "default_depth", None)
                )
                for color in (chess.WHITE, chess.BLACK)
            }
            return {
                "fen": self.board.fen(),
                "turn": color_name(self.board.turn),
                "legal_moves": [move.uci() for move in self.board.legal_moves],
                "is_game_over": outcome is not None,
                "result": outcome.result() if outcome else None,
                "termination": (
                    outcome.termination.name.lower().replace("_", "-")
                    if outcome
                    else None
                ),
                "mode": self.mode,
                "players": players,
                "human_color": color_name(self.human_color) if self.human_color is not None else None,
                "depth": self.depth,
                "depths": depths,
                "moves": [move.to_dict() for move in self.moves],
            }

    def human_move(self, uci: str) -> MoveRecord:
        with self.lock:
            self._ensure_open()
            # reject human input unless the session assigned that side
            if self.human_color is None or self.board.turn != self.human_color:
                raise TurnError("It is not the human's turn")
            move = self.board.parse_uci(uci)
            return self._push(move, "human")

    def agent_move(self) -> tuple[MoveRecord, SearchResult]:
        with self.lock:
            self._ensure_open()
            # the agent can move only when the human does not own the turn
            if self.human_color is not None and self.board.turn == self.human_color:
                raise TurnError("It is the human's turn")
            player = self.players.get(self.board.turn)
            if player is None:
                raise TurnError("No agent controls the current side")
            search = player.choose_move(self.board, self.depth)
            return self._push(search.move, player.name), search

    def _ensure_open(self) -> None:
        if self.board.is_game_over(claim_draw=True):
            raise GameOverError("Game is already over")

    def _push(self, move: chess.Move, player: str) -> MoveRecord:
        # validate before mutating the board or move history
        if not self.board.is_legal(move):
            raise ValueError(f"Illegal move {move.uci()}")
        color = color_name(self.board.turn)
        san = self.board.san(move)
        self.board.push(move)
        record = MoveRecord(
            ply=len(self.moves) + 1,
            color=color,
            player=player,
            san=san,
            uci=move.uci(),
            fen=self.board.fen(),
        )
        self.moves.append(record)
        return record
