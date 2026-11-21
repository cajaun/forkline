export type FenPiece = {
  color: 'w' | 'b';
  // 0 is a8, the top-left square, and 63 is h1
  index: number;
  type: string;
};

const STARTING_COUNTS: Record<string, number> = {
  b: 2,
  k: 1,
  n: 2,
  p: 8,
  q: 1,
  r: 2,
};

// reads the placement field, where uppercase letters are white and digits skip empty squares
export function piecesFromFen(fen: string): FenPiece[] {
  const pieces: FenPiece[] = [];
  const ranks = fen.split(' ')[0].split('/');

  ranks.forEach((rank, row) => {
    let column = 0;
    for (const token of rank) {
      if (/\d/.test(token)) {
        column += Number(token);
        continue;
      }
      pieces.push({
        color: token === token.toUpperCase() ? 'w' : 'b',
        index: row * 8 + column,
        type: token.toLowerCase(),
      });
      column += 1;
    }
  });

  return pieces;
}

// marker colours by square, gray for white pieces
export function pieceCellsFromFen(fen: string): Map<number, 'black' | 'gray'> {
  return new Map(
    piecesFromFen(fen).map(piece => [piece.index, piece.color === 'w' ? 'gray' : 'black']),
  );
}

// the square of the king whose side is to move, the only king a check can hit
export function kingCellFromFen(fen: string): number | null {
  const sideToMove = fen.split(' ')[1] === 'w' ? 'w' : 'b';
  const king = piecesFromFen(fen).find(
    piece => piece.type === 'k' && piece.color === sideToMove,
  );
  return king?.index ?? null;
}

// a side's captures are the opponent's pieces missing from a full set
export function capturedFromFen(fen: string): Record<'b' | 'w', string[]> {
  const remaining = { b: { ...STARTING_COUNTS }, w: { ...STARTING_COUNTS } };

  for (const { color, type } of piecesFromFen(fen)) {
    remaining[color][type] = Math.max(0, (remaining[color][type] ?? 0) - 1);
  }

  const missing = (counts: Record<string, number>) =>
    Object.entries(counts).flatMap(([type, count]) => Array.from({ length: count }, () => type));

  return { b: missing(remaining.w), w: missing(remaining.b) };
}
