import { useMemo } from 'react';

import { View } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_BOARD_COLORS } from '../config';
import { occupiedCellsFromFen } from '../utils';
import { AnimatedView } from '../../../shared/uniwind';

export function PreviewSurface({
  boardSize,
  fen,
  progress,
}: {
  boardSize: number;
  fen: string;
  progress: SharedValue<number>;
}) {
  const occupied = useMemo(() => occupiedCellsFromFen(fen), [fen]);
  const maskStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.42, 0.7, 0.84],
      [1, 1, 0.16, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <AnimatedView
      className="absolute inset-0 z-[2]"
      pointerEvents="none"
      style={maskStyle}>
      {Array.from({ length: 64 }, (_, index) => {
        const cell = boardSize / 8;
        const col = index % 8;
        const row = Math.floor(index / 8);
        const dot = Math.max(6, cell * 0.3);

        return (
          <View
            key={index}
            className="absolute items-center justify-center"
            style={{
              backgroundColor:
                (row + col) % 2 === 0
                  ? SHEET_BOARD_COLORS.white
                  : SHEET_BOARD_COLORS.black,
              height: cell,
              left: col * cell,
              top: row * cell,
              width: cell,
            }}>
            {occupied.has(index) ? (
              <View
                className="bg-[#bfbfbf]"
                style={{ borderRadius: dot / 2, height: dot, width: dot }}
              />
            ) : null}
          </View>
        );
      })}
    </AnimatedView>
  );
}
