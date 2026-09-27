"""Evaluation functions for the pair's two deliberately different agents."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

import chess

PIECE_VALUES: dict[chess.PieceType, int] = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 0,
}

CENTER_SQUARES = {
    chess.D4,
    chess.E4,
    chess.D5,
    chess.E5,
}


class Evaluator(Protocol):
    """An evaluation function measured from the requested side's perspective."""

    name: str

    def evaluate(self, board: chess.Board, perspective: chess.Color) -> int:
        ...


def _perspective(white_score: int, perspective: chess.Color) -> int:
    # convert the shared white score into the caller's perspective
    return white_score if perspective == chess.WHITE else -white_score


def material_score(board: chess.Board, perspective: chess.Color = chess.WHITE) -> int:
    score = 0
    for piece in board.piece_map().values():
        value = PIECE_VALUES[piece.piece_type]
        score += value if piece.color == chess.WHITE else -value
    return _perspective(score, perspective)


def _mobility(board: chess.Board, color: chess.Color) -> int:
    """Return legal moves for one side without changing the caller's board."""

    # evaluate the requested turn without changing the search board
    probe = board.copy(stack=False)
    probe.turn = color
    return sum(1 for _ in probe.legal_moves)


def _center_score(board: chess.Board) -> int:
    score = 0
    for square in CENTER_SQUARES:
        piece = board.piece_at(square)
        if piece is None:
            continue
        value = {chess.PAWN: 12, chess.KNIGHT: 18, chess.BISHOP: 16,
                 chess.ROOK: 8, chess.QUEEN: 10, chess.KING: -8}[piece.piece_type]
        score += value if piece.color == chess.WHITE else -value
    return score


@dataclass(frozen=True)
class MaterialMobilityEvaluator:
    """Aggressive evaluator: material, activity, and central control."""

    name: str = "material-mobility"

    def evaluate(self, board: chess.Board, perspective: chess.Color) -> int:
        white_score = material_score(board)
        white_score += (_mobility(board, chess.WHITE) - _mobility(board, chess.BLACK)) * 7
        white_score += _center_score(board)

        if board.has_kingside_castling_rights(chess.WHITE):
            white_score += 15
        if board.has_queenside_castling_rights(chess.WHITE):
            white_score += 15
        if board.has_kingside_castling_rights(chess.BLACK):
            white_score -= 15
        if board.has_queenside_castling_rights(chess.BLACK):
            white_score -= 15

        return _perspective(white_score, perspective)


def _pawn_structure(board: chess.Board, color: chess.Color) -> int:
    pawns_by_file: dict[int, list[int]] = {file: [] for file in range(8)}
    for square in board.pieces(chess.PAWN, color):
        pawns_by_file[chess.square_file(square)].append(chess.square_rank(square))

    score = 0
    for file, ranks in pawns_by_file.items():
        # penalize doubled and isolated pawns while rewarding advancement
        if len(ranks) > 1:
            score -= 18 * (len(ranks) - 1)
        if ranks and not any(pawns_by_file.get(neighbor) for neighbor in (file - 1, file + 1)):
            score -= 10

        for rank in ranks:
            advancement = rank if color == chess.WHITE else 7 - rank
            score += advancement * 3
    return score


def _king_safety(board: chess.Board, color: chess.Color) -> int:
    king_square = board.king(color)
    if king_square is None:
        # a missing king marks a losing position for the evaluated side
        return -10000

    file = chess.square_file(king_square)
    rank = chess.square_rank(king_square)
    forward_rank = rank + (1 if color == chess.WHITE else -1)
    score = 15 if board.has_castling_rights(color) else 0

    if 0 <= forward_rank < 8:
        # score the pawn shield directly in front of the king
        for shield_file in range(max(0, file - 1), min(8, file + 2)):
            shield_square = chess.square(shield_file, forward_rank)
            if board.piece_at(shield_square) == chess.Piece(chess.PAWN, color):
                score += 18
            else:
                score -= 7

    if board.is_check() and board.turn == color:
        score -= 45
    return score


@dataclass(frozen=True)
class KingSafetyEvaluator:
    """Positional evaluator: king shelter, pawn structure, and development."""

    name: str = "king-safety-position"

    def evaluate(self, board: chess.Board, perspective: chess.Color) -> int:
        white_score = material_score(board)
        white_score += _king_safety(board, chess.WHITE) - _king_safety(board, chess.BLACK)
        white_score += _pawn_structure(board, chess.WHITE) - _pawn_structure(board, chess.BLACK)

        # reward developed minor pieces
        for square, piece in board.piece_map().items():
            if piece.piece_type not in (chess.KNIGHT, chess.BISHOP):
                continue
            rank = chess.square_rank(square)
            home_rank = 0 if piece.color == chess.WHITE else 7
            development = 8 if rank != home_rank else 0
            white_score += development if piece.color == chess.WHITE else -development

        return _perspective(white_score, perspective)
