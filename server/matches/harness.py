from __future__ import annotations

import argparse
import json
from pathlib import Path

from ..chess.agents import AGENT_NAMES, create_agent
from ..chess.validation import require_positive
from .openings import opening_for_game
from .records import MatchResult
from .runner import play_game
from .scoring import award, empty_scores, search_summary, termination_counts

__all__ = ["main", "play_game", "run_match", "summarize"]


# plays the agents against each other and alternates colours on each opening pair
def run_match(games: int = 10, depth: int = 2, max_plies: int = 300) -> dict[str, object]:
    require_positive(games, "A match must contain at least one game")
    require_positive(depth, "Search depth must be at least 1")
    require_positive(max_plies, "Maximum plies must be at least 1")

    results: list[MatchResult] = []
    scores = empty_scores()
    first, second = AGENT_NAMES

    for game_number in range(1, games + 1):
        white_name, black_name = (first, second) if game_number % 2 else (second, first)
        result = play_game(
            create_agent(white_name, depth),
            create_agent(black_name, depth),
            game_number=game_number,
            max_plies=max_plies,
            opening=opening_for_game(game_number),
        )
        results.append(result)
        award(scores, result)

    return {
        "games": games,
        "depth": depth,
        "agents": list(AGENT_NAMES),
        "scores": scores,
        "search": search_summary(results),
        "terminations": termination_counts(results),
        "average_plies": round(sum(len(result.moves) for result in results) / games, 1),
        "results": [result.to_dict() for result in results],
    }


# drops the per move logs so the report fits inside the app match report tray
def summarize(report: dict[str, object]) -> dict[str, object]:
    games = report["results"]
    assert isinstance(games, list)
    kept = ("game_number", "opening", "white_agent", "black_agent", "result", "termination")
    return {
        **{key: value for key, value in report.items() if key != "results"},
        "results": [{**{key: game[key] for key in kept}, "plies": len(game["moves"])} for game in games],
    }


def _write_json(path: Path, data: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


# prints the report or writes the full report and the app summary to files
def main() -> None:
    parser = argparse.ArgumentParser(description="Run Forkline's agent-vs-agent chess match")
    parser.add_argument("--games", type=int, default=10)
    parser.add_argument("--depth", type=int, default=2)
    parser.add_argument("--max-plies", type=int, default=300)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--summary", type=Path)
    args = parser.parse_args()

    report = run_match(args.games, args.depth, args.max_plies)
    if args.summary:
        _write_json(args.summary, summarize(report))
    if args.output:
        _write_json(args.output, report)
    elif not args.summary:
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
