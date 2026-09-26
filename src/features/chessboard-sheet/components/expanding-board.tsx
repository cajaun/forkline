import { useCallback, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Chessboard from 'react-native-chessboard';
import type { MoveResult } from 'react-native-chessboard';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_BOARD_COLORS, SHEET_LAYOUT } from '../config';
import { capturedFromFen } from '../utils';
import { AnimatedView } from '../../../shared/uniwind';
import { SheetPlayerBar } from './player-bar';
import { PreviewSurface } from './preview-surface';

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
  const playStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.52, 0.72],
      [1, 1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [1 / previewScale, 0.5],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const playerTopStyle = useAnimatedStyle(() => ({
    left: interpolate(progress.value, [0, 1], [closedLeft, openLeft]),
    opacity: interpolate(progress.value, [0, 0.55, 0.8, 1], [0, 0, 0.8, 1], Extrapolation.CLAMP),
    top: interpolate(
      progress.value,
      [0, 1],
      [closedTop + boardSize * 0.22, openTop - 52],
    ),
  }));
  const playerBottomStyle = useAnimatedStyle(() => ({
    left: interpolate(progress.value, [0, 1], [closedLeft, openLeft]),
    opacity: interpolate(progress.value, [0, 0.55, 0.8, 1], [0, 0, 0.8, 1], Extrapolation.CLAMP),
    top: interpolate(
      progress.value,
      [0, 1],
      [closedTop + boardSize * 0.62, openTop + boardSize + 8],
    ),
  }));
  const borderStyle = useAnimatedStyle(() => ({
    borderWidth: interpolate(
      progress.value,
      [0, 0.7, 1],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <>
      <AnimatedView
        className="absolute z-[1]"
        pointerEvents="none"
        style={[{ width: boardSize }, playerTopStyle]}>
        <SheetPlayerBar captured={captured.b} side="b" />
      </AnimatedView>
      <AnimatedView
        className="absolute z-[1]"
        pointerEvents="none"
        style={[{ width: boardSize }, playerBottomStyle]}>
        <SheetPlayerBar captured={captured.w} side="w" />
      </AnimatedView>
      <AnimatedView
        className="absolute z-[2] overflow-hidden rounded-lg"
        pointerEvents="box-none"
        style={[{ height: boardSize, width: boardSize }, boardStyle, borderStyle]}>
        <View className="absolute inset-0" pointerEvents={open ? 'auto' : 'none'}>
          <Chessboard
            boardSize={boardSize}
            colors={SHEET_BOARD_COLORS}
            fen={boardFen}
            gestureEnabled={open}
            onMove={handleMove}
            withLetters
            withNumbers
          />
        </View>
        <PreviewSurface boardSize={boardSize} fen={boardFen} progress={progress} />
        <AnimatedView
          className="absolute inset-0 z-[3] items-center justify-center"
          pointerEvents={open ? 'none' : 'box-none'}
          style={playStyle}>
          <Pressable
            accessibilityLabel="Open chessboard"
            className="h-14 w-[110px] flex-row items-center justify-center gap-2 rounded-[28px] bg-[#262626]"
            onPress={onOpen}>
            <Ionicons name="play" size={24} color="#ffffff" />
            <Text
              className="text-[22px] text-white"
              style={{ fontFamily: 'SF-Pro-Rounded-Bold' }}>
              Play
            </Text>
          </Pressable>
        </AnimatedView>
      </AnimatedView>
    </>
  );
}
