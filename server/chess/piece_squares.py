from __future__ import annotations

import chess

# Tomasz Michniewski's Simplified Evaluation Function tables
# each table is printed from White's side with rank 8 on the first row
# pawns have no table here because the pawn structure term already scores them

KNIGHT = (
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20,   0,   0,   0,   0, -20, -40,
    -30,   0,  10,  15,  15,  10,   0, -30,
    -30,   5,  15,  20,  20,  15,   5, -30,
    -30,   0,  15,  20,  20,  15,   0, -30,
    -30,   5,  10,  15,  15,  10,   5, -30,
    -40, -20,   0,   5,   5,   0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
)

BISHOP = (
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10,   0,   0,   0,   0,   0,   0, -10,
    -10,   0,   5,  10,  10,   5,   0, -10,
    -10,   5,   5,  10,  10,   5,   5, -10,
    -10,   0,  10,  10,  10,  10,   0, -10,
    -10,  10,  10,  10,  10,  10,  10, -10,
    -10,   5,   0,   0,   0,   0,   5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
)

ROOK = (
      0,   0,   0,   0,   0,   0,   0,   0,
      5,  10,  10,  10,  10,  10,  10,   5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
      0,   0,   0,   5,   5,   0,   0,   0,
)

QUEEN = (
    -20, -10, -10,  -5,  -5, -10, -10, -20,
    -10,   0,   0,   0,   0,   0,   0, -10,
    -10,   0,   5,   5,   5,   5,   0, -10,
     -5,   0,   5,   5,   5,   5,   0,  -5,
      0,   0,   5,   5,   5,   5,   0,  -5,
    -10,   5,   5,   5,   5,   5,   0, -10,
    -10,   0,   5,   0,   0,   0,   0, -10,
    -20, -10, -10,  -5,  -5, -10, -10, -20,
)

# the middlegame king hides behind its pawns in a corner
KING_MIDDLEGAME = (
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
     20,  20,   0,   0,   0,   0,  20,  20,
     20,  30,  10,   0,   0,  10,  30,  20,
)

# the endgame king walks to the centre where it helps the remaining pawns
KING_ENDGAME = (
    -50, -40, -30, -20, -20, -30, -40, -50,
    -30, -20, -10,   0,   0, -10, -20, -30,
    -30, -10,  20,  30,  30,  20, -10, -30,
    -30, -10,  30,  40,  40,  30, -10, -30,
    -30, -10,  30,  40,  40,  30, -10, -30,
    -30, -10,  20,  30,  30,  20, -10, -30,
    -30, -30,   0,   0,   0,   0, -30, -30,
    -50, -30, -30, -30, -30, -30, -30, -50,
)

TABLES: dict[chess.PieceType, tuple[int, ...]] = {
    chess.KNIGHT: KNIGHT,
    chess.BISHOP: BISHOP,
    chess.ROOK: ROOK,
    chess.QUEEN: QUEEN,
}

# the most rook and minor and queen value a side can hold and still count as an endgame
ENDGAME_PIECE_LIMIT = 1300
PIECE_LIMIT_VALUES: dict[chess.PieceType, int] = {chess.KNIGHT: 320, chess.BISHOP: 330, chess.ROOK: 500, chess.QUEEN: 900}


# the queens are gone or each side holds little more than a rook and a minor piece
def is_endgame(board: chess.Board) -> bool:
    if not board.pieces(chess.QUEEN, chess.WHITE) and not board.pieces(chess.QUEEN, chess.BLACK):
        return True
    return all(
        sum(value * len(board.pieces(piece_type, color)) for piece_type, value in PIECE_LIMIT_VALUES.items())
        <= ENDGAME_PIECE_LIMIT
        for color in chess.COLORS
    )


# a printed table reads rank 8 first so White looks up the mirrored square and Black the square itself
def table_index(square: chess.Square, color: chess.Color) -> int:
    return chess.square_mirror(square) if color == chess.WHITE else square


# the summed table bonus for every piece of one side
def piece_square_score(board: chess.Board, color: chess.Color, endgame: bool) -> int:
    score = 0
    for piece_type, table in TABLES.items():
        score += sum(table[table_index(square, color)] for square in board.pieces(piece_type, color))
    king_square = board.king(color)
    if king_square is not None:
        king_table = KING_ENDGAME if endgame else KING_MIDDLEGAME
        score += king_table[table_index(king_square, color)]
    return score
