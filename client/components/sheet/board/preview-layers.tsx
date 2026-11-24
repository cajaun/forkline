import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { SharedValue } from 'react-native-reanimated';

import { DARK_PIECE_IMG, PIECE_IMG } from '@/constants/chess-pieces';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import type { BoardTransform } from '../board-transform';
import type { KingDisplayState } from './constants';
import { PreviewMarkers } from './preview-markers';
import { TransitionPieces } from './transition-pieces';

// the closed board layers live outside SheetBoard so a game switch leaves the live board alone
export const BoardPreviewLayers = memo(function BoardPreviewLayers({
  boardSize,
  boardTransform,
  fen,
  kingDisplayState,
  kingSide = null,
  progress,
}: {
  boardSize: number;
  boardTransform: BoardTransform;
  fen: string;
  kingDisplayState: KingDisplayState;
  kingSide?: 'w' | 'b' | null;
  progress: SharedValue<number>;
}) {
  const { boardColors, isDark } = useSheetColors();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <PreviewMarkers
        boardSize={boardSize}
        colors={boardColors}
        fen={fen}
        kingDisplayState={kingDisplayState}
        kingSide={kingSide}
        progress={progress}
      />
      <TransitionPieces
        boardSize={boardSize}
        boardTransform={boardTransform}
        fen={fen}
        kingDisplayState={kingDisplayState}
        kingSide={kingSide}
        pieceImages={isDark ? DARK_PIECE_IMG : PIECE_IMG}
        progress={progress}
      />
    </View>
  );
});
