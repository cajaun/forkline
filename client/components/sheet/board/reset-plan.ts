import type { PieceCode } from 'react-native-chessboard/src/state/types';

export type ResetPlan = {
  // the piece each square slot holds while it animates
  pieces: (PieceCode | null)[];
  // the slot index the piece flies in from or -1 when it enters from off the board
  sources: number[];
  // pieces with no home in the new position leave the board and then clear
  leaving: boolean[];
};

// files count double so a pawn walks back down its own file before it borrows a neighbour's
function distance(a: number, b: number) {
  'worklet';
  return Math.abs((a % 8) - (b % 8)) * 2 + Math.abs(Math.floor(a / 8) - Math.floor(b / 8));
}

// pairs pieces shortest trip first so each one takes the closest free square of its kind
export function planReset(current: (PieceCode | null)[], target: (PieceCode | null)[]): ResetPlan {
  'worklet';
  const pieces = [...target];
  const sources = target.map(() => -1);
  const leaving = target.map(() => false);
  const used = current.map(() => false);

  const pairs: number[][] = [];
  for (let to = 0; to < target.length; to += 1) {
    if (!target[to]) continue;
    for (let from = 0; from < current.length; from += 1) {
      if (current[from] === target[to]) pairs.push([distance(from, to), to, from]);
    }
  }
  pairs.sort((a, b) => a[0] - b[0]);
  for (const [, to, from] of pairs) {
    if (sources[to] >= 0 || used[from]) continue;
    sources[to] = from;
    used[from] = true;
  }

  // a leftover piece borrows an empty slot so it can leave from where it stood
  const free: number[] = [];
  for (let index = 0; index < target.length; index += 1) if (!target[index]) free.push(index);
  for (let from = 0; from < current.length; from += 1) {
    if (!current[from] || used[from]) continue;
    const slot = free.shift();
    if (slot === undefined) break;
    pieces[slot] = current[from];
    sources[slot] = from;
    leaving[slot] = true;
  }

  return { leaving, pieces, sources };
}
