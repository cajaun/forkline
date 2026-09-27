import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { StyleSheet, View } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';

import {
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { Atlas, Canvas, Group, Skia, rect } from '@shopify/react-native-skia';
import type { SkImage, SkRect, SkRSXform } from '@shopify/react-native-skia';
import type { PieceSymbol, Square } from 'chess.js';
import { withSpring } from 'react-native-reanimated';
import { BoardStateProvider, useBoardConfig, useBoardContext, useBoardStateValues } from 'react-native-chessboard/src/state';
import { SkiaDots } from 'react-native-chessboard/src/components/skia/skia-dots';
import { SkiaHighlights } from 'react-native-chessboard/src/components/skia/skia-highlights';
import { usePieceSpriteSheet } from 'react-native-chessboard/src/assets/piece-images';
import type { PieceCode } from 'react-native-chessboard/src/state/types';
import { SQUARES } from 'react-native-chessboard/src/state/types';
import { createMoveExecutor } from 'react-native-chessboard/src/state/move-executor';
import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';
import { squareToPosition } from 'react-native-chessboard/src/state/use-board-state';
import { useBoardGesture } from 'react-native-chessboard/src/hooks/use-board-gesture';
import { PromotionDialog } from 'react-native-chessboard/src/components/promotion-dialog';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_BOARD_COLORS } from '@/constants/sheet';
import { occupiedCellsFromFen } from '@/utils/sheet';
import { AnimatedView } from '@/components/shared/uniwind';

const SPRITE_CELL_SIZE = 128;

const SPRITE_RECTS: Record<NonNullable<PieceCode>, SkRect> = {
  wp: rect(0, 0, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  wn: rect(SPRITE_CELL_SIZE, 0, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  wb: rect(SPRITE_CELL_SIZE * 2, 0, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  wr: rect(SPRITE_CELL_SIZE * 3, 0, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  wq: rect(SPRITE_CELL_SIZE * 4, 0, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  wk: rect(SPRITE_CELL_SIZE * 5, 0, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  bp: rect(0, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  bn: rect(SPRITE_CELL_SIZE, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  bb: rect(SPRITE_CELL_SIZE * 2, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  br: rect(SPRITE_CELL_SIZE * 3, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  bq: rect(SPRITE_CELL_SIZE * 4, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
  bk: rect(SPRITE_CELL_SIZE * 5, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE, SPRITE_CELL_SIZE),
};

function NativeBoardSurface({ boardSize, fen, progress }: {
  boardSize: number;
  fen: string;
  progress: SharedValue<number>;
}) {
  const cell = boardSize / 8;

  // rebuild preview markers only when the board position changes
  const occupied = useMemo(() => occupiedCellsFromFen(fen), [fen]);
  const markerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.12, 0.56, 0.86, 1],
      [1, 0.7, 0.25, 0, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {Array.from({ length: 64 }, (_, index) => {
        const column = index % 8;
        const row = Math.floor(index / 8);

        return (
          <View
            key={`square-${index}`}
            style={{
              backgroundColor:
                (row + column) % 2 === 0
                  ? SHEET_BOARD_COLORS.white
                  : SHEET_BOARD_COLORS.black,
              height: cell,
              left: column * cell,
              position: 'absolute',
              top: row * cell,
              width: cell,
            }}
          />
        );
      })}
      <AnimatedView
        className="absolute inset-0"
        pointerEvents="none"
        style={markerStyle}>
        {[...occupied].map(index => {
          const column = index % 8;
          const row = Math.floor(index / 8);
          const markerSize = Math.max(6, cell * 0.4);

          return (
            <View
              className="absolute items-center justify-center"
              key={`marker-${index}`}
              style={{
                height: cell,
                left: column * cell,
                top: row * cell,
                width: cell,
              }}>
              <Svg
                height={markerSize}
                viewBox="0 0 100 100"
                width={markerSize}>
                <SvgPath
                  d="M46 4Q50 2 54 4L91 25Q96 28 96 33V67Q96 72 91 75L54 96Q50 98 46 96L9 75Q4 72 4 67V33Q4 28 9 25Z"
                  fill="#bfbfbf"
                />
              </Svg>
            </View>
          );
        })}
      </AnimatedView>
    </View>
  );
}

function PieceLayer({ boardSize, boardState, progress, spriteImage }: {
  boardSize: number;
  boardState: ReturnType<typeof useBoardStateValues>;
  progress: SharedValue<number>;
  spriteImage: SkImage | null;
}) {
  const pieceScale = boardSize / 8 / SPRITE_CELL_SIZE;
  const opacity = useDerivedValue(() =>
    interpolate(
      progress.value,
      [0, 0.12, 0.2, 1],
      [0, 0.72, 1, 1],
      Extrapolation.CLAMP,
    ),
  );
  const sprites = useDerivedValue(() => {
    const sprites: SkRect[] = [];
    const pieces: {
      piece: NonNullable<PieceCode>;
      square: Square;
      zIndex: number;
    }[] = [];

    for (const square of SQUARES) {
      const state = boardState.squares[square];
      const piece = state.piece.get();
      if (piece) pieces.push({ piece, square, zIndex: state.zIndex.get() });
    }

    pieces.sort((a, b) => a.zIndex - b.zIndex);

    for (const { piece } of pieces) {
      sprites.push(SPRITE_RECTS[piece]);
    }

    return sprites;
  });
  const transforms = useDerivedValue(() => {
    const revealScale = interpolate(
      progress.value,
      [0, 0.12, 0.56, 1],
      [0.12, 0.28, 1, 1],
      Extrapolation.CLAMP,
    );
    const transforms: SkRSXform[] = [];
    const pieces: {
      piece: NonNullable<PieceCode>;
      square: Square;
      zIndex: number;
    }[] = [];

    for (const square of SQUARES) {
      const state = boardState.squares[square];
      const piece = state.piece.get();
      if (piece) pieces.push({ piece, square, zIndex: state.zIndex.get() });
    }

    pieces.sort((a, b) => a.zIndex - b.zIndex);

    for (const { square } of pieces) {
      const state = boardState.squares[square];
      const x = state.translateX.get();
      const y = state.translateY.get();
      const scale = state.scale.get() * pieceScale * revealScale;
      const centerX = x + boardSize / 16;
      const centerY = y + boardSize / 16;
      const scaledHalf = (SPRITE_CELL_SIZE / 2) * scale;

      transforms.push(
        Skia.RSXform(scale, 0, centerX - scaledHalf, centerY - scaledHalf),
      );
    }

    return transforms;
  });

  // wait for the atlas before drawing any pieces
  if (!spriteImage) return null;

  return (
    <Group opacity={opacity}>
      <Atlas image={spriteImage} sprites={sprites} transforms={transforms} />
    </Group>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
  },
});

function SheetBoardCanvas({ progress, spriteImage }: {
  progress: SharedValue<number>;
  spriteImage: SkImage | null;
}) {
  const config = useBoardConfig();
  const boardState = useBoardStateValues();

  return (
    <Canvas style={{ height: config.boardSize, width: config.boardSize }}>
      <SkiaHighlights config={config} boardState={boardState} />
      <SkiaDots config={config} boardState={boardState} />
      <PieceLayer
        boardSize={config.boardSize}
        boardState={boardState}
        progress={progress}
        spriteImage={spriteImage}
      />
    </Canvas>
  );
}

interface PromotionInfo {
  from: Square;
  to: Square;
  color: 'w' | 'b';
  complete: (piece: PieceSymbol) => void;
  cancel: () => void;
}

function SheetGestureBoard({
  markerFen,
  onReady,
  onMove,
  progress,
}: {
  markerFen: string;
  onReady?: (ready: boolean) => void;
  onMove?: (result: MoveResult) => void;
  progress: SharedValue<number>;
}) {
  const { chess } = useBoardContext();
  const config = useBoardConfig();
  const boardState = useBoardStateValues();
  const { image: spriteImage } = usePieceSpriteSheet();
  const promotionInfoRef = useRef<PromotionInfo | null>(null);
  const [showPromotion, setShowPromotion] = useState(false);

  useEffect(() => {
    // gate the opening transition on the native sprite asset
    onReady?.(spriteImage !== null);
  }, [onReady, spriteImage]);

  const handlePromotionRequired = useCallback((info: PromotionInfo) => {
    promotionInfoRef.current?.cancel();
    promotionInfoRef.current = info;
    setShowPromotion(true);
  }, []);

  const handlePromotionSelect = useCallback((piece: PieceSymbol) => {
    const info = promotionInfoRef.current;
    if (!info) return;

    info.complete(piece);
    promotionInfoRef.current = null;
    setShowPromotion(false);
  }, []);

  const handlePromotionCancel = useCallback(() => {
    const info = promotionInfoRef.current;
    if (info) {
      const fromState = boardState.squares[info.from];
      const originPos = squareToPosition(
        info.from,
        config.pieceSize,
        config.flipped,
      );
      fromState.translateX.set(withSpring(originPos.x, config.animations.snapBack));
      fromState.translateY.set(withSpring(originPos.y, config.animations.snapBack));
      fromState.scale.set(withSpring(1, config.animations.scale));
      fromState.zIndex.set(0);
      boardState.selectedSquare.set(null);
      boardState.validMoves.set([]);
      info.cancel();
    }

    promotionInfoRef.current = null;
    setShowPromotion(false);
  }, [boardState, config]);

  const moveExecutor = useMemo(
    () =>
      createMoveExecutor(chess, boardState, config, {
        onMove,
        onPromotionRequired: handlePromotionRequired,
      }),
    [chess, boardState, config, handlePromotionRequired, onMove],
  );

  const gesture = useBoardGesture({
    boardState,
    config,
    moveExecutor,
    // block board input while the promotion dialog owns the gesture
    gestureEnabled: config.gestureEnabled && !showPromotion,
  });

  const containerStyle = useMemo(
    () => [
      styles.container,
      { height: config.boardSize, width: config.boardSize },
    ],
    [config.boardSize],
  );

  return (
    <GestureHandlerRootView style={containerStyle}>
      <GestureDetector gesture={gesture}>
        <View style={containerStyle}>
          <NativeBoardSurface
            boardSize={config.boardSize}
            fen={markerFen}
            progress={progress}
          />
          <SheetBoardCanvas progress={progress} spriteImage={spriteImage} />
        </View>
      </GestureDetector>
      {showPromotion && promotionInfoRef.current && (
        <PromotionDialog
          color={promotionInfoRef.current.color}
          onSelect={handlePromotionSelect}
          onCancel={handlePromotionCancel}
          config={config}
        />
      )}
    </GestureHandlerRootView>
  );
}

export function SheetBoard({
  boardSize,
  fen,
  markerFen,
  open,
  onReady,
  onMove,
  progress,
}: {
  boardSize: number;
  fen: string;
  markerFen: string;
  open: boolean;
  onReady?: (ready: boolean) => void;
  onMove?: (result: MoveResult) => void;
  progress: SharedValue<number>;
}) {
  return (
    <BoardStateProvider
      boardSize={boardSize}
      colors={SHEET_BOARD_COLORS}
      fen={fen}
      gestureEnabled={open}
      withLetters={false}
      withNumbers={false}>
      <SheetGestureBoard
        markerFen={markerFen}
        onReady={onReady}
        onMove={onMove}
        progress={progress}
      />
    </BoardStateProvider>
  );
}
