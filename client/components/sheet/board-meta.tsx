import { Text, View } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/components/shared/uniwind';

export function BoardMeta({
  boardSize,
  closedLeft,
  closedTop,
  openLeft,
  openTop,
  previewSize,
  progress,
}: {
  boardSize: number;
  closedLeft: number;
  closedTop: number;
  openLeft: number;
  openTop: number;
  previewSize: number;
  progress: SharedValue<number>;
}) {
  // keep the difficulty tag aligned with the visible board edge
  const closedVisualTop = closedTop + (boardSize - previewSize) / 2;
  const style = useAnimatedStyle(() => ({
    left: interpolate(progress.value, [0, 1], [closedLeft, openLeft]),
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    top: interpolate(
      progress.value,
      [0, 1],
      [closedVisualTop - 12, openTop - 34],
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
      className="absolute z-1 h-8 items-center justify-center"
      pointerEvents="none"
      style={[{ width: boardSize }, style]}>
      <View className="h-6 min-w-14.5 items-center justify-center rounded-[10px] bg-[#F2F2F2] px-3">
        <Text
          className="text-[#262626]"
          style={{ fontSize: 16, fontWeight: '700', lineHeight: 20 }}>
          Easy
        </Text>
      </View>
    </AnimatedView>
  );
}
