import { memo, useDeferredValue, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { CHECKMATE_KING_IMG, GAME_OVER_KING_IMG, PIECE_IMG } from '@/constants/chess-pieces';
import { kingCellFromFen, piecesFromFen } from '@/utils/fen';

import type { BoardTransform } from '../board-transform';
import {
  PIECE_REVEAL_OPACITY,
  PIECE_REVEAL_OPACITY_VALUES,
  PIECE_REVEAL_START_SCALE,
  SKIA_SETTLED_PROGRESS,
  type KingDisplayState,
} from './constants';

export type PieceImageSet = typeof PIECE_IMG;

const KING_IMAGES = { checkmate: CHECKMATE_KING_IMG, gameOver: GAME_OVER_KING_IMG } as const;

// one image per piece sharing a single animated style, so the grow-in lands in the same commit as the sheet
export const TransitionPieces = memo(function TransitionPieces({
  boardSize,
  boardTransform,
  fen,
  kingDisplayState,
  pieceImages,
  progress,
}: {
  boardSize: number;
  boardTransform: BoardTransform;
  fen: string;
  kingDisplayState: KingDisplayState;
  pieceImages: PieceImageSet;
  progress: SharedValue<number>;
}) {
  const cell = boardSize / 8;
  const { previewScale, scale } = boardTransform;
  // the pieces are hidden while the sheet is closed, so a game switch can update them after the markers
  const deferredFen = useDeferredValue(fen);
  const pieces = useMemo(() => piecesFromFen(deferredFen), [deferredFen]);
  const kingCell = useMemo(() => kingCellFromFen(deferredFen), [deferredFen]);

  const pieceStyle = useAnimatedStyle(() => {
    const boardScale = scale.value;
    // the on-screen piece size, divided by the board's own scale
    const totalPieceScale = interpolate(
      boardScale,
      [previewScale, 1],
      [previewScale * PIECE_REVEAL_START_SCALE, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity:
        progress.value >= SKIA_SETTLED_PROGRESS
          ? 0
          : interpolate(
              progress.value,
              PIECE_REVEAL_OPACITY,
              PIECE_REVEAL_OPACITY_VALUES,
              Extrapolation.CLAMP,
            ),
      transform: [{ scale: totalPieceScale / boardScale }],
    };
  });

  // memoised on the deferred position, so the urgent render of a game switch skips all 32 images
  const images = useMemo(
    () =>
      pieces.map(({ color, index, type }, slot) => {
        const specialKing = index === kingCell && type === 'k' && kingDisplayState !== null;

        return (
          <Animated.Image
            // keyed by slot so a game switch reuses the same images with new props
            key={`slot-${slot}`}
            source={specialKing ? KING_IMAGES[kingDisplayState] : pieceImages[color][type]}
            style={[
              {
                height: cell,
                left: (index % 8) * cell,
                position: 'absolute',
                top: Math.floor(index / 8) * cell,
                width: cell,
              },
              pieceStyle,
            ]}
          />
        );
      }),
    [cell, kingCell, kingDisplayState, pieceImages, pieceStyle, pieces],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {images}
    </View>
  );
});
