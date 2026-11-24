from __future__ import annotations

import chess


def color_name(color: chess.Color) -> str:
    return "white" if color == chess.WHITE else "black"


# turns a python chess termination such as FIFTY_MOVES into fifty-moves
def termination_label(outcome: chess.Outcome) -> str:
    return outcome.termination.name.lower().replace("_", "-")
