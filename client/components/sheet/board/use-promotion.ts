import { useCallback, useRef, useState } from 'react';

import type { PieceSymbol, Square } from 'chess.js';
import { withSpring } from 'react-native-reanimated';
import type { useBoardConfig, useBoardStateValues } from 'react-native-chessboard/src/state';
import { squareToPosition } from 'react-native-chessboard/src/state/use-board-state';

export interface PromotionInfo {
  from: Square;
  to: Square;
  color: 'w' | 'b';
  complete: (piece: PieceSymbol) => void;
  cancel: () => void;
}

// owns the promotion dialog: the move executor pauses on a pawn reaching the last rank until the user picks
export function usePromotion(
  boardState: ReturnType<typeof useBoardStateValues>,
  config: ReturnType<typeof useBoardConfig>,
) {
  // the ref serves the callbacks and the state drives the dialog's render
  const pendingRef = useRef<PromotionInfo | null>(null);
  const [pending, setPending] = useState<PromotionInfo | null>(null);

  const finish = useCallback(() => {
    pendingRef.current = null;
    setPending(null);
  }, []);

  const onPromotionRequired = useCallback((info: PromotionInfo) => {
    // a new promotion replaces one still waiting for an answer
    pendingRef.current?.cancel();
    pendingRef.current = info;
    setPending(info);
  }, []);

  const onSelect = useCallback(
    (piece: PieceSymbol) => {
      pendingRef.current?.complete(piece);
      finish();
    },
    [finish],
  );

  const onCancel = useCallback(() => {
    const info = pendingRef.current;
    if (info) {
      // spring the pawn back to its square and clear the selection
      const fromState = boardState.squares[info.from];
      const origin = squareToPosition(info.from, config.pieceSize, config.flipped);
      fromState.translateX.set(withSpring(origin.x, config.animations.snapBack));
      fromState.translateY.set(withSpring(origin.y, config.animations.snapBack));
      fromState.scale.set(withSpring(1, config.animations.scale));
      fromState.zIndex.set(0);
      boardState.selectedSquare.set(null);
      boardState.validMoves.set([]);
      info.cancel();
    }
    finish();
  }, [boardState, config, finish]);

  return {
    onCancel,
    onPromotionRequired,
    onSelect,
    pending,
  };
}
