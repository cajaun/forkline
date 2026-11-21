import { forwardRef, memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { PromotionDialog } from 'react-native-chessboard/src/components/promotion-dialog';
import { usePieceSpriteSheet } from 'react-native-chessboard/src/assets/piece-images';
import { useBoardGesture } from 'react-native-chessboard/src/hooks/use-board-gesture';
import { useChessboardRef } from 'react-native-chessboard/src/hooks/use-chessboard-ref';
import type { ChessboardRef } from 'react-native-chessboard/src/hooks/use-chessboard-ref';
import {
  BoardStateProvider,
  useBoardConfig,
  useBoardContext,
  useBoardStateValues,
} from 'react-native-chessboard/src/state';
import { createMoveExecutor } from 'react-native-chessboard/src/state/move-executor';
import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';

import { DARK_PIECE_SPRITE, PIECE_SPRITE } from '@/constants/chess-pieces';
import { SHEET_BOARD_MOVE_SPRING } from '@/constants/sheet';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import type { KingDisplayState } from './board/constants';
import { SheetBoardCanvas } from './board/skia-canvas';
import { useFastReset, type FastReset } from './board/use-fast-reset';
import { usePromotion } from './board/use-promotion';

export { BoardPreviewLayers } from './board/preview-layers';
export type { KingDisplayState } from './board/constants';

type GestureBoardProps = {
  boardRef: React.Ref<ChessboardRef>;
  kingDisplayState: KingDisplayState;
  onReady?: (ready: boolean) => void;
  onMove?: (result: MoveResult) => void;
  progress: SharedValue<number>;
  resetRef?: React.RefObject<FastReset | null>;
};

// wires the library's move executor, gestures and imperative ref around the Skia canvas
function SheetGestureBoard({
  boardRef,
  kingDisplayState,
  onReady,
  onMove,
  progress,
  resetRef,
}: GestureBoardProps) {
  const { chess } = useBoardContext();
  const { isDark } = useSheetColors();
  const providerConfig = useBoardConfig();
  // the sheet uses its own spring for piece moves
  const config = useMemo(
    () => ({
      ...providerConfig,
      animations: { ...providerConfig.animations, move: SHEET_BOARD_MOVE_SPRING },
    }),
    [providerConfig],
  );
  const boardState = useBoardStateValues();
  const { image: spriteImage } = usePieceSpriteSheet(isDark ? DARK_PIECE_SPRITE : PIECE_SPRITE);
  const promotion = usePromotion(boardState, config);

  // the opening transition waits for the native sprite atlas
  useEffect(() => {
    onReady?.(spriteImage !== null);
  }, [onReady, spriteImage]);

  const moveExecutor = useMemo(
    () =>
      createMoveExecutor(chess, boardState, config, {
        onMove,
        onPromotionRequired: promotion.onPromotionRequired,
      }),
    [boardState, chess, config, onMove, promotion.onPromotionRequired],
  );

  useChessboardRef({ boardState, chess, moveExecutor, ref: boardRef });
  useFastReset({ boardState, chess, config, resetRef });

  const gesture = useBoardGesture({
    boardState,
    config,
    moveExecutor,
    // the promotion dialog owns input while it is up
    gestureEnabled: config.gestureEnabled && !promotion.pending,
  });

  const containerStyle = useMemo(
    () => [styles.container, { height: config.boardSize, width: config.boardSize }],
    [config.boardSize],
  );

  return (
    <GestureHandlerRootView style={containerStyle}>
      <GestureDetector gesture={gesture}>
        <View style={containerStyle}>
          <SheetBoardCanvas
            kingDisplayState={kingDisplayState}
            progress={progress}
            spriteImage={spriteImage}
          />
        </View>
      </GestureDetector>
      {promotion.pending ? (
        <PromotionDialog
          color={promotion.pending.color}
          config={config}
          onCancel={promotion.onCancel}
          onSelect={promotion.onSelect}
        />
      ) : null}
    </GestureHandlerRootView>
  );
}

type SheetBoardProps = Omit<GestureBoardProps, 'boardRef'> & {
  boardSize: number;
  fen: string;
  gestureEnabled?: boolean;
};

// memo keeps the board still while its parent re-renders on every move
export const SheetBoard = memo(
  forwardRef<ChessboardRef, SheetBoardProps>(function SheetBoard(
    { boardSize, fen, gestureEnabled, kingDisplayState, onReady, onMove, progress, resetRef },
    ref,
  ) {
    const { boardColors } = useSheetColors();
    // a stable colours object keeps the board context, and every Skia highlight, from rebuilding
    const colors = useMemo(
      () => ({ ...boardColors, checkmateHighlight: 'transparent' }),
      [boardColors],
    );

    return (
      <BoardStateProvider
        boardSize={boardSize}
        colors={colors}
        fen={fen}
        // the container's pointerEvents gates input, so this config stays the same across turns
        gestureEnabled={gestureEnabled ?? true}
        withLetters={false}
        withNumbers={false}>
        <SheetGestureBoard
          boardRef={ref}
          kingDisplayState={kingDisplayState}
          onMove={onMove}
          onReady={onReady}
          progress={progress}
          resetRef={resetRef}
        />
      </BoardStateProvider>
    );
  }),
);

SheetBoard.displayName = 'SheetBoard';

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
  },
});
