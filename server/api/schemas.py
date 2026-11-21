"""Request bodies for the HTTP API"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

AgentName = Literal["material-mobility", "king-safety-position"]

# a saved game resumes from its starting FEN plus the moves played since
MoveHistory = list[str]
MAX_RESUMED_MOVES = 2000


class CreateGameRequest(BaseModel):
    agent: AgentName = "material-mobility"
    human_color: Literal["white", "black"] = "white"
    depth: int = Field(default=2, ge=1, le=5)
    fen: str | None = None
    moves: MoveHistory = Field(default_factory=list, max_length=MAX_RESUMED_MOVES)


class MoveRequest(BaseModel):
    uci: str = Field(min_length=4, max_length=5)


class CreateMatchSessionRequest(BaseModel):
    white_agent: AgentName = "material-mobility"
    black_agent: AgentName = "king-safety-position"
    depth: int = Field(default=2, ge=1, le=5)
    white_depth: int | None = Field(default=None, ge=1, le=5)
    black_depth: int | None = Field(default=None, ge=1, le=5)
    fen: str | None = None
    moves: MoveHistory = Field(default_factory=list, max_length=MAX_RESUMED_MOVES)


class BatchMatchRequest(BaseModel):
    games: int = Field(default=5, ge=1, le=100)
    depth: int = Field(default=2, ge=1, le=4)
    max_plies: int = Field(default=300, ge=1, le=1000)
