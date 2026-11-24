from __future__ import annotations

from ..chess.game import GameSession
from .store import SessionStore

games: SessionStore[GameSession] = SessionStore()
matches: SessionStore[GameSession] = SessionStore()
