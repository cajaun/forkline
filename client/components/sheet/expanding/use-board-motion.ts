import { useMemo } from 'react';
import { PixelRatio } from 'react-native';

import { Extrapolation, interpolate, useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import type { BoardTransform } from '../board-transform';

const DEVICE_PIXEL_RATIO = PixelRatio.get();
const BOARD_RADIUS = 12;

// snaps a value to the device pixel grid so the board edges stay sharp
function toDevicePixel(value: number) {
  'worklet';
  return Math.round(value * DEVICE_PIXEL_RATIO) / DEVICE_PIXEL_RATIO;
}

// scales and moves the board between the closed card and the open sheet
export function useBoardMotion({
  boardSize,
  closedTop,
  openTop,
  previewSize,
  progress,
}: {
  boardSize: number;
  closedTop: number;
  openTop: number;
  previewSize: number;
  progress: SharedValue<number>;
}) {
  const previewScale = previewSize / boardSize;

  const scale = useDerivedValue(() => {
    const rawScale = interpolate(progress.value, [0, 1], [previewScale, 1], Extrapolation.CLAMP);
    return toDevicePixel(boardSize * rawScale) / boardSize;
  });

  const translate = useDerivedValue(() => ({
    x: 0,
    y: toDevicePixel(interpolate(progress.value, [0, 1], [closedTop, openTop]) - openTop),
  }));

  const radius = useDerivedValue(() =>
    interpolate(
      progress.value,
      [0, 1],
      [BOARD_RADIUS / previewScale, BOARD_RADIUS],
      Extrapolation.CLAMP,
    ),
  );

  const boardTransform = useMemo<BoardTransform>(
    () => ({ previewScale, scale, translate }),
    [previewScale, scale, translate],
  );

  return { boardTransform, radius, scale, translate };
}

export type BoardMotion = ReturnType<typeof useBoardMotion>;
