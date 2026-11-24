from __future__ import annotations

import chess
from fastapi import APIRouter, HTTPException

from ..chess.agents import create_agent
from ..chess.game import GameError, GameSession
from .responses import MOVE_PARSE_ERRORS, agent_move_response, board_from_fen, game_error, replay_or_422, session_or_404
from .schemas import CreateGameRequest, MoveRequest
from .sessions import games

router = APIRouter(prefix="/games")


# the agent takes the side opposite the human and replays any saved moves
@router.post("")
def create_game(request: CreateGameRequest) -> dict[str, object]:
    human_color = chess.WHITE if request.human_color == "white" else chess.BLACK
    session = GameSession(
        board=board_from_fen(request.fen),
        players={not human_color: create_agent(request.agent, request.depth)},
        human_color=human_color,
        depth=request.depth,
    )
    replay_or_422(session, request.moves)
    return {"game_id": games.create(session), **session.state()}


@router.get("/{game_id}")
def get_game(game_id: str) -> dict[str, object]:
    return {"game_id": game_id, **session_or_404(games, game_id).state()}


@router.delete("/{game_id}")
def delete_game(game_id: str) -> dict[str, object]:
    if not games.delete(game_id):
        raise HTTPException(status_code=404, detail="Game not found")
    return {"deleted": True, "game_id": game_id}


# an illegal move answers 400 while turn and game over conflicts answer 409
@router.post("/{game_id}/moves")
def submit_human_move(game_id: str, request: MoveRequest) -> dict[str, object]:
    session = session_or_404(games, game_id)
    try:
        record = session.human_move(request.uci)
    except GameError as error:
        raise game_error(error) from error
    except MOVE_PARSE_ERRORS as error:
        raise HTTPException(status_code=400, detail=f"Illegal move: {error}") from error
    return {"move": record.to_dict(), **session.state()}


@router.post("/{game_id}/ai-move")
def request_ai_move(game_id: str) -> dict[str, object]:
    return agent_move_response(session_or_404(games, game_id))


# the agent best move for the human without playing it
@router.post("/{game_id}/hint")
def request_hint(game_id: str) -> dict[str, object]:
    session = session_or_404(games, game_id)
    try:
        search = session.hint()
    except GameError as error:
        raise game_error(error) from error
    return {"uci": search.move.uci(), "score": search.score, "nodes": search.stats.nodes}
