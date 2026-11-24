import { useCallback, useEffect, useMemo } from 'react';

import type { Chess } from 'chess.js';
import { runOnUI } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { useBoardConfig, useBoardStateValues } from 'react-native-chessboard/src/state';
import type { PieceCode } from 'react-native-chessboard/src/state/types';
import { SQUARES } from 'react-native-chessboard/src/state/types';
import { squareToPosition } from 'react-native-chessboard/src/state/use-board-state';

export type FastReset = (fen: string) => void;

// jumps the board to a position in one worklet instead of hundreds of UI thread hops
export function useFastReset({
  boardState,
  chess,
  config,
  mated,
  resetRef,
}: {
  boardState: ReturnType<typeof useBoardStateValues>;
  chess: Chess;
  config: ReturnType<typeof useBoardConfig>;
  mated: SharedValue<boolean>;
  resetRef?: React.RefObject<FastReset | null>;
}) {
  const applyPositionOnUI = useMemo(() => {
    const squares = SQUARES.map(square => boardState.squares[square]);
    const highlights = SQUARES.map(square => boardState.highlights[square]);
    const squareNames = [...SQUARES];
    const { isCheck, kingInCheckSquare, lastMove, selectedSquare, turn, validMoves } = boardState;

    return (
      pieces: (PieceCode | null)[],
      xs: number[],
      ys: number[],
      sideToMove: 'w' | 'b',
      check: boolean,
      kingIndex: number,
    ) => {
      'worklet';
      for (let i = 0; i < squares.length; i += 1) {
        const square = squares[i];
        square.piece.set(pieces[i]);
        square.translateX.set(xs[i]);
        square.translateY.set(ys[i]);
        square.scale.set(1);
        square.zIndex.set(0);
        square.lastMove.set(false);
        square.inCheck.set(i === kingIndex);
        highlights[i].color.set(null);
      }
      turn.set(sideToMove);
      selectedSquare.set(null);
      validMoves.set([]);
      lastMove.set(null);
      isCheck.set(check);
      kingInCheckSquare.set(kingIndex >= 0 ? squareNames[kingIndex] : null);
    };
  }, [boardState]);

  const fastReset = useCallback(
    (fen: string) => {
      try {
        chess.load(fen);
      } catch {
        return;
      }
      const pieces: (PieceCode | null)[] = [];
      const xs: number[] = [];
      const ys: number[] = [];
      const sideToMove = chess.turn();
      // the king stays marked through checkmate as well as check
      const markKing = chess.isCheck() || chess.isCheckmate();
      let kingIndex = -1;

      SQUARES.forEach((square, index) => {
        const piece = chess.get(square);
        const code = piece ? (`${piece.color}${piece.type}` as PieceCode) : null;
        pieces.push(code);
        if (markKing && code === `${sideToMove}k`) kingIndex = index;
        const position = squareToPosition(square, config.pieceSize, config.flipped);
        xs.push(position.x);
        ys.push(position.y);
      });

      mated.set(chess.isCheckmate());
      runOnUI(applyPositionOnUI)(pieces, xs, ys, sideToMove, chess.isCheck(), kingIndex);
    },
    [applyPositionOnUI, chess, config.flipped, config.pieceSize, mated],
  );

  useEffect(() => {
    if (!resetRef) return;
    resetRef.current = fastReset;
    return () => {
      resetRef.current = null;
    };
  }, [fastReset, resetRef]);
}
