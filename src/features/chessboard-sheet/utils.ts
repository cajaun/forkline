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
