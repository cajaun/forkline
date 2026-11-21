import { memo } from 'react';
import { StyleSheet } from 'react-native';

import { Canvas, useImage } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useBoardConfig, useBoardStateValues } from 'react-native-chessboard/src/state';
import { SkiaHighlights } from 'react-native-chessboard/src/components/skia/skia-highlights';

import { AnimatedView } from '@/components/shared/uniwind';
import { CHECKMATE_KING_IMG, GAME_OVER_KING_IMG } from '@/constants/chess-pieces';

import { SKIA_SETTLED_PROGRESS, type KingDisplayState } from './constants';
import { MoveDots, PieceAtlas, SelectedSquareHighlight, SpecialKingLayer } from './skia-layers';

// the interactive board, drawn at full size and shown only once the sheet has settled open
export const SheetBoardCanvas = memo(function SheetBoardCanvas({
  kingDisplayState,
  progress,
  spriteImage,
}: {
  kingDisplayState: KingDisplayState;
  progress: SharedValue<number>;
  spriteImage: SkImage | null;
}) {
  const config = useBoardConfig();
  const boardState = useBoardStateValues();
  const checkmateKingImage = useImage(CHECKMATE_KING_IMG);
  const gameOverKingImage = useImage(GAME_OVER_KING_IMG);
  const visibleStyle = useAnimatedStyle(() => ({
    opacity: progress.value >= SKIA_SETTLED_PROGRESS ? 1 : 0,
  }));

  return (
    <AnimatedView pointerEvents="none" style={[StyleSheet.absoluteFill, visibleStyle]}>
      <Canvas style={{ height: config.boardSize, width: config.boardSize }}>
        <SkiaHighlights config={config} boardState={boardState} />
        <SelectedSquareHighlight boardState={boardState} config={config} />
        <MoveDots boardState={boardState} config={config} />
        <PieceAtlas boardSize={config.boardSize} boardState={boardState} spriteImage={spriteImage} />
        <SpecialKingLayer
          boardState={boardState}
          checkmateImage={checkmateKingImage}
          config={config}
          gameOverImage={gameOverKingImage}
          kingDisplayState={kingDisplayState}
        />
      </Canvas>
    </AnimatedView>
  );
});
