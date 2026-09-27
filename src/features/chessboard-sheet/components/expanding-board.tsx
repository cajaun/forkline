import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions } from 'react-native';

import Chessboard from 'react-native-chessboard';
import type { MoveResult } from 'react-native-chessboard';
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_BOARD_COLORS, SHEET_LAYOUT } from '../config';
import { capturedFromFen, kingsOnlyFen } from '../utils';
import { AnimatedView } from '../../../shared/uniwind';
import { SfSymbol } from '../../../shared/sf-symbol';
import { BoardCaptures } from './board-captures';
import { BoardMeta } from './board-meta';
import { PreviewSurface } from './preview-surface';
import { PreviewPieces } from './preview-pieces';

export function ExpandingBoard({
  boardFen,
  boardSize,
  closedCenterY,
  onOpen,
  open,
  openCenterY,
  previewSize,
  progress,
}: {
  boardFen: string;
  boardSize: number;
  closedCenterY: number;
  onOpen: () => void;
  open: boolean;
  openCenterY: number;
  previewSize: number;
  progress: SharedValue<number>;
}) {
  const { height, width } = useWindowDimensions();
  const closedLeft = width / 2 - SHEET_LAYOUT.sheetGutter - boardSize / 2;
  const openLeft = (width - boardSize) / 2;
  const closedTop = closedCenterY - height * SHEET_LAYOUT.closedTop - boardSize / 2;
  const openTop = openCenterY - boardSize / 2;
  const previewScale = previewSize / boardSize;
  const previewFen = useMemo(() => kingsOnlyFen(boardFen), [boardFen]);
  const [displayFen, setDisplayFen] = useState(previewFen);
  const [showPieces, setShowPieces] = useState(false);
  const [boardReady, setBoardReady] = useState(false);
  const [captured, setCaptured] = useState(() => capturedFromFen(boardFen));
  const handleMove = useCallback((result: MoveResult) => {
    const piece = result.move.captured;
    if (!piece) return;

    const side = result.move.color === 'w' ? 'w' : 'b';
    setCaptured(previous => ({
      ...previous,
      [side]: [...previous[side], piece],
    }));
  }, []);
  useEffect(() => {
    setDisplayFen(boardFen);
  }, [boardFen]);
  const closedBorderWidth = 1;
  const closedBorderRadius = 10;
  const openBorderWidth = 1.5;
  const openBorderRadius = 10;

  const boardStyle = useAnimatedStyle(() => ({
    left: interpolate(progress.value, [0, 1], [closedLeft, openLeft]),
    top: interpolate(progress.value, [0, 1], [closedTop, openTop]),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [previewScale, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const boardClipStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(
      progress.value,
      [0, 1],
      [closedBorderRadius / previewScale, openBorderRadius],
      Extrapolation.CLAMP,
    ),
  }));
  useAnimatedReaction(
    () => progress.value >= 0.94,
    (visible, previous) => {
      if (visible === previous) return;
      runOnJS(setShowPieces)(visible);
    },
  );
  useEffect(() => {
    if (!showPieces) {
      setBoardReady(false);
      return;
    }

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setBoardReady(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [showPieces]);
  const playStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.45],
          [1 / previewScale, 0],
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(progress.value, [0, 0.45], [8, -25], Extrapolation.CLAMP),
      },
    ],
  }));
  const borderStyle = useAnimatedStyle(() => ({
    left: interpolate(
      progress.value,
      [0, 1],
      [
        closedLeft + (boardSize - previewSize) / 2 - closedBorderWidth,
        openLeft,
      ],
    ),
    top: interpolate(
      progress.value,
      [0, 1],
      [
        closedTop + (boardSize - previewSize) / 2 - closedBorderWidth,
        openTop,
      ],
    ),
    height: interpolate(
      progress.value,
      [0, 1],
      [previewSize + closedBorderWidth * 2, boardSize],
    ),
    borderWidth: interpolate(
      progress.value,
      [0, 1],
      [closedBorderWidth, openBorderWidth],
      Extrapolation.CLAMP,
    ),
    borderRadius: interpolate(
      progress.value,
      [0, 1],
      [closedBorderRadius, openBorderRadius],
    ),
    width: interpolate(
      progress.value,
      [0, 1],
      [previewSize + closedBorderWidth * 2, boardSize],
    ),
  }));

  return (
    <>
      <BoardMeta
        boardSize={boardSize}
        closedLeft={closedLeft}
        closedTop={closedTop}
        openLeft={openLeft}
        openTop={openTop}
        progress={progress}
      />
      <BoardCaptures
        boardSize={boardSize}
        captured={captured}
        closedLeft={closedLeft}
        closedTop={closedTop}
        openLeft={openLeft}
        openTop={openTop}
        previewSize={previewSize}
        progress={progress}
      />
      <AnimatedView
        className="absolute z-[2] overflow-hidden rounded-lg"
        pointerEvents="box-none"
        style={[{ height: boardSize, width: boardSize }, boardStyle, boardClipStyle]}>
        <AnimatedView
          className="absolute inset-0"
          pointerEvents={boardReady ? 'auto' : 'none'}>
          <Chessboard
            boardSize={boardSize}
            colors={SHEET_BOARD_COLORS}
            fen={displayFen}
            gestureEnabled={boardReady}
            onMove={handleMove}
            withLetters={boardReady}
            withNumbers={boardReady}
          />
        </AnimatedView>
        <PreviewSurface
          boardSize={boardSize}
          fen={boardFen}
          showPieces={boardReady}
        />
        <PreviewPieces boardSize={boardSize} fen={boardFen} progress={progress} />
        <AnimatedView
          className="absolute inset-0 z-[3] items-center justify-center"
          pointerEvents={open ? 'none' : 'box-none'}
          style={playStyle}>
          <Pressable
            accessibilityLabel="Open chessboard"
            className="h-14 w-[110px] flex-row items-center justify-center gap-1 rounded-[28px] bg-[#262626]"
            onPress={onOpen}>
            <SfSymbol
              fallback="play"
              name="play.fill"
              size={22}
              tintColor="#ffffff"
              weight="medium"
            />
            <Text
              className="text-white"
              style={{ fontSize: 24, fontWeight: '700' }}>
              Play
            </Text>
          </Pressable>
        </AnimatedView>
      </AnimatedView>
      <AnimatedView
        className="absolute z-[3] rounded-[10px]"
        pointerEvents="none"
        style={[
          {
            borderColor: '#262626',
            borderCurve: 'continuous',
            height: previewSize + closedBorderWidth * 2,
            width: previewSize + closedBorderWidth * 2,
          },
          borderStyle,
        ]}
      />
    </>
  );
}
