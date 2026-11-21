import { useMemo } from 'react';
import { PixelRatio } from 'react-native';

import { Extrapolation, interpolate, useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import type { BoardTransform } from '../board-transform';

const DEVICE_PIXEL_RATIO = PixelRatio.get();
export const BOARD_RADIUS = 12;

// snaps to whole device pixels, so the board holds still between visible steps
const toDevicePixel = (value: number) =>
  Math.round(value * DEVICE_PIXEL_RATIO) / DEVICE_PIXEL_RATIO;

// moves the board from the preview to its open rect by transform, which lands in the sheet's commit
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

  // the board only travels vertically because both rects share the same left edge
  const translate = useDerivedValue(() => ({
    x: 0,
    y: toDevicePixel(interpolate(progress.value, [0, 1], [closedTop, openTop]) - openTop),
  }));

  // the radius is divided by the scale so the corners read as 12pt at every size
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
