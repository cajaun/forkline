import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { Canvas, useImage } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useBoardConfig, useBoardStateValues } from 'react-native-chessboard/src/state';
import { SkiaHighlights } from 'react-native-chessboard/src/components/skia/skia-highlights';

import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { markBoardPrimed } from './board-primed';
import { SKIA_SETTLED_PROGRESS } from './constants';
import { MoveDots, PieceAtlas, SelectedSquareHighlight } from './skia-layers';
import { SpecialKingLayer } from './special-king-layer';

const PRIMED_FRAMES = 3;

// the live board draws in one Skia canvas and appears once the sheet settles
export const SheetBoardCanvas = memo(function SheetBoardCanvas({
  mated,
  progress,
  resigned,
  spriteImage,
}: {
  mated: SharedValue<boolean>;
  resigned: SharedValue<'w' | 'b' | null>;
  progress: SharedValue<number>;
  spriteImage: SkImage | null;
}) {
  const config = useBoardConfig();
  const boardState = useBoardStateValues();
  const { isDark, kingColors, kingImages } = useSheetColors();
  const checkmateKingImage = useImage(kingImages.checkmate);
  const gameOverKingImage = useImage(kingImages.gameOver);
  const drawable = spriteImage !== null && checkmateKingImage !== null && gameOverKingImage !== null;

  // a few frames after everything first draws the shaders are compiled and the splash may lift
  useEffect(() => {
    if (!drawable) return;
    let frames = 0;
    let handle = requestAnimationFrame(function tick() {
      frames += 1;
      if (frames >= PRIMED_FRAMES) markBoardPrimed();
      else handle = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(handle);
  }, [drawable]);

  const visibleStyle = useAnimatedStyle(() => ({
    opacity: progress.value >= SKIA_SETTLED_PROGRESS ? 1 : 0,
  }));

  return (
    <AnimatedView pointerEvents="none" style={[StyleSheet.absoluteFill, visibleStyle]}>
      <Canvas style={{ height: config.boardSize, width: config.boardSize }}>
        <SkiaHighlights config={config} boardState={boardState} />
        <SelectedSquareHighlight boardState={boardState} config={config} />
        <MoveDots boardState={boardState} config={config} isDark={isDark} />
        <PieceAtlas boardSize={config.boardSize} boardState={boardState} spriteImage={spriteImage} />
        <SpecialKingLayer
          boardState={boardState}
          checkmateImage={checkmateKingImage}
          config={config}
          gameOverImage={gameOverKingImage}
          kingColors={kingColors}
          mated={mated}
          resigned={resigned}
        />
      </Canvas>
    </AnimatedView>
  );
});
