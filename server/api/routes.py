"""HTTP routes for human games and agent matches"""

from __future__ import annotations

import os

import chess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ..chess.agents import create_agent, describe_agents
from ..chess.game import GameError, GameSession
from ..matches.harness import run_match
from .responses import (
    MOVE_PARSE_ERRORS,
    agent_move_response,
    board_from_fen,
    game_error,
    replay_or_422,
    session_or_404,
)
from .schemas import BatchMatchRequest, CreateGameRequest, CreateMatchSessionRequest, MoveRequest
from .store import SessionStore

games: SessionStore[GameSession] = SessionStore()
matches: SessionStore[GameSession] = SessionStore()
app = FastAPI(title="Forkline Chess Server", version="0.2.0")

# wildcard CORS by default so local simulator clients can connect
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


@app.get("/health")
def health() -> dict[str, object]:
    return {"status": "ok", "agents": describe_agents()}


@app.get("/agents")
def list_agents() -> list[dict[str, str]]:
    return describe_agents()


@app.post("/games")
def create_game(request: CreateGameRequest) -> dict[str, object]:
    human_color = chess.WHITE if request.human_color == "white" else chess.BLACK
    # the agent takes the side opposite the human
    session = GameSession(
        board=board_from_fen(request.fen),
        players={not human_color: create_agent(request.agent, request.depth)},
        human_color=human_color,
        depth=request.depth,
    )
    replay_or_422(session, request.moves)
    return {"game_id": games.create(session), **session.state()}


@app.get("/games/{game_id}")
def get_game(game_id: str) -> dict[str, object]:
    return {"game_id": game_id, **session_or_404(games, game_id).state()}


@app.delete("/games/{game_id}")
def delete_game(game_id: str) -> dict[str, object]:
    if not games.delete(game_id):
        raise HTTPException(status_code=404, detail="Game not found")
    return {"deleted": True, "game_id": game_id}


@app.post("/games/{game_id}/moves")
def submit_human_move(game_id: str, request: MoveRequest) -> dict[str, object]:
    session = session_or_404(games, game_id)
    try:
        record = session.human_move(request.uci)
    except GameError as error:
        raise game_error(error) from error
    except MOVE_PARSE_ERRORS as error:
        # an illegal move is a bad request, kept apart from turn and game-over conflicts
        raise HTTPException(status_code=400, detail=f"Illegal move: {error}") from error
    return {"move": record.to_dict(), **session.state()}


@app.post("/games/{game_id}/ai-move")
def request_ai_move(game_id: str) -> dict[str, object]:
    return agent_move_response(session_or_404(games, game_id))


@app.post("/matches/sessions")
def create_match_session(request: CreateMatchSessionRequest) -> dict[str, object]:
    # each colour gets its own agent, and a per-side depth overrides the shared one
    white_depth = request.white_depth or request.depth
    black_depth = request.black_depth or request.depth
    session = GameSession(
        board=board_from_fen(request.fen),
        players={
            chess.WHITE: create_agent(request.white_agent, white_depth),
            chess.BLACK: create_agent(request.black_agent, black_depth),
        },
        human_color=None,
        depth=None if request.white_depth or request.black_depth else request.depth,
    )
    replay_or_422(session, request.moves)
    return {"match_id": matches.create(session), **session.state()}


@app.get("/matches/sessions/{match_id}")
def get_match_session(match_id: str) -> dict[str, object]:
    return {"match_id": match_id, **session_or_404(matches, match_id).state()}


@app.delete("/matches/sessions/{match_id}")
def delete_match_session(match_id: str) -> dict[str, object]:
    if not matches.delete(match_id):
        raise HTTPException(status_code=404, detail="Match session not found")
    return {"deleted": True, "match_id": match_id}


@app.post("/matches/sessions/{match_id}/step")
def step_match_session(match_id: str) -> dict[str, object]:
    return {"match_id": match_id, **agent_move_response(session_or_404(matches, match_id))}


@app.post("/matches")
def create_match(request: BatchMatchRequest) -> dict[str, object]:
    return run_match(request.games, request.depth, request.max_plies)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.api.routes:app", host="0.0.0.0", port=8000, reload=True)
