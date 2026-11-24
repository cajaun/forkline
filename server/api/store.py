from __future__ import annotations

from threading import RLock
from typing import Generic, TypeVar
from uuid import uuid4

T = TypeVar("T")


# an in memory session map guarded by a lock for concurrent requests
class SessionStore(Generic[T]):
    def __init__(self) -> None:
        self._items: dict[str, T] = {}
        self._lock = RLock()

    def create(self, item: T) -> str:
        with self._lock:
            session_id = str(uuid4())
            self._items[session_id] = item
            return session_id

    def get(self, session_id: str) -> T:
        with self._lock:
            item = self._items.get(session_id)
            if item is None:
                raise KeyError(session_id)
            return item

    def delete(self, session_id: str) -> bool:
        with self._lock:
            return self._items.pop(session_id, None) is not None

    def clear(self) -> None:
        with self._lock:
            self._items.clear()
