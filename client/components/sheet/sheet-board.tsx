import { forwardRef, memo, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
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

import { SheetBoardCanvas } from './board/skia-canvas';
import { useFastReset, type FastReset } from './board/use-fast-reset';
import { PromotionTray } from './board/promotion-tray';
import { usePromotion } from './board/use-promotion';

export { BoardPreviewLayers } from './board/preview-layers';
export type { KingDisplayState } from './board/constants';

type GestureBoardProps = {
  boardRef: React.Ref<ChessboardRef>;
  onReady?: (ready: boolean) => void;
  onMove?: (result: MoveResult) => void;
  progress: SharedValue<number>;
  resetRef?: React.RefObject<FastReset | null>;
  resignedSide?: 'w' | 'b' | null;
};

// wires the move executor and gestures and ref around the Skia canvas
function SheetGestureBoard({
  boardRef,
  onReady,
  onMove,
  progress,
  resetRef,
  resignedSide = null,
}: GestureBoardProps) {
  const { chess } = useBoardContext();
  const { isDark } = useSheetColors();
  const providerConfig = useBoardConfig();
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

  useEffect(() => {
    onReady?.(spriteImage !== null);
  }, [onReady, spriteImage]);

  // the UI thread knows about mate so the king turns red without a re-render
  const mated = useSharedValue(chess.isCheckmate());
  const resigned = useSharedValue<'w' | 'b' | null>(resignedSide);
  useEffect(() => {
    resigned.set(resignedSide);
  }, [resigned, resignedSide]);
  const handleMove = useCallback(
    (result: MoveResult) => {
      mated.set(result.state.isCheckmate);
      onMove?.(result);
    },
    [mated, onMove],
  );

  const moveExecutor = useMemo(
    () =>
      createMoveExecutor(chess, boardState, config, {
        onMove: handleMove,
        onPromotionRequired: promotion.onPromotionRequired,
      }),
    [boardState, chess, config, handleMove, promotion.onPromotionRequired],
  );

  useChessboardRef({ boardState, chess, moveExecutor, ref: boardRef });
  useFastReset({ boardState, chess, config, mated, resetRef });

  const gesture = useBoardGesture({
    boardState,
    config,
    moveExecutor,
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
          <SheetBoardCanvas mated={mated} progress={progress} resigned={resigned} spriteImage={spriteImage} />
        </View>
      </GestureDetector>
      <PromotionTray
        color={promotion.pending?.color ?? null}
        onCancel={promotion.onCancel}
        onSelect={promotion.onSelect}
      />
    </GestureHandlerRootView>
  );
}

type SheetBoardProps = Omit<GestureBoardProps, 'boardRef'> & {
  boardSize: number;
  fen: string;
  gestureEnabled?: boolean;
};

// memo keeps the board still while its parent re-renders on each move
export const SheetBoard = memo(
  forwardRef<ChessboardRef, SheetBoardProps>(function SheetBoard(
    { boardSize, fen, gestureEnabled, onReady, onMove, progress, resetRef, resignedSide },
    ref,
  ) {
    const { boardColors } = useSheetColors();
    const colors = useMemo(() => ({ ...boardColors, checkmateHighlight: 'transparent' }), [boardColors]);

    return (
      <BoardStateProvider
        boardSize={boardSize}
        colors={colors}
        fen={fen}
        gestureEnabled={gestureEnabled ?? true}
        withLetters={false}
        withNumbers={false}
      >
        <SheetGestureBoard
          boardRef={ref}
          onMove={onMove}
          onReady={onReady}
          progress={progress}
          resetRef={resetRef}
          resignedSide={resignedSide}
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
