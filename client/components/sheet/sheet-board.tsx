import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { StyleSheet, View } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';

import {
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import {
  Atlas,
  Canvas,
  Group,
  Image as SkiaImage,
  Path,
  Rect,
  Skia,
  rect,
  useImage,
} from '@shopify/react-native-skia';
import type { SkImage, SkRect, SkRSXform } from '@shopify/react-native-skia';
import type { PieceSymbol, Square } from 'chess.js';
import { Easing, withSpring, withTiming } from 'react-native-reanimated';
import { BoardStateProvider, useBoardConfig, useBoardContext, useBoardStateValues } from 'react-native-chessboard/src/state';
import { SkiaHighlights } from 'react-native-chessboard/src/components/skia/skia-highlights';
import { usePieceSpriteSheet } from 'react-native-chessboard/src/assets/piece-images';
import type { PieceCode } from 'react-native-chessboard/src/state/types';
import { SQUARES } from 'react-native-chessboard/src/state/types';
import { useChessboardRef } from 'react-native-chessboard/src/hooks/use-chessboard-ref';
import type { ChessboardRef } from 'react-native-chessboard/src/hooks/use-chessboard-ref';
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

import {
  CHECKMATE_KING_IMG,
  DARK_PIECE_SPRITE,
  GAME_OVER_KING_IMG,
  PIECE_SPRITE,
} from '@/constants/chess-pieces';
import {
  SHEET_BOARD_MOVE_SPRING,
} from '@/constants/sheet';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { kingCellFromFen, pieceCellsFromFen } from '@/utils/sheet';
import { AnimatedView } from '@/components/shared/uniwind';

const SPRITE_CELL_SIZE = 512;

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

const MOVE_DOT_RADIUS_SCALE = 0.08;
// Keep the preview markers visible until the board is nearly open, then let
// the full pieces finish their reveal with the sheet rather than halfway
// through its spring.
const PIECE_REVEAL_OPACITY = [0, 0.2, 0.78, 1] as const;
const PIECE_REVEAL_OPACITY_VALUES = [0, 0.55, 1, 1] as const;
const PIECE_REVEAL_START_SCALE = 0.12;
const KING_STATE_FADE_OPTIONS = {
  duration: 180,
  easing: Easing.linear,
};

export type KingDisplayState = 'checkmate' | 'gameOver' | null;

function SheetBoardDots({
  boardState,
  config,
}: {
  boardState: ReturnType<typeof useBoardStateValues>;
  config: ReturnType<typeof useBoardConfig>;
}) {
  const radius = config.pieceSize * MOVE_DOT_RADIUS_SCALE;
  const half = config.pieceSize / 2;
  const path = useDerivedValue(() => {
    const nextPath = Skia.Path.Make();
    const moves = boardState.validMoves.get();

    for (let index = 0; index < moves.length; index += 1) {
      const position = squareToPosition(
        moves[index],
        config.pieceSize,
        config.flipped,
      );
      nextPath.addCircle(position.x + half, position.y + half, radius);
    }

    return nextPath;
  });

  return <Path color="rgba(0, 0, 0, 0.3)" opacity={0.5} path={path} />;
}

function NativeBoardSurface({
  boardSize,
  colors,
  fen,
  kingDisplayState,
  progress,
}: {
  boardSize: number;
  colors: Pick<ReturnType<typeof useBoardConfig>['colors'], 'black' | 'white'>;
  fen: string;
  kingDisplayState: KingDisplayState;
  progress: SharedValue<number>;
}) {
  const { colors: sheetColors } = useSheetColors();
  const cell = boardSize / 8;

  // rebuild preview markers only when the board position changes
  const pieces = useMemo(() => pieceCellsFromFen(fen), [fen]);
  const kingCell = useMemo(() => kingCellFromFen(fen), [fen]);
  const markerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.2, 0.7, 0.96, 1],
      [1, 0.85, 0.35, 0, 0],
      Extrapolation.CLAMP,
    ),
  }));
  const kingMarkerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.12, 0.2, 1],
      [1, 0, 0, 0],
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
                index === kingCell && kingDisplayState === 'gameOver'
                  ? '#FEC2C4'
                    : index === kingCell && kingDisplayState === 'checkmate'
                      ? '#FFE1C1'
                      : (row + column) % 2 === 0
                        ? colors.white
                        : colors.black,
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
        {[...pieces].map(([index, pieceColor]) => {
          const column = index % 8;
          const row = Math.floor(index / 8);
          const markerSize = Math.max(6, cell * 0.4);

          return (
            <AnimatedView
              className="absolute items-center justify-center"
              key={`marker-${index}`}
              style={[
                {
                  height: cell,
                  left: column * cell,
                  top: row * cell,
                  width: cell,
                },
                index === kingCell && kingDisplayState !== null
                  ? kingMarkerStyle
                  : undefined,
              ]}>
              <Svg
                height={markerSize}
                viewBox="0 0 100 100"
                width={markerSize}>
                <SvgPath
                  d="M46 4Q50 2 54 4L91 25Q96 28 96 33V67Q96 72 91 75L54 96Q50 98 46 96L9 75Q4 72 4 67V33Q4 28 9 25Z"
                  fill={
                    index === kingCell
                      ? kingDisplayState === 'gameOver'
                        ? '#FF3F43'
                        : kingDisplayState === 'checkmate'
                          ? '#FD8223'
                          : pieceColor === 'black'
                            ? sheetColors.pieceBlack
                            : sheetColors.pieceWhite
                      : pieceColor === 'black'
                        ? sheetColors.pieceBlack
                        : sheetColors.pieceWhite
                  }
                />
              </Svg>
            </AnimatedView>
          );
        })}
      </AnimatedView>
    </View>
  );
}

function PieceLayer({
  boardSize,
  boardState,
  progress,
  revealScale,
  spriteImage,
}: {
  boardSize: number;
  boardState: ReturnType<typeof useBoardStateValues>;
  progress: SharedValue<number>;
  revealScale: SharedValue<number>;
  spriteImage: SkImage | null;
}) {
  const pieceScale = boardSize / 8 / SPRITE_CELL_SIZE;
  const opacity = useDerivedValue(() =>
    interpolate(
      progress.value,
      PIECE_REVEAL_OPACITY,
      PIECE_REVEAL_OPACITY_VALUES,
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
      const scale = state.scale.get() * pieceScale * revealScale.value;
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

function SpecialKingLayer({
  boardState,
  config,
  gameOverImage,
  kingDisplayState,
  checkmateImage,
  progress,
  revealScale,
}: {
  boardState: ReturnType<typeof useBoardStateValues>;
  config: ReturnType<typeof useBoardConfig>;
  gameOverImage: SkImage | null;
  kingDisplayState: KingDisplayState;
  checkmateImage: SkImage | null;
  progress: SharedValue<number>;
  revealScale: SharedValue<number>;
}) {
  const kingRect = useDerivedValue(() => {
    const square = boardState.kingInCheckSquare.get();
    if (!square) return rect(0, 0, 0, 0);

    const position = squareToPosition(
      square,
      config.pieceSize,
      config.flipped,
    );
    return rect(position.x, position.y, config.pieceSize, config.pieceSize);
  });
  const kingOpacity = useDerivedValue(() => {
    const square = boardState.kingInCheckSquare.get();
    const piece = square ? boardState.squares[square].piece.get() : null;
    const isKing = piece === 'wk' || piece === 'bk';

    return withTiming(
      isKing && kingDisplayState !== null ? 1 : 0,
      KING_STATE_FADE_OPTIONS,
    );
  });
  const boardRevealOpacity = useDerivedValue(() =>
    interpolate(
      progress.value,
      PIECE_REVEAL_OPACITY,
      PIECE_REVEAL_OPACITY_VALUES,
      Extrapolation.CLAMP,
    ),
  );
  const visibleKingRect = useDerivedValue(() => {
    if (kingRect.value.width === 0 || kingRect.value.height === 0) {
      return rect(0, 0, 0, 0);
    }

    const scale = revealScale.value;
    const size = config.pieceSize * scale;

    return rect(
      kingRect.value.x + (config.pieceSize - size) / 2,
      kingRect.value.y + (config.pieceSize - size) / 2,
      size,
      size,
    );
  });
  const checkmateStateOpacity = useDerivedValue(() => {
    const square = boardState.kingInCheckSquare.get();
    const piece = square ? boardState.squares[square].piece.get() : null;
    const isKing = piece === 'wk' || piece === 'bk';

    return withTiming(
      isKing && kingDisplayState === 'checkmate' ? 1 : 0,
      KING_STATE_FADE_OPTIONS,
    );
  });
  const gameOverStateOpacity = useDerivedValue(() => {
    const square = boardState.kingInCheckSquare.get();
    const piece = square ? boardState.squares[square].piece.get() : null;
    const isKing = piece === 'wk' || piece === 'bk';

    return withTiming(
      isKing && kingDisplayState === 'gameOver' ? 1 : 0,
      KING_STATE_FADE_OPTIONS,
    );
  });
  const checkmateKingOpacity = useDerivedValue(
    () => checkmateStateOpacity.value * boardRevealOpacity.value,
  );
  const gameOverKingOpacity = useDerivedValue(
    () => gameOverStateOpacity.value * boardRevealOpacity.value,
  );
  const visibleKingOpacity = useDerivedValue(
    () => kingOpacity.value * boardRevealOpacity.value,
  );
  const kingHighlightColor =
    kingDisplayState === 'gameOver' ? '#FEC2C4' : '#FFE1C1';

  return (
    <Group>
      <Rect
        color={kingHighlightColor}
        opacity={visibleKingOpacity}
        rect={kingRect}
      />
      <SkiaImage
        fit="contain"
        image={checkmateImage}
        opacity={checkmateKingOpacity}
        rect={visibleKingRect}
      />
      <SkiaImage
        fit="contain"
        image={gameOverImage}
        opacity={gameOverKingOpacity}
        rect={visibleKingRect}
      />
    </Group>
  );
}

function SelectedSquareHighlight({
  boardState,
  config,
}: {
  boardState: ReturnType<typeof useBoardStateValues>;
  config: ReturnType<typeof useBoardConfig>;
}) {
  const selectedRect = useDerivedValue(() => {
    const square = boardState.selectedSquare.get();
    if (!square) return { height: 0, width: 0, x: 0, y: 0 };

    const position = squareToPosition(square, config.pieceSize, config.flipped);
    return {
      height: config.pieceSize,
      width: config.pieceSize,
      x: position.x,
      y: position.y,
    };
  });
  const opacity = useDerivedValue(() =>
    boardState.selectedSquare.get() ? 1 : 0,
  );

  return (
    <Rect
      color={config.colors.lastMoveHighlight}
      opacity={opacity}
      rect={selectedRect}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
  },
});

function SheetBoardCanvas({
  boardScale,
  kingDisplayState,
  progress,
  previewScale,
  spriteImage,
}: {
  boardScale: SharedValue<number>;
  kingDisplayState: KingDisplayState;
  progress: SharedValue<number>;
  previewScale: number;
  spriteImage: SkImage | null;
}) {
  const config = useBoardConfig();
  const boardState = useBoardStateValues();
  const checkmateKingImage = useImage(CHECKMATE_KING_IMG);
  const gameOverKingImage = useImage(GAME_OVER_KING_IMG);
  const boardRevealScale = useDerivedValue(() => {
    // First define the desired on-screen piece size from the board size, then
    // solve for the inner scale. This prevents the board transform from being
    // multiplied by a second, faster reveal curve.
    const totalPieceScale = interpolate(
      boardScale.value,
      [previewScale, 1],
      [previewScale * PIECE_REVEAL_START_SCALE, 1],
      Extrapolation.CLAMP,
    );

    return totalPieceScale / boardScale.value;
  });

  return (
    <Canvas style={{ height: config.boardSize, width: config.boardSize }}>
      <SkiaHighlights config={config} boardState={boardState} />
      <SelectedSquareHighlight boardState={boardState} config={config} />
      <SheetBoardDots config={config} boardState={boardState} />
      <PieceLayer
        boardSize={config.boardSize}
        boardState={boardState}
        progress={progress}
        revealScale={boardRevealScale}
        spriteImage={spriteImage}
      />
      <SpecialKingLayer
        boardState={boardState}
        config={config}
        gameOverImage={gameOverKingImage}
        kingDisplayState={kingDisplayState}
        checkmateImage={checkmateKingImage}
        progress={progress}
        revealScale={boardRevealScale}
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
  boardRef,
  boardScale,
  kingDisplayState,
  markerFen,
  onReady,
  onMove,
  previewScale,
  progress,
}: {
  boardRef: React.Ref<ChessboardRef>;
  boardScale: SharedValue<number>;
  kingDisplayState: KingDisplayState;
  markerFen: string;
  onReady?: (ready: boolean) => void;
  onMove?: (result: MoveResult) => void;
  previewScale: number;
  progress: SharedValue<number>;
}) {
  const { chess } = useBoardContext();
  const { isDark } = useSheetColors();
  const providerConfig = useBoardConfig();
  const config = useMemo(
    () => ({
      ...providerConfig,
      animations: {
        ...providerConfig.animations,
        move: SHEET_BOARD_MOVE_SPRING,
      },
    }),
    [providerConfig],
  );
  const boardState = useBoardStateValues();
  const { image: spriteImage } = usePieceSpriteSheet(
    isDark ? DARK_PIECE_SPRITE : PIECE_SPRITE,
  );
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

  useChessboardRef({
    boardState,
    chess,
    moveExecutor,
    ref: boardRef,
  });

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
            colors={config.colors}
            fen={markerFen}
            kingDisplayState={kingDisplayState}
            progress={progress}
          />
          <SheetBoardCanvas
            boardScale={boardScale}
            kingDisplayState={kingDisplayState}
            progress={progress}
            previewScale={previewScale}
            spriteImage={spriteImage}
          />
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

type SheetBoardProps = {
  boardScale: SharedValue<number>;
  boardSize: number;
  fen: string;
  kingDisplayState: KingDisplayState;
  markerFen: string;
  open: boolean;
  onReady?: (ready: boolean) => void;
  onMove?: (result: MoveResult) => void;
  previewScale: number;
  progress: SharedValue<number>;
  gestureEnabled?: boolean;
};

export const SheetBoard = forwardRef<ChessboardRef, SheetBoardProps>(
  function SheetBoard(
    {
      boardScale,
      boardSize,
      fen,
      gestureEnabled,
      kingDisplayState,
      markerFen,
      open,
      onReady,
      onMove,
      progress,
      previewScale,
    },
    ref,
  ) {
    const { boardColors } = useSheetColors();

    return (
      <BoardStateProvider
        boardSize={boardSize}
        colors={{ ...boardColors, checkmateHighlight: 'transparent' }}
        fen={fen}
        gestureEnabled={gestureEnabled ?? open}
        withLetters={false}
        withNumbers={false}>
        <SheetGestureBoard
          boardRef={ref}
          boardScale={boardScale}
          markerFen={markerFen}
          onReady={onReady}
          onMove={onMove}
          previewScale={previewScale}
          progress={progress}
          kingDisplayState={kingDisplayState}
        />
      </BoardStateProvider>
    );
  },
);

SheetBoard.displayName = 'SheetBoard';
