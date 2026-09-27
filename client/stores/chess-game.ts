import { LayoutRectangle } from 'react-native';

import { atom } from 'jotai';
import { makeMutable } from 'react-native-reanimated';

import { CLOCK_START } from '@/constants/chess-game';

import type { Atom, PrimitiveAtom } from 'jotai';
import type { Side } from '@/types/chess';

export type Ply = {
  san: string;
  fen: string;
  from: string;
  to: string;
};

export const pliesAtom = atom<Ply[]>([]);
export const selectedPlyAtom = atom(-1);
export const runningAtom = atom(false);
export const pausedAtom = atom(false);
export const capturedAtom = atom<{ w: string[]; b: string[] }>({ w: [], b: [] });
export const statusAtom = atom('White to move');
export const turnSv = makeMutable<Side>('w');
export const gameOverSv = makeMutable(false);

export const gameResultAtom = atom<Side | null>(get => {
  if (get(statusAtom) !== 'Checkmate') return null;
  return get(pliesAtom).length % 2 === 1 ? 'w' : 'b';
});

export const movesAtom = atom(get => get(pliesAtom).map(ply => ply.san));

export const clockSv: Record<Side, ReturnType<typeof makeMutable<number>>> = {
  w: makeMutable(CLOCK_START.w),
  b: makeMutable(CLOCK_START.b),
};
export const startedSv = makeMutable(false);

const memoizePerPly = <T>(create: (ply: number) => T): ((ply: number) => T) => {
  const cache = new Map<number, T>();
  return (ply: number) => {
    // reuse one atom per move so list cells keep stable subscriptions
    let entry = cache.get(ply);
    if (!entry) {
      entry = create(ply);
      cache.set(ply, entry);
    }
    return entry;
  };
};

export const isPlySelectedFamily = memoizePerPly(
  (ply: number): Atom<boolean> => atom(get => get(selectedPlyAtom) === ply),
);

export const plyFrameFamily = memoizePerPly(
  (_ply: number): PrimitiveAtom<LayoutRectangle | null> =>
    atom<LayoutRectangle | null>(null),
);

export const interactedAtom = atom(false);

export const selectMoveAtom = atom(null, (get, set, ply: number) => {
  // replay controls own the move history while the game is running
  if (get(runningAtom)) return;
  set(interactedAtom, true);
  const length = get(pliesAtom).length;
  set(selectedPlyAtom, Math.max(-1, Math.min(ply, length - 1)));
});

export const resetGameAtom = atom(null, (_get, set) => {
  // reset react state and animation state together
  set(pliesAtom, []);
  set(selectedPlyAtom, -1);
  set(capturedAtom, { w: [], b: [] });
  set(statusAtom, 'White to move');
  turnSv.set('w');
  gameOverSv.set(false);
  startedSv.set(false);
  clockSv.w.set(CLOCK_START.w);
  clockSv.b.set(CLOCK_START.b);
});
