export const occupiedCellsFromFen = (fen: string): Set<number> => {
  const occupied = new Set<number>();
  const ranks = fen.split(' ')[0].split('/');

  ranks.forEach((rank, row) => {
    let column = 0;
    for (const token of rank) {
      if (/\d/.test(token)) {
        column += Number(token);
      } else {
        occupied.add(row * 8 + column);
        column += 1;
      }
    }
  });

  return occupied;
};

export type FenPiece = {
  index: number;
  piece: string;
  side: 'b' | 'w';
};

export const piecesFromFen = (fen: string): FenPiece[] => {
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
        index: row * 8 + column,
        piece: token.toLowerCase(),
        side: token === token.toUpperCase() ? 'w' : 'b',
      });
      column += 1;
    }
  });

  return pieces;
};

export const kingsOnlyFen = (fen: string): string => {
  const board = Array.from({ length: 8 }, () => Array<string | null>(8).fill(null));

  for (const { index, piece, side } of piecesFromFen(fen)) {
    if (piece !== 'k') continue;
    board[Math.floor(index / 8)][index % 8] = side === 'w' ? 'K' : 'k';
  }

  const ranks = board.map(rank => {
    let empty = 0;
    let encoded = '';

    for (const piece of rank) {
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty > 0) {
        encoded += empty;
        empty = 0;
      }
      encoded += piece;
    }

    return encoded + (empty > 0 ? empty : '');
  });

  return `${ranks.join('/')} w - - 0 1`;
};

const STARTING_COUNTS: Record<string, number> = {
  b: 2,
  k: 1,
  n: 2,
  p: 8,
  q: 1,
  r: 2,
};

export const capturedFromFen = (fen: string): Record<'b' | 'w', string[]> => {
  const remaining = {
    b: { ...STARTING_COUNTS },
    w: { ...STARTING_COUNTS },
  };

  for (const token of fen.split(' ')[0]) {
    if (token === '/' || /\d/.test(token)) continue;
    const side = token === token.toUpperCase() ? 'w' : 'b';
    const piece = token.toLowerCase();
    remaining[side][piece] = Math.max(0, (remaining[side][piece] ?? 0) - 1);
  }

  return {
    b: Object.entries(remaining.w).flatMap(([piece, count]) =>
      Array.from({ length: count }, () => piece),
    ),
    w: Object.entries(remaining.b).flatMap(([piece, count]) =>
      Array.from({ length: count }, () => piece),
    ),
  };
};
