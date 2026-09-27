import { useWindowDimensions } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_COLORS } from '@/constants/sheet';
import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { AnimatedView } from '@/components/shared/uniwind';

const circleClassName =
  'h-14 w-14 items-center justify-center rounded-full bg-[#F2F2F2]';

export function OpenBottomControls({
  open,
  progress,
}: {
  open: boolean;
  progress: SharedValue<number>;
}) {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // move footer controls from the center into their final positions
  const centerTravel = Math.max(0, width / 2 - 56);
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.55, 0.82, 1],
      [0, 0.75, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [6, 0]) }],
  }));
  const leftActionStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [centerTravel, 0]),
      },
      { scale: interpolate(progress.value, [0, 1], [0.92, 1]) },
    ],
  }));
  const rightActionStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-centerTravel, 0]),
      },
      { scale: interpolate(progress.value, [0, 1], [0.92, 1]) },
    ],
  }));

  return (
    <AnimatedView
      className="absolute left-7 right-7 z-4 h-14"
      pointerEvents={open ? 'auto' : 'none'}
      style={[{ bottom: bottom + 8 }, controlsStyle]}>
      <AnimatedView className="absolute left-0 top-0" style={leftActionStyle}>
        <PressableScale className={circleClassName}>
          <SfSymbol
            fallback="arrow-undo-outline"
            name="arrow.trianglehead.counterclockwise"
            size={27}
            tintColor={SHEET_COLORS.icon}
          />
        </PressableScale>
      </AnimatedView>
      <AnimatedView className="absolute right-0 top-0" style={rightActionStyle}>
        <PressableScale className={circleClassName}>
          <SfSymbol
            fallback="flash"
            name="bolt.fill"
            size={28}
            tintColor={SHEET_COLORS.icon}
          />
        </PressableScale>
      </AnimatedView>
    </AnimatedView>
  );
}
