import { memo, useDeferredValue, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { PIECE_IMG } from '@/constants/chess-pieces';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { kingCellFromFen, piecesFromFen } from '@/utils/fen';

import type { BoardTransform } from '../board-transform';
import {
  KING_DOT,
  PIECE_REVEAL_OPACITY,
  PIECE_REVEAL_OPACITY_VALUES,
  PIECE_REVEAL_START_SCALE,
  SKIA_SETTLED_PROGRESS,
  type KingDisplayState,
} from './constants';

export type PieceImageSet = typeof PIECE_IMG;

// the pieces grow in and out with the sheet while the live board stays hidden
export const TransitionPieces = memo(function TransitionPieces({
  boardSize,
  boardTransform,
  fen,
  kingDisplayState,
  kingSide = null,
  pieceImages,
  progress,
  revealed = false,
}: {
  boardSize: number;
  boardTransform: BoardTransform;
  fen: string;
  kingDisplayState: KingDisplayState;
  kingSide?: 'w' | 'b' | null;
  pieceImages: PieceImageSet;
  progress: SharedValue<number>;
  revealed?: boolean;
}) {
  const { kingColors, kingImages } = useSheetColors();
  const cell = boardSize / 8;
  const { previewScale, scale } = boardTransform;
  // a deferred position lets a game switch update the markers first
  const deferredFen = useDeferredValue(fen);
  // a won card shows these pieces at rest so they follow the shown game without lagging
  const pieceFen = revealed ? fen : deferredFen;
  const pieces = useMemo(() => piecesFromFen(pieceFen), [pieceFen]);
  const kingCell = useMemo(() => kingCellFromFen(pieceFen, kingSide), [pieceFen, kingSide]);

  const pieceStyle = useAnimatedStyle(() => {
    const boardScale = scale.value;
    const totalPieceScale = interpolate(
      boardScale,
      [previewScale, 1],
      [previewScale * PIECE_REVEAL_START_SCALE, 1],
      Extrapolation.CLAMP,
    );
    const settled = progress.value >= SKIA_SETTLED_PROGRESS;
    // a won game keeps its pieces at full size on the closed card until the live board takes over
    if (revealed) return { opacity: settled ? 0 : 1, transform: [{ scale: 1 }] };
    return {
      opacity: settled
        ? 0
        : interpolate(progress.value, PIECE_REVEAL_OPACITY, PIECE_REVEAL_OPACITY_VALUES, Extrapolation.CLAMP),
      transform: [{ scale: totalPieceScale / boardScale }],
    };
  });

  const images = useMemo(() => {
    // each image keeps its piece kind across positions so a switch moves it rather than reloading it
    const seen: Record<string, number> = {};
    return pieces.map(({ color, index, type }) => {
      const kind = `${color}${type}`;
      seen[kind] = (seen[kind] ?? 0) + 1;
      const specialKing = index === kingCell && type === 'k' && kingDisplayState !== null;

      return (
        <Animated.Image
          key={`${kind}-${seen[kind]}`}
          source={specialKing ? kingImages[kingDisplayState] : pieceImages[color][type]}
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
    });
  }, [cell, kingCell, kingDisplayState, kingImages, pieceImages, pieceStyle, pieces]);

  // the coloured king dot grows in with the pieces before the live board takes over
  const dot =
    kingCell !== null && kingDisplayState !== null ? (
      <Animated.View
        style={[
          {
            backgroundColor: kingColors[kingDisplayState].dot,
            borderRadius: (cell * KING_DOT.diameter) / 2,
            height: cell * KING_DOT.diameter,
            left: (kingCell % 8) * cell + cell * KING_DOT.x - (cell * KING_DOT.diameter) / 2,
            position: 'absolute',
            top: Math.floor(kingCell / 8) * cell + cell * KING_DOT.y - (cell * KING_DOT.diameter) / 2,
            width: cell * KING_DOT.diameter,
          },
          pieceStyle,
        ]}
      />
    ) : null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dot}
      {images}
    </View>
  );
});
