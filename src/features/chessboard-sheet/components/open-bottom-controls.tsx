import { useWindowDimensions, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_COLORS } from '../config';
import { AnimatedView } from '../../../shared/uniwind';

const circleClassName =
  'h-14 w-14 items-center justify-center rounded-full bg-[#f2f2f2]';

export function OpenBottomControls({ progress }: { progress: SharedValue<number> }) {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const leftTravel = width / 2 - 56;
  const rightTravel = width / 2 - (width - 56);
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.56, 0.8, 1],
      [0, 0, 0.78, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [70, 0]) }],
  }));
  const leftActionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [leftTravel, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.72, 1]) },
    ],
  }));
  const rightActionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [rightTravel, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.72, 1]) },
    ],
  }));

  return (
    <AnimatedView
      className="absolute left-7 right-7 z-[4] flex-row items-center justify-between"
      pointerEvents="none"
      style={[{ bottom: bottom + 8 }, controlsStyle]}>
      <AnimatedView style={leftActionStyle}>
        <View className={circleClassName}>
          <Ionicons name="arrow-undo-outline" size={27} color={SHEET_COLORS.icon} />
        </View>
      </AnimatedView>
      <AnimatedView style={rightActionStyle}>
        <View className={circleClassName}>
          <Ionicons name="flash" size={28} color={SHEET_COLORS.icon} />
        </View>
      </AnimatedView>
    </AnimatedView>
  );
}
