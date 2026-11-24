from __future__ import annotations

from dataclasses import dataclass
from math import inf
from typing import Literal

import chess

from .evaluation import PIECE_VALUES, Evaluator, capture_value
from .validation import require_positive

MATE_SCORE = 100_000

Bound = Literal["exact", "lower", "upper"]
TableKey = tuple[str, int, chess.Color]


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
    bound: Bound


# checks first and then captures of valuable pieces and promotions so alpha beta prunes sooner
def ordered_moves(board: chess.Board) -> list[chess.Move]:
    def priority(move: chess.Move) -> int:
        score = 100_000 if board.gives_check(move) else 0
        if board.is_capture(move):
            score += 10_000 + capture_value(board, move)
        if move.promotion:
            score += 8_000 + PIECE_VALUES[move.promotion]
        return score

    return sorted(board.legal_moves, key=priority, reverse=True)


# a faster mate scores higher for the winner and a draw scores zero
def terminal_score(board: chess.Board, root_color: chess.Color, ply: int) -> int | None:
    if board.is_checkmate():
        return -MATE_SCORE + ply if board.turn == root_color else MATE_SCORE - ply
    if board.is_game_over(claim_draw=True):
        return 0
    return None


# the minimax search with alpha beta pruning both agents share
class MinimaxAlphaBeta:
    def __init__(self, evaluator: Evaluator):
        self.evaluator = evaluator

    # searches each root move and keeps the best one for the side to move
    def choose_move(self, board: chess.Board, depth: int) -> SearchResult:
        require_positive(depth, "Search depth must be at least 1")
        if board.is_game_over(claim_draw=True):
            raise ValueError("Cannot search a finished game")

        root_color = board.turn
        stats = SearchStats()
        table: dict[TableKey, TableEntry] = {}
        moves = ordered_moves(board)
        best_move, best_score = moves[0], -inf

        for move in moves:
            board.push(move)
            # the best score so far becomes alpha so a refuted move stops sooner
            score = self._minimax(board, depth - 1, best_score, inf, root_color, stats, table, 1)
            board.pop()
            if score > best_score:
                best_move, best_score = move, score

        return SearchResult(best_move, int(best_score), stats)

    # scores a position for the root player by searching depth plies ahead
    def _minimax(
        self,
        board: chess.Board,
        depth: int,
        alpha: float,
        beta: float,
        root_color: chess.Color,
        stats: SearchStats,
        table: dict[TableKey, TableEntry],
        ply: int,
    ) -> int:
        stats.nodes += 1
        terminal = terminal_score(board, root_color, ply)
        if terminal is not None:
            return terminal
        if depth == 0:
            return self.evaluator.evaluate(board, root_color)

        key = (board.fen(), depth, root_color)
        window = (alpha, beta)
        cached = table.get(key)
        if cached is not None:
            stats.transposition_hits += 1
            alpha, beta, hit = self._apply_entry(cached, alpha, beta)
            if hit:
                return cached.value

        # the root player picks the highest score and the opponent the lowest
        maximizing = board.turn == root_color
        value = -inf if maximizing else inf
        for move in ordered_moves(board):
            board.push(move)
            child = self._minimax(board, depth - 1, alpha, beta, root_color, stats, table, ply + 1)
            board.pop()
            if maximizing:
                value = max(value, child)
                alpha = max(alpha, value)
            else:
                value = min(value, child)
                beta = min(beta, value)
            if alpha >= beta:
                stats.cutoffs += 1
                break

        result = int(value)
        table[key] = TableEntry(result, self._bound(result, *window))
        return result

    # a cached exact score answers at once and a bound narrows the window
    @staticmethod
    def _apply_entry(entry: TableEntry, alpha: float, beta: float) -> tuple[float, float, bool]:
        if entry.bound == "exact":
            return alpha, beta, True
        if entry.bound == "lower":
            alpha = max(alpha, entry.value)
        else:
            beta = min(beta, entry.value)
        return alpha, beta, alpha >= beta

    # a pruned score is a bound and stays out of the table as an exact value
    @staticmethod
    def _bound(result: int, alpha: float, beta: float) -> Bound:
        if result <= alpha:
            return "upper"
        if result >= beta:
            return "lower"
        return "exact"
