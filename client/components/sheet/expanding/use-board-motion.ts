import { useMemo } from 'react';
import { PixelRatio } from 'react-native';

import { Extrapolation, interpolate, useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_RESULT } from '@/constants/sheet';

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
  result,
  resultTop,
}: {
  boardSize: number;
  closedTop: number;
  openTop: number;
  previewSize: number;
  progress: SharedValue<number>;
  result: SharedValue<number>;
  resultTop: number;
}) {
  const previewScale = previewSize / boardSize;

  // a won game shrinks the open board toward the header and only while the sheet is open
  const shrink = useDerivedValue(() => {
    const open = interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    return result.value * open;
  });

  const scale = useDerivedValue(() => {
    const rawScale = interpolate(progress.value, [0, 1], [previewScale, 1], Extrapolation.CLAMP);
    const resultScale = 1 - (1 - SHEET_RESULT.boardScale) * shrink.value;
    return toDevicePixel(boardSize * rawScale * resultScale) / boardSize;
  });

  // the shrunken board keeps its top edge at the result line
  const resultShift = resultTop - openTop - (boardSize * (1 - SHEET_RESULT.boardScale)) / 2;
  const translate = useDerivedValue(() => ({
    x: 0,
    y: toDevicePixel(
      interpolate(progress.value, [0, 1], [closedTop, openTop]) - openTop + resultShift * shrink.value,
    ),
  }));

  // the corner radius divides out the scale so it reads the same at every size
  const radius = useDerivedValue(() => BOARD_RADIUS / scale.value);

  const boardTransform = useMemo<BoardTransform>(
    () => ({ previewScale, scale, translate }),
    [previewScale, scale, translate],
  );

  return { boardTransform, radius, scale, translate };
}

export type BoardMotion = ReturnType<typeof useBoardMotion>;
