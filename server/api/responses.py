"""Translates game errors into HTTP errors and sessions into JSON bodies"""

from __future__ import annotations

import chess
from fastapi import HTTPException

from ..chess.game import GameError, GameOverError, GameSession, TurnError
from .schemas import MoveHistory
from .store import SessionStore

# python-chess raises these for unparsable or illegal UCI strings
MOVE_PARSE_ERRORS = (ValueError, chess.InvalidMoveError, chess.IllegalMoveError)


def board_from_fen(fen: str | None) -> chess.Board:
    # no FEN means the standard starting position
    try:
        return chess.Board(fen) if fen else chess.Board()
    except ValueError as error:
        raise HTTPException(status_code=422, detail=f"Invalid FEN: {error}") from error


def session_or_404(store: SessionStore[GameSession], session_id: str) -> GameSession:
    try:
        return store.get(session_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Session not found") from error


def game_error(error: GameError) -> HTTPException:
    # state conflicts use 409 while malformed moves use 400
    status = 409 if isinstance(error, (GameOverError, TurnError)) else 400
    return HTTPException(status_code=status, detail=str(error))


def replay_or_422(session: GameSession, moves: MoveHistory) -> None:
    try:
        session.replay(moves)
    except (GameError, *MOVE_PARSE_ERRORS) as error:
        raise HTTPException(status_code=422, detail=f"Invalid move history: {error}") from error


def agent_move_response(session: GameSession) -> dict[str, object]:
    # plays the side to move with its agent and reports the search alongside the new state
    try:
        record, search = session.agent_move()
    except GameError as error:
        raise game_error(error) from error
    return {
        "move": record.to_dict(),
        "search": {
            "score": search.score,
            "nodes": search.stats.nodes,
            "cutoffs": search.stats.cutoffs,
            "transposition_hits": search.stats.transposition_hits,
        },
        **session.state(),
    }
