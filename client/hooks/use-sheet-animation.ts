import { PixelRatio } from 'react-native';
import { useCallback, useState } from 'react';

import * as Haptics from 'expo-haptics';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SHEET_LAYOUT, SHEET_SPRING } from '@/constants/sheet';

const DEVICE_PIXEL_RATIO = PixelRatio.get();

export function useSheetAnimation(height: number) {
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);

  const openSheet = useCallback(() => {
    if (open) return;

    // keep hit testing aligned with the visible sheet state
    setOpen(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    // drive the sheet and its child layers from one progress value
    progress.value = withSpring(1, SHEET_SPRING);
  }, [open, progress]);

  const closeSheet = useCallback(() => {
    setOpen(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    progress.value = withSpring(0, SHEET_SPRING);
  }, [progress]);

  const sheetStyle = useAnimatedStyle(() => {
    const bottom = interpolate(
      progress.value,
      [0, 1],
      [height * SHEET_LAYOUT.closedBottom, 0],
      Extrapolation.CLAMP,
    );
    const left = interpolate(
      progress.value,
      [0, 1],
      [SHEET_LAYOUT.sheetGutter, 0],
      Extrapolation.CLAMP,
    );
    const right = interpolate(
      progress.value,
      [0, 1],
      [SHEET_LAYOUT.sheetGutter, 0],
      Extrapolation.CLAMP,
    );
    const top = interpolate(
      progress.value,
      [0, 1],
      [height * SHEET_LAYOUT.closedTop, 0],
      Extrapolation.CLAMP,
    );

    return {
      bottom: Math.round(bottom * DEVICE_PIXEL_RATIO) / DEVICE_PIXEL_RATIO,
      borderRadius: SHEET_LAYOUT.sheetRadius,
      left: Math.round(left * DEVICE_PIXEL_RATIO) / DEVICE_PIXEL_RATIO,
      right: Math.round(right * DEVICE_PIXEL_RATIO) / DEVICE_PIXEL_RATIO,
      top: Math.round(top * DEVICE_PIXEL_RATIO) / DEVICE_PIXEL_RATIO,
    };
  });

  return { closeSheet, open, openSheet, progress, sheetStyle };
}
