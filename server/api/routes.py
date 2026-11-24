from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..chess.agents import describe_agents
from .game_routes import create_game, delete_game, get_game, request_ai_move, request_hint, submit_human_move
from .game_routes import router as game_router
from .match_routes import (
    create_match,
    create_match_session,
    delete_match_session,
    get_match_session,
    step_match_session,
)
from .match_routes import router as match_router
from .schemas import BatchMatchRequest, CreateGameRequest, CreateMatchSessionRequest, MoveRequest
from .sessions import games, matches

__all__ = [
    "BatchMatchRequest",
    "CreateGameRequest",
    "CreateMatchSessionRequest",
    "MoveRequest",
    "app",
    "create_game",
    "create_match",
    "create_match_session",
    "delete_game",
    "delete_match_session",
    "games",
    "get_game",
    "get_match_session",
    "matches",
    "request_ai_move",
    "request_hint",
    "step_match_session",
    "submit_human_move",
]

app = FastAPI(title="Forkline Chess Server", version="0.2.0")

# any origin by default so simulator and phone clients connect without setup
cors_origins = [origin.strip() for origin in os.getenv("FORKLINE_CORS_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)


# uptime monitors ping with HEAD so the route answers it too
@app.api_route("/health", methods=["GET", "HEAD"])
def health() -> dict[str, object]:
    return {"status": "ok", "agents": describe_agents()}


@app.get("/agents")
def list_agents() -> list[dict[str, str]]:
    return describe_agents()


app.include_router(game_router)
app.include_router(match_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.api.routes:app", host="0.0.0.0", port=8000, reload=True)
