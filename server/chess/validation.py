from __future__ import annotations


# guards the depth and game counts the search and the match runner rely on
def require_positive(value: int, message: str) -> None:
    if value < 1:
        raise ValueError(message)
