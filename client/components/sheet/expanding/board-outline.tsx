import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import type { BoardMotion } from './use-board-motion';

const BORDER_WIDTH = 2;

// a 2pt outline that sits outside the preview when closed and over the board's edge when open
export function BoardOutline({
  left,
  motion,
  progress,
  size,
  top,
}: {
  left: number;
  motion: BoardMotion;
  progress: SharedValue<number>;
  size: number;
  top: number;
}) {
  const { colors } = useSheetColors();
  const { radius, scale, translate } = motion;

  // width and offset are divided by the board's scale, so the stroke stays 2pt on screen
  const outlineStyle = useAnimatedStyle(() => ({
    borderRadius: radius.value,
    outlineOffset:
      interpolate(progress.value, [0, 1], [0, -BORDER_WIDTH], Extrapolation.CLAMP) / scale.value,
    outlineWidth: BORDER_WIDTH / scale.value,
    transform: [
      { translateX: translate.value.x },
      { translateY: translate.value.y },
      { scale: scale.value },
    ],
  }));

  return (
    <AnimatedView
      className="absolute z-3"
      pointerEvents="none"
      style={[
        {
          borderCurve: 'continuous',
          height: size,
          left,
          outlineColor: colors.boardBorder,
          outlineStyle: 'solid',
          top,
          width: size,
        },
        outlineStyle,
      ]}
    />
  );
}
