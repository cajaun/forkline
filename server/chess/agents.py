from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

import chess

from .evaluation import Evaluator, KingSafetyEvaluator, MaterialMobilityEvaluator
from .search import MinimaxAlphaBeta, SearchResult
from .validation import require_positive

EVALUATORS: dict[str, type[Evaluator]] = {
    "material-mobility": MaterialMobilityEvaluator,
    "king-safety-position": KingSafetyEvaluator,
}

AGENT_NAMES = tuple(EVALUATORS)

AGENT_DESCRIPTIONS = {
    "material-mobility": "Values material, legal mobility, and central control",
    "king-safety-position": "Values king shelter, pawn structure, and development",
}


class Player(Protocol):
    name: str

    def choose_move(self, board: chess.Board, depth: int | None = None) -> SearchResult:
        ...


# one agent is one evaluation strategy driving the shared search
@dataclass
class ChessAgent:
    name: str
    evaluator: Evaluator
    default_depth: int = 2

    # a caller depth overrides the depth the agent was built with
    def choose_move(self, board: chess.Board, depth: int | None = None) -> SearchResult:
        return MinimaxAlphaBeta(self.evaluator).choose_move(board, self.default_depth if depth is None else depth)


def create_agent(name: str, depth: int = 2) -> ChessAgent:
    require_positive(depth, "Search depth must be at least 1")
    evaluator_type = EVALUATORS.get(name)
    if evaluator_type is None:
        raise ValueError(f"Unknown agent {name!r}; choose from {', '.join(AGENT_NAMES)}")
    return ChessAgent(name, evaluator_type(), depth)


def describe_agents() -> list[dict[str, str]]:
    return [{"name": name, "description": AGENT_DESCRIPTIONS[name]} for name in AGENT_NAMES]
