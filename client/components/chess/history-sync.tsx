import React, { useEffect, useRef } from 'react';

import { useStore } from 'jotai';

import { pliesAtom, runningAtom, selectedPlyAtom } from '@/stores/chess-game';

import type { Square } from 'chess.js';
import type { ChessboardRef } from 'react-native-chessboard';

export const HistorySync: React.FC<{
  boardRef: React.RefObject<ChessboardRef | null>;
  initialFen: string;
}> = ({ boardRef, initialFen }) => {
  const store = useStore();
  const previousPly = useRef<number | null>(null);
  const previousLength = useRef<number | null>(null);

  useEffect(() => {
    previousPly.current = store.get(selectedPlyAtom);
    previousLength.current = store.get(pliesAtom).length;

    const onSelection = () => {
      const targetPly = store.get(selectedPlyAtom);
      const plies = store.get(pliesAtom);
      const fromPly = previousPly.current ?? -1;
      const grew = plies.length > (previousLength.current ?? 0);
      previousPly.current = targetPly;
      previousLength.current = plies.length;

      // ignore selection changes caused by live replay or list growth
      if (store.get(runningAtom) || grew || targetPly === fromPly) return;
      if (targetPly >= plies.length) return;

      const lastMove =
        targetPly >= 0
          ? { from: plies[targetPly].from as Square, to: plies[targetPly].to as Square }
          : null;
      let slide: { from: Square; to: Square } | undefined;

      // animate adjacent selections and jump for larger history changes
      if (targetPly === fromPly + 1 && targetPly >= 0) {
        slide = { from: plies[targetPly].from as Square, to: plies[targetPly].to as Square };
      } else if (targetPly === fromPly - 1 && fromPly >= 0 && fromPly < plies.length) {
        slide = { from: plies[fromPly].to as Square, to: plies[fromPly].from as Square };
      }

      boardRef.current?.resetBoard(
        targetPly < 0 ? initialFen : plies[targetPly].fen,
        { lastMove, slide },
      );
    };

    return store.sub(selectedPlyAtom, onSelection);
  }, [boardRef, initialFen, store]);

  return null;
};
