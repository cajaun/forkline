from __future__ import annotations

import chess
from fastapi import APIRouter, HTTPException

from ..chess.agents import create_agent
from ..chess.game import GameSession
from ..matches.harness import run_match
from .responses import agent_move_response, board_from_fen, replay_or_422, session_or_404
from .schemas import BatchMatchRequest, CreateMatchSessionRequest
from .sessions import matches

router = APIRouter(prefix="/matches")


# each colour gets its own agent and a per side depth overrides the shared one
@router.post("/sessions")
def create_match_session(request: CreateMatchSessionRequest) -> dict[str, object]:
    split_depths = request.white_depth or request.black_depth
    session = GameSession(
        board=board_from_fen(request.fen),
        players={
            chess.WHITE: create_agent(request.white_agent, request.white_depth or request.depth),
            chess.BLACK: create_agent(request.black_agent, request.black_depth or request.depth),
        },
        human_color=None,
        depth=None if split_depths else request.depth,
    )
    replay_or_422(session, request.moves)
    return {"match_id": matches.create(session), **session.state()}


@router.get("/sessions/{match_id}")
def get_match_session(match_id: str) -> dict[str, object]:
    return {"match_id": match_id, **session_or_404(matches, match_id).state()}


@router.delete("/sessions/{match_id}")
def delete_match_session(match_id: str) -> dict[str, object]:
    if not matches.delete(match_id):
        raise HTTPException(status_code=404, detail="Match session not found")
    return {"deleted": True, "match_id": match_id}


# plays one move for the side to move
@router.post("/sessions/{match_id}/step")
def step_match_session(match_id: str) -> dict[str, object]:
    return {"match_id": match_id, **agent_move_response(session_or_404(matches, match_id))}


# runs the full harness match and returns its report
@router.post("")
def create_match(request: BatchMatchRequest) -> dict[str, object]:
    return run_match(request.games, request.depth, request.max_plies)
