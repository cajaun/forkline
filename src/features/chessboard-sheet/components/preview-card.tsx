import { Pressable, Text, View } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '../../../shared/uniwind';

export function PreviewCard({
  onClose,
  onOpen,
  open,
  progress,
}: {
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
  progress: SharedValue<number>;
}) {
  const titleStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [64, 25]),
  }));
  const weekdayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.52, 0.78, 1],
      [1, 0.55, 0.08, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(progress.value, [0, 0.52, 0.78, 1], [1, 0.5, 0.12, 0]),
      },
    ],
  }));
  const dateStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [104, 62]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.43]) }],
  }));
  const timeStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [155, 97]),
  }));
  const handleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.52, 0.78, 1],
      [0, 0, 0.82, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scaleX: interpolate(progress.value, [0, 0.52, 0.78, 1], [0, 0, 0.42, 1]),
      },
    ],
  }));

  return (
    <Pressable
      accessibilityLabel="Open chessboard sheet"
      className="absolute inset-0 z-[1] overflow-visible rounded-[34px] bg-white"
      onPress={onOpen}>
      <View className="absolute bottom-[-18px] left-[25px] right-[25px] top-[18px] rounded-[34px] bg-white opacity-65" />
      <View className="absolute bottom-[-10px] left-3 right-3 top-[10px] rounded-[34px] bg-white opacity-90" />
      <View className="absolute inset-0 items-center" pointerEvents="none">
        <AnimatedView
          className="absolute left-0 right-0 items-center"
          style={[{ height: 58 }, titleStyle]}>
          <View className="absolute inset-0 items-center justify-center">
            <AnimatedView style={weekdayStyle}>
              <Text
                className="text-[40px] text-[#d1d1d1]"
                style={{ fontFamily: 'SF-Pro-Rounded-Heavy' }}>
                Saturday
              </Text>
            </AnimatedView>
          </View>
          <AnimatedView
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none">
            <AnimatedView
              className="h-[6px] w-[52px] rounded-[3px] bg-[#b3b4b7]"
              style={handleStyle}
            />
          </AnimatedView>
        </AnimatedView>
        <AnimatedView
          className="absolute left-0 right-0 items-center"
          style={dateStyle}>
          <Text
            className="text-[42px] leading-[50px] text-[#262626]"
            style={{ fontFamily: 'SF-Pro-Rounded-Heavy', letterSpacing: -1.3 }}>
            September 26
          </Text>
        </AnimatedView>
        <AnimatedView
          className="absolute left-0 right-0 items-center"
          style={timeStyle}>
          <View className="flex-row items-center gap-2">
            <View className="h-4 w-4 rounded-full border-2 border-[#262626]" />
            <Text
              className="text-[22px] text-[#262626]"
              style={{ fontFamily: 'SF-Pro-Rounded-Bold' }}>
              0:06
            </Text>
          </View>
        </AnimatedView>
      </View>
      <Pressable
        accessibilityLabel="Close chessboard"
        className="absolute left-0 right-0 z-[5] h-[38px] items-center justify-center"
        onPress={onClose}
        pointerEvents={open ? 'auto' : 'none'}
        style={{ top: 31 }}
      />
    </Pressable>
  );
}
