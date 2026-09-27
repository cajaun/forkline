import { Text, View } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '../../../shared/uniwind';

export function BoardMeta({
  boardSize,
  closedLeft,
  closedTop,
  openLeft,
  openTop,
  progress,
}: {
  boardSize: number;
  closedLeft: number;
  closedTop: number;
  openLeft: number;
  openTop: number;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    left: interpolate(progress.value, [0, 1], [closedLeft, openLeft]),
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    top: interpolate(
      progress.value,
      [0, 1],
      [closedTop + boardSize * 0.42, openTop - 40],
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [0.72, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <AnimatedView
      className="absolute z-[1] h-8 items-center justify-center"
      pointerEvents="none"
      style={[{ width: boardSize }, style]}>
      <View className="h-6 min-w-[58px] items-center justify-center rounded-[10px] bg-[#f2f2f2] px-3">
        <Text
          className="text-[#262626]"
          style={{ fontSize: 16, fontWeight: '700', lineHeight: 20 }}>
          Easy
        </Text>
      </View>
    </AnimatedView>
  );
}
