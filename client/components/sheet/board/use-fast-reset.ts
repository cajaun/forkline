import { useCallback, useEffect, useMemo } from 'react';

import type { Chess } from 'chess.js';
import { runOnUI, withSpring } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { useBoardConfig, useBoardStateValues } from 'react-native-chessboard/src/state';
import type { PieceCode } from 'react-native-chessboard/src/state/types';
import { SQUARES } from 'react-native-chessboard/src/state/types';
import { squareToPosition } from 'react-native-chessboard/src/state/use-board-state';

import { planReset } from './reset-plan';

export type FastReset = (fen: string, animate?: boolean) => void;

// jumps or springs the board to a position in one worklet instead of hundreds of UI thread hops
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
    const spring = config.animations.move;
    const { flipped, pieceSize } = config;
    const boardSize = pieceSize * 8;

    return (
      target: (PieceCode | null)[],
      xs: number[],
      ys: number[],
      sideToMove: 'w' | 'b',
      check: boolean,
      kingIndex: number,
      animate: boolean,
    ) => {
      'worklet';
      // the board is read on the UI thread so a piece mid move starts from where it is drawn
      const current = squares.map(square => square.piece.get());
      const fromX = squares.map(square => square.translateX.get());
      const fromY = squares.map(square => square.translateY.get());
      const plan = animate ? planReset(current, target) : null;

      for (let i = 0; i < squares.length; i += 1) {
        const square = squares[i];
        square.lastMove.set(false);
        square.inCheck.set(i === kingIndex);
        highlights[i].color.set(null);

        if (!plan) {
          square.piece.set(target[i]);
          square.translateX.set(xs[i]);
          square.translateY.set(ys[i]);
          square.scale.set(1);
          square.zIndex.set(0);
          continue;
        }

        const source = plan.sources[i];
        const piece = plan.pieces[i];
        square.piece.set(piece);
        square.scale.set(1);
        // a piece with nowhere on the board to come from enters past its own side's edge
        const edgeY = piece && (piece[0] === 'w') !== flipped ? boardSize : -pieceSize;

        if (plan.leaving[i]) {
          square.zIndex.set(0);
          square.translateX.set(fromX[source]);
          square.translateY.set(fromY[source]);
          square.translateY.set(
            withSpring(edgeY, spring, finished => {
              if (!finished) return;
              square.piece.set(null);
              square.translateX.set(xs[i]);
              square.translateY.set(ys[i]);
            }),
          );
          continue;
        }

        square.translateX.set(source >= 0 ? fromX[source] : xs[i]);
        square.translateY.set(source >= 0 ? fromY[source] : edgeY);
        // the same spring as a played move carries every piece home
        square.zIndex.set(source !== i ? 1 : 0);
        square.translateX.set(withSpring(xs[i], spring));
        square.translateY.set(
          withSpring(ys[i], spring, finished => {
            if (finished) square.zIndex.set(0);
          }),
        );
      }
      turn.set(sideToMove);
      selectedSquare.set(null);
      validMoves.set([]);
      lastMove.set(null);
      isCheck.set(check);
      kingInCheckSquare.set(kingIndex >= 0 ? squareNames[kingIndex] : null);
    };
  }, [boardState, config]);

  const fastReset = useCallback(
    (fen: string, animate = false) => {
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
      runOnUI(applyPositionOnUI)(pieces, xs, ys, sideToMove, chess.isCheck(), kingIndex, animate);
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
