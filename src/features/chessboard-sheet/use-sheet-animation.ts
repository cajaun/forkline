import { useCallback, useState } from 'react';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SHEET_LAYOUT, SHEET_SPRING } from './config';

export function useSheetAnimation(height: number) {
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);

  const openSheet = useCallback(() => {
    setOpen(true);
    progress.value = withSpring(1, SHEET_SPRING);
  }, [progress]);

  const closeSheet = useCallback(() => {
    setOpen(false);
    progress.value = withSpring(0, SHEET_SPRING);
  }, [progress]);

  const sheetStyle = useAnimatedStyle(() => ({
    bottom: interpolate(
      progress.value,
      [0, 1],
      [height * SHEET_LAYOUT.closedBottom, 0],
      Extrapolation.CLAMP,
    ),
    borderRadius: SHEET_LAYOUT.sheetRadius,
    left: interpolate(
      progress.value,
      [0, 1],
      [SHEET_LAYOUT.sheetGutter, 0],
      Extrapolation.CLAMP,
    ),
    right: interpolate(
      progress.value,
      [0, 1],
      [SHEET_LAYOUT.sheetGutter, 0],
      Extrapolation.CLAMP,
    ),
    top: interpolate(
      progress.value,
      [0, 1],
      [height * SHEET_LAYOUT.closedTop, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return { closeSheet, open, openSheet, progress, sheetStyle };
}
