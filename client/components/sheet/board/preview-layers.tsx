import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { SharedValue } from 'react-native-reanimated';

import { DARK_PIECE_IMG, PIECE_IMG } from '@/constants/chess-pieces';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import type { BoardTransform } from '../board-transform';
import type { KingDisplayState } from './constants';
import { PreviewMarkers } from './preview-markers';
import { TransitionPieces } from './transition-pieces';

// the closed-state layers stay outside SheetBoard, so a game switch never re-renders the interactive board
export const BoardPreviewLayers = memo(function BoardPreviewLayers({
  boardSize,
  boardTransform,
  fen,
  kingDisplayState,
  progress,
}: {
  boardSize: number;
  boardTransform: BoardTransform;
  fen: string;
  kingDisplayState: KingDisplayState;
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
        progress={progress}
      />
      <TransitionPieces
        boardSize={boardSize}
        boardTransform={boardTransform}
        fen={fen}
        kingDisplayState={kingDisplayState}
        pieceImages={isDark ? DARK_PIECE_IMG : PIECE_IMG}
        progress={progress}
      />
    </View>
  );
});
