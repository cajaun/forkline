"""Agent-vs-agent match harness and JSON report generation."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path

import chess

from ..chess.agents import AGENT_NAMES, Player, create_agent


@dataclass(frozen=True)
class LoggedMove:
    ply: int
    color: str
    agent: str
    san: str
    uci: str
    fen: str
    score: int
    nodes: int
    cutoffs: int


@dataclass(frozen=True)
class MatchResult:
    game_number: int
    white_agent: str
    black_agent: str
    result: str
    termination: str
    moves: tuple[LoggedMove, ...]

    def to_dict(self) -> dict[str, object]:
        return {
            "game_number": self.game_number,
            "white_agent": self.white_agent,
            "black_agent": self.black_agent,
            "result": self.result,
            "termination": self.termination,
            "moves": [asdict(move) for move in self.moves],
        }


def play_game(
    white: Player,
    black: Player,
    *,
    game_number: int = 1,
    depth: int | None = None,
    max_plies: int = 300,
) -> MatchResult:
    # bound the game loop so unfinished positions still produce a report
    if max_plies < 1:
        raise ValueError("Maximum plies must be at least 1")
    board = chess.Board()
    moves: list[LoggedMove] = []

    while not board.is_game_over(claim_draw=True) and len(moves) < max_plies:
        # select the player from the board turn rather than the move count
        agent = white if board.turn == chess.WHITE else black
        color = "white" if board.turn == chess.WHITE else "black"
        search_result = agent.choose_move(board, depth)
        move = search_result.move
        san = board.san(move)
        board.push(move)
        moves.append(
            LoggedMove(
                ply=len(moves) + 1,
                color=color,
                agent=agent.name,
                san=san,
                uci=move.uci(),
                fen=board.fen(),
                score=search_result.score,
                nodes=search_result.stats.nodes,
                cutoffs=search_result.stats.cutoffs,
            )
        )

    outcome = board.outcome(claim_draw=True)
    if outcome is None:
        # treat a capped game as a draw in the match report
        result = "1/2-1/2"
        termination = "maximum-plies"
    else:
        result = outcome.result()
        termination = outcome.termination.name.lower().replace("_", "-")

    return MatchResult(
        game_number=game_number,
        white_agent=white.name,
        black_agent=black.name,
        result=result,
        termination=termination,
        moves=tuple(moves),
    )


def run_match(games: int = 5, depth: int = 2, max_plies: int = 300) -> dict[str, object]:
    if games < 1:
        raise ValueError("A match must contain at least one game")
    if depth < 1:
        raise ValueError("Search depth must be at least 1")
    if max_plies < 1:
        raise ValueError("Maximum plies must be at least 1")

    results: list[MatchResult] = []
    scores = {name: {"wins": 0, "draws": 0, "losses": 0, "points": 0.0} for name in AGENT_NAMES}

    for game_number in range(1, games + 1):
        first, second = AGENT_NAMES
        # alternate colors to reduce first move bias
        white_name, black_name = (first, second) if game_number % 2 else (second, first)
        result = play_game(
            create_agent(white_name, depth),
            create_agent(black_name, depth),
            game_number=game_number,
            max_plies=max_plies,
        )
        results.append(result)

        # award standard chess points after each completed game
        if result.result == "1-0":
            scores[result.white_agent]["wins"] += 1
            scores[result.white_agent]["points"] += 1
            scores[result.black_agent]["losses"] += 1
        elif result.result == "0-1":
            scores[result.black_agent]["wins"] += 1
            scores[result.black_agent]["points"] += 1
            scores[result.white_agent]["losses"] += 1
        else:
            scores[result.white_agent]["draws"] += 1
            scores[result.black_agent]["draws"] += 1
            scores[result.white_agent]["points"] += 0.5
            scores[result.black_agent]["points"] += 0.5

    return {
        "games": games,
        "depth": depth,
        "agents": list(AGENT_NAMES),
        "scores": scores,
        "results": [result.to_dict() for result in results],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Forkline's agent-vs-agent chess match")
    parser.add_argument("--games", type=int, default=5)
    parser.add_argument("--depth", type=int, default=2)
    parser.add_argument("--max-plies", type=int, default=300)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    report = run_match(args.games, args.depth, args.max_plies)
    serialized = json.dumps(report, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(serialized + "\n", encoding="utf-8")
    else:
        print(serialized)


if __name__ == "__main__":
    main()
