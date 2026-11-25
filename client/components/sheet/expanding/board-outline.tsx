import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { BOARD_RADIUS, type BoardMotion } from './use-board-motion';

const BORDER_WIDTH = 2;

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
  const { scale, translate } = motion;

  const borderColor = colors.boardBorder;

  // a border follows the continuous corner where an outline draws a plain arc
  // the colour rides with the animated width since a UI thread border update alone falls back to black
  // the view is one line wider each side so the line sits outside the closed card and inside the open board
  const outlineStyle = useAnimatedStyle(() => {
    const outside = interpolate(progress.value, [0, 1], [BORDER_WIDTH, 0], Extrapolation.CLAMP);
    const fit = (size * scale.value + 2 * outside) / (size + 2 * BORDER_WIDTH);
    return {
      borderColor,
      borderRadius: (BOARD_RADIUS + outside) / fit,
      borderWidth: BORDER_WIDTH / fit,
      transform: [{ translateX: translate.value.x }, { translateY: translate.value.y }, { scale: fit }],
    };
  });

  return (
    <AnimatedView
      className="absolute z-3"
      pointerEvents="none"
      style={[
        {
          borderCurve: 'continuous',
          height: size + 2 * BORDER_WIDTH,
          left: left - BORDER_WIDTH,
          top: top - BORDER_WIDTH,
          width: size + 2 * BORDER_WIDTH,
        },
        outlineStyle,
      ]}
    />
  );
}
