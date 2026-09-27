"""The pair's two intentionally different chess agents."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

import chess

from .evaluation import Evaluator, KingSafetyEvaluator, MaterialMobilityEvaluator
from .search import MinimaxAlphaBeta, SearchResult

AGENT_NAMES = ("material-mobility", "king-safety-position")
AGENT_DESCRIPTIONS = {
    "material-mobility": "Values material, legal mobility, and central control",
    "king-safety-position": "Values king shelter, pawn structure, and development",
}


class Player(Protocol):
    name: str

    def choose_move(self, board: chess.Board, depth: int | None = None) -> SearchResult:
        ...


@dataclass
class ChessAgent:
    name: str
    evaluator: Evaluator
    default_depth: int = 2

    def choose_move(self, board: chess.Board, depth: int | None = None) -> SearchResult:
        # let api callers override the agent's configured search depth
        selected_depth = self.default_depth if depth is None else depth
        return MinimaxAlphaBeta(self.evaluator).choose_move(board, selected_depth)


def create_agent(name: str, depth: int = 2) -> ChessAgent:
    if depth < 1:
        raise ValueError("Search depth must be at least 1")
    evaluators = {
        "material-mobility": MaterialMobilityEvaluator,
        "king-safety-position": KingSafetyEvaluator,
    }
    # reject unknown agent names before constructing a search engine
    evaluator_type = evaluators.get(name)
    if evaluator_type is None:
        raise ValueError(f"Unknown agent {name!r}; choose from {', '.join(AGENT_NAMES)}")
    return ChessAgent(name, evaluator_type(), depth)


def describe_agents() -> list[dict[str, str]]:
    return [
        {"name": name, "description": AGENT_DESCRIPTIONS[name]}
        for name in AGENT_NAMES
    ]
