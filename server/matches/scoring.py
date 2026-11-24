from __future__ import annotations

from collections import Counter

from ..chess.agents import AGENT_NAMES
from .records import MatchResult

Scores = dict[str, dict[str, float]]


def empty_scores() -> Scores:
    return {name: {"wins": 0, "draws": 0, "losses": 0, "points": 0.0} for name in AGENT_NAMES}


# a win scores one point and a draw half a point for each side
def award(scores: Scores, result: MatchResult) -> None:
    white, black = scores[result.white_agent], scores[result.black_agent]
    if result.result in ("1-0", "0-1"):
        winner, loser = (white, black) if result.result == "1-0" else (black, white)
        winner["wins"] += 1
        winner["points"] += 1
        loser["losses"] += 1
        return
    for side in (white, black):
        side["draws"] += 1
        side["points"] += 0.5


# the average nodes and cutoffs per move for each agent across the match
def search_summary(results: list[MatchResult]) -> Scores:
    totals = {name: {"moves": 0, "nodes": 0, "cutoffs": 0} for name in AGENT_NAMES}
    for move in (move for result in results for move in result.moves):
        entry = totals[move.agent]
        entry["moves"] += 1
        entry["nodes"] += move.nodes
        entry["cutoffs"] += move.cutoffs

    def average(entry: dict[str, int], field: str) -> float:
        return round(entry[field] / entry["moves"], 1) if entry["moves"] else 0.0

    return {
        name: {"moves": entry["moves"], "avg_nodes": average(entry, "nodes"), "avg_cutoffs": average(entry, "cutoffs")}
        for name, entry in totals.items()
    }


def termination_counts(results: list[MatchResult]) -> dict[str, int]:
    return dict(Counter(result.termination for result in results))
