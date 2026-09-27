"""Minimax search with Alpha-Beta pruning and deterministic move ordering."""

from __future__ import annotations

from dataclasses import dataclass
from math import inf
from typing import Literal

import chess

from .evaluation import Evaluator, PIECE_VALUES

MATE_SCORE = 100_000


@dataclass
class SearchStats:
    nodes: int = 0
    cutoffs: int = 0
    transposition_hits: int = 0


@dataclass(frozen=True)
class SearchResult:
    move: chess.Move
    score: int
    stats: SearchStats


@dataclass(frozen=True)
class TableEntry:
    value: int
    bound: Literal["exact", "lower", "upper"]


class MinimaxAlphaBeta:
    """Reusable search engine shared by both agents."""

    def __init__(self, evaluator: Evaluator):
        self.evaluator = evaluator

    def choose_move(self, board: chess.Board, depth: int) -> SearchResult:
        # reject invalid search requests before reading legal moves
        if depth < 1:
            raise ValueError("Search depth must be at least 1")
        if board.is_game_over(claim_draw=True):
            raise ValueError("Cannot search a finished game")

        root_color = board.turn
        stats = SearchStats()
        table: dict[tuple[str, int, chess.Color], TableEntry] = {}
        moves = self._ordered_moves(board, list(board.legal_moves))
        best_move = moves[0]
        best_score = -inf

        for move in moves:
            board.push(move)
            score = self._minimax(
                board,
                depth - 1,
                -inf,
                inf,
                root_color,
                stats,
                table,
                1,
            )
            board.pop()

            if score > best_score:
                best_score = score
                best_move = move

        return SearchResult(best_move, int(best_score), stats)

    def _minimax(
        self,
        board: chess.Board,
        depth: int,
        alpha: float,
        beta: float,
        root_color: chess.Color,
        stats: SearchStats,
        table: dict[tuple[str, int, chess.Color], TableEntry],
        ply: int,
    ) -> int:
        stats.nodes += 1
        terminal_score = self._terminal_score(board, root_color, ply)
        if terminal_score is not None:
            # terminal positions take priority over depth limits
            return terminal_score
        if depth == 0:
            return self.evaluator.evaluate(board, root_color)

        key = (board.fen(), depth, root_color)
        original_alpha = alpha
        original_beta = beta
        cached = table.get(key)
        if cached is not None:
            # reuse cached bounds only when they tighten the current window
            stats.transposition_hits += 1
            if cached.bound == "exact":
                return cached.value
            if cached.bound == "lower":
                alpha = max(alpha, cached.value)
            else:
                beta = min(beta, cached.value)
            if alpha >= beta:
                return cached.value

        maximizing = board.turn == root_color
        # the side to move maximizes for the root player and minimizes otherwise
        moves = self._ordered_moves(board, list(board.legal_moves))

        if maximizing:
            value = -inf
            for move in moves:
                board.push(move)
                value = max(
                    value,
                    self._minimax(board, depth - 1, alpha, beta, root_color, stats, table, ply + 1),
                )
                board.pop()
                alpha = max(alpha, value)
                if alpha >= beta:
                    # prune moves outside the opponent's beta bound
                    stats.cutoffs += 1
                    break
        else:
            value = inf
            for move in moves:
                board.push(move)
                value = min(
                    value,
                    self._minimax(board, depth - 1, alpha, beta, root_color, stats, table, ply + 1),
                )
                board.pop()
                beta = min(beta, value)
                if alpha >= beta:
                    # prune moves outside the opponent's alpha bound
                    stats.cutoffs += 1
                    break

        result = int(value)

        if result <= original_alpha:
            bound: Literal["exact", "lower", "upper"] = "upper"
        elif result >= original_beta:
            bound = "lower"
        else:
            bound = "exact"
        # keep bounds so pruned branches never become exact scores
        table[key] = TableEntry(result, bound)
        return result

    @staticmethod
    def _terminal_score(
        board: chess.Board,
        root_color: chess.Color,
        ply: int,
    ) -> int | None:
        if board.is_checkmate():
            return -MATE_SCORE + ply if board.turn == root_color else MATE_SCORE - ply
        if board.is_game_over(claim_draw=True):
            return 0
        return None

    @staticmethod
    def _ordered_moves(board: chess.Board, moves: list[chess.Move]) -> list[chess.Move]:
        def priority(move: chess.Move) -> int:
            score = 0
            # search forcing moves first so alpha-beta can prune earlier
            if board.gives_check(move):
                score += 100_000
            if board.is_capture(move):
                captured = board.piece_at(move.to_square)
                score += 10_000 + (PIECE_VALUES.get(captured.piece_type, 0) if captured else 100)
            if move.promotion:
                score += 8_000 + PIECE_VALUES.get(move.promotion, 0)
            return score

        return sorted(moves, key=priority, reverse=True)
