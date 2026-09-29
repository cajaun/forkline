"""HTTP routes for human games and agent matches"""

from __future__ import annotations

import os
from typing import Literal

import chess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ..chess.agents import create_agent, describe_agents
from ..chess.game import GameError, GameOverError, GameSession, MoveRecord, TurnError
from ..chess.search import SearchResult
from ..matches.harness import run_match
from .store import SessionStore

AgentName = Literal["material-mobility", "king-safety-position"]


class CreateGameRequest(BaseModel):
    agent: AgentName = "material-mobility"
    human_color: Literal["white", "black"] = "white"
    depth: int = Field(default=2, ge=1, le=5)
    fen: str | None = None


class MoveRequest(BaseModel):
    uci: str = Field(min_length=4, max_length=5)


class CreateMatchSessionRequest(BaseModel):
    white_agent: AgentName = "material-mobility"
    black_agent: AgentName = "king-safety-position"
    depth: int = Field(default=2, ge=1, le=5)
    white_depth: int | None = Field(default=None, ge=1, le=5)
    black_depth: int | None = Field(default=None, ge=1, le=5)
    fen: str | None = None


class BatchMatchRequest(BaseModel):
    games: int = Field(default=5, ge=1, le=100)
    depth: int = Field(default=2, ge=1, le=4)
    max_plies: int = Field(default=300, ge=1, le=1000)


games: SessionStore[GameSession] = SessionStore()
matches: SessionStore[GameSession] = SessionStore()
app = FastAPI(title="Forkline Chess Server", version="0.2.0")

# keep wildcard CORS for local simulator clients
cors_origins = [
    origin.strip()
    for origin in os.getenv("FORKLINE_CORS_ORIGINS", "*").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)


def _board_from_fen(fen: str | None) -> chess.Board:
    try:
        # fall back to the standard position when no FEN is supplied
        return chess.Board(fen) if fen else chess.Board()
    except ValueError as error:
        # convert chess parsing errors into a client-facing validation response
        raise HTTPException(status_code=422, detail=f"Invalid FEN: {error}") from error


def _session_or_404(store: SessionStore[GameSession], session_id: str) -> GameSession:
    try:
        return store.get(session_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Session not found") from error


def _game_error(error: GameError) -> HTTPException:
    # state conflicts use 409 while malformed moves use 400
    status = 409 if isinstance(error, (GameOverError, TurnError)) else 400
    return HTTPException(status_code=status, detail=str(error))


def _move_response(session: GameSession, record: MoveRecord) -> dict[str, object]:
    return {"move": record.to_dict(), **session.state()}


def _search_response(search: SearchResult) -> dict[str, int]:
    return {
        "score": search.score,
        "nodes": search.stats.nodes,
        "cutoffs": search.stats.cutoffs,
        "transposition_hits": search.stats.transposition_hits,
    }


@app.get("/health")
def health() -> dict[str, object]:
    return {"status": "ok", "agents": describe_agents()}


@app.get("/agents")
def list_agents() -> list[dict[str, str]]:
    return describe_agents()


@app.post("/games")
def create_game(request: CreateGameRequest) -> dict[str, object]:
    board = _board_from_fen(request.fen)
    human_color = chess.WHITE if request.human_color == "white" else chess.BLACK
    # give the agent the side opposite the human player
    agent_color = not human_color
    session = GameSession(
        board=board,
        players={agent_color: create_agent(request.agent, request.depth)},
        human_color=human_color,
        depth=request.depth,
    )
    game_id = games.create(session)
    return {"game_id": game_id, **session.state()}


@app.get("/games/{game_id}")
def get_game(game_id: str) -> dict[str, object]:
    session = _session_or_404(games, game_id)
    return {"game_id": game_id, **session.state()}


@app.delete("/games/{game_id}")
def delete_game(game_id: str) -> dict[str, object]:
    if not games.delete(game_id):
        raise HTTPException(status_code=404, detail="Game not found")
    return {"deleted": True, "game_id": game_id}


@app.post("/games/{game_id}/moves")
def submit_human_move(game_id: str, request: MoveRequest) -> dict[str, object]:
    session = _session_or_404(games, game_id)
    try:
        record = session.human_move(request.uci)
    except GameError as error:
        raise _game_error(error) from error
    except (ValueError, chess.InvalidMoveError, chess.IllegalMoveError) as error:
        # keep invalid moves separate from turn and game-state conflicts
        raise HTTPException(status_code=400, detail=f"Illegal move: {error}") from error
    return _move_response(session, record)


@app.post("/games/{game_id}/ai-move")
def request_ai_move(game_id: str) -> dict[str, object]:
    session = _session_or_404(games, game_id)
    try:
        record, search = session.agent_move()
    except GameError as error:
        raise _game_error(error) from error
    return {"move": record.to_dict(), "search": _search_response(search), **session.state()}


@app.post("/matches/sessions")
def create_match_session(request: CreateMatchSessionRequest) -> dict[str, object]:
    board = _board_from_fen(request.fen)
    # match sessions assign one agent to each color
    white_depth = request.white_depth or request.depth
    black_depth = request.black_depth or request.depth
    session = GameSession(
        board=board,
        players={
            chess.WHITE: create_agent(request.white_agent, white_depth),
            chess.BLACK: create_agent(request.black_agent, black_depth),
        },
        human_color=None,
        depth=None if request.white_depth or request.black_depth else request.depth,
    )
    match_id = matches.create(session)
    return {"match_id": match_id, **session.state()}


@app.get("/matches/sessions/{match_id}")
def get_match_session(match_id: str) -> dict[str, object]:
    session = _session_or_404(matches, match_id)
    return {"match_id": match_id, **session.state()}


@app.delete("/matches/sessions/{match_id}")
def delete_match_session(match_id: str) -> dict[str, object]:
    if not matches.delete(match_id):
        raise HTTPException(status_code=404, detail="Match session not found")
    return {"deleted": True, "match_id": match_id}


@app.post("/matches/sessions/{match_id}/step")
def step_match_session(match_id: str) -> dict[str, object]:
    session = _session_or_404(matches, match_id)
    try:
        record, search = session.agent_move()
    except GameError as error:
        raise _game_error(error) from error
    return {
        "move": record.to_dict(),
        "search": _search_response(search),
        "match_id": match_id,
        **session.state(),
    }


@app.post("/matches")
def create_match(request: BatchMatchRequest) -> dict[str, object]:
    return run_match(request.games, request.depth, request.max_plies)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.api.routes:app", host="0.0.0.0", port=8000, reload=True)
