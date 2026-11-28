from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Protocol

import chess

from .piece_squares import is_endgame, piece_square_score

PIECE_VALUES: dict[chess.PieceType, int] = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 0,
}

CENTER_SQUARES = (chess.D4, chess.E4, chess.D5, chess.E5)

CENTER_VALUES: dict[chess.PieceType, int] = {
    chess.PAWN: 12,
    chess.KNIGHT: 18,
    chess.BISHOP: 16,
    chess.ROOK: 8,
    chess.QUEEN: 10,
    chess.KING: -8,
}


class Evaluator(Protocol):
    name: str

    def evaluate(self, board: chess.Board, perspective: chess.Color) -> int:
        ...


# flips a score kept from White's side to the side that asked
def _perspective(white_score: int, perspective: chess.Color) -> int:
    return white_score if perspective == chess.WHITE else -white_score


# White's figure minus Black's figure for any per side measure
def _difference(board: chess.Board, measure: Callable[[chess.Board, chess.Color], int]) -> int:
    return measure(board, chess.WHITE) - measure(board, chess.BLACK)


def _signed(color: chess.Color, value: int) -> int:
    return value if color == chess.WHITE else -value


def material_score(board: chess.Board, perspective: chess.Color = chess.WHITE) -> int:
    score = sum(_signed(piece.color, PIECE_VALUES[piece.piece_type]) for piece in board.piece_map().values())
    return _perspective(score, perspective)


# the value of the piece a move takes with an en passant capture worth a pawn
def capture_value(board: chess.Board, move: chess.Move) -> int:
    if not board.is_capture(move):
        return 0
    captured = board.piece_at(move.to_square)
    return PIECE_VALUES[captured.piece_type] if captured else PIECE_VALUES[chess.PAWN]


# counts legal moves for one side on a copy so the search board keeps its turn
def _mobility(board: chess.Board, color: chess.Color) -> int:
    probe = board.copy(stack=False)
    probe.turn = color
    return probe.legal_moves.count()


def _center_control(board: chess.Board) -> int:
    pieces = (board.piece_at(square) for square in CENTER_SQUARES)
    return sum(_signed(piece.color, CENTER_VALUES[piece.piece_type]) for piece in pieces if piece)


def _castling_options(board: chess.Board, color: chess.Color) -> int:
    return 15 * (int(board.has_kingside_castling_rights(color)) + int(board.has_queenside_castling_rights(color)))


# the aggressive agent values material and activity and the centre
@dataclass(frozen=True)
class MaterialMobilityEvaluator:
    name: str = "material-mobility"

    def evaluate(self, board: chess.Board, perspective: chess.Color) -> int:
        white_score = (
            material_score(board)
            + 7 * _difference(board, _mobility)
            + _center_control(board)
            + _difference(board, _castling_options)
        )
        return _perspective(white_score, perspective)


# penalises doubled and isolated pawns and rewards pawns that have advanced
def _pawn_structure(board: chess.Board, color: chess.Color) -> int:
    pawns_by_file: dict[int, list[int]] = {file: [] for file in range(8)}
    for square in board.pieces(chess.PAWN, color):
        pawns_by_file[chess.square_file(square)].append(chess.square_rank(square))

    score = 0
    for file, ranks in pawns_by_file.items():
        if len(ranks) > 1:
            score -= 18 * (len(ranks) - 1)
        if ranks and not any(pawns_by_file.get(neighbor) for neighbor in (file - 1, file + 1)):
            score -= 10
        score += sum(3 * (rank if color == chess.WHITE else 7 - rank) for rank in ranks)
    return score


# scores the pawn shield in front of the king and a king left in check
def _king_safety(board: chess.Board, color: chess.Color) -> int:
    king_square = board.king(color)
    if king_square is None:
        return -10_000

    file = chess.square_file(king_square)
    forward_rank = chess.square_rank(king_square) + (1 if color == chess.WHITE else -1)
    score = 15 if board.has_castling_rights(color) else 0

    if 0 <= forward_rank < 8:
        for shield_file in range(max(0, file - 1), min(8, file + 2)):
            shield = board.piece_at(chess.square(shield_file, forward_rank))
            score += 18 if shield == chess.Piece(chess.PAWN, color) else -7

    if board.is_check() and board.turn == color:
        score -= 45
    return score


# the positional agent values king shelter and pawn structure and where each piece stands
@dataclass(frozen=True)
class KingSafetyEvaluator:
    name: str = "king-safety-position"

    def evaluate(self, board: chess.Board, perspective: chess.Color) -> int:
        endgame = is_endgame(board)
        white_score = (
            material_score(board)
            + _difference(board, _king_safety)
            + _difference(board, _pawn_structure)
            + piece_square_score(board, chess.WHITE, endgame)
            - piece_square_score(board, chess.BLACK, endgame)
        )
        return _perspective(white_score, perspective)
