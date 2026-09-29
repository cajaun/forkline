import { Pressable, Text, View } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SHEET_LAYOUT } from '@/constants/sheet';
import { AnimatedText, AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

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
  const { top: safeTop } = useSafeAreaInsets();
  const { colors } = useSheetColors();

  // move the preview header pieces into their open-sheet positions
  const morphOriginStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [47, safeTop + 25]),
  }));
  const weekdayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [0, -25]),
      },
      {
        scaleX: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
      },
    ],
    fontSize: interpolate(progress.value, [0, 1], [46, 3]),
    marginTop: interpolate(progress.value, [0, 1], [0, -24]),
  }));
  const dateStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [95, safeTop + 15]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 0.43]) },
    ],
  }));
  const handleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [0, -25]),
      },
      {
        scaleX: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  // keep the close target inactive until the sheet is open

  return (
    <Pressable
      accessibilityLabel="Open chessboard sheet"
      className="absolute inset-0 z-1 overflow-visible rounded-[34px]"
      onPress={open ? undefined : onOpen}
      pointerEvents={open ? 'box-none' : 'auto'}>
      <View
        className="absolute -bottom-4.5 left-6.25 right-6.25 top-4.5 rounded-[34px] opacity-65"
        style={{ backgroundColor: colors.background }}
      />
      <View
        className="absolute -bottom-2.5 left-3 right-3 top-2.5 rounded-[34px] opacity-90"
        style={{ backgroundColor: colors.background }}
      />
      <View className="absolute inset-0 items-center" pointerEvents="none">
        <AnimatedView
          className="absolute left-0 right-0 items-center"
          style={morphOriginStyle}>
          <AnimatedText
            style={[{ color: colors.weekdayText, fontWeight: '900', lineHeight: 56 }, weekdayStyle]}>
            Saturday
          </AnimatedText>
          <AnimatedView
            className="absolute left-0 right-0 items-center"
            pointerEvents="none">
            <AnimatedView
              className="h-1.5 w-13 rounded-[3px]"
              style={[{ backgroundColor: colors.handle }, handleStyle]}
            />
          </AnimatedView>
        </AnimatedView>
        <AnimatedView
          className="absolute left-0 right-0 items-center"
          style={dateStyle}>
          <Text
            style={{
              color: colors.dateText,
              fontSize: 48,
              fontWeight: '900',
              letterSpacing: -1.3,
              lineHeight: 56,
            }}>
            September 26
          </Text>
        </AnimatedView>
      </View>
      <Pressable
        accessibilityLabel="Close chessboard"
        className="absolute left-0 right-0 z-5 h-9.5 items-center justify-center"
        onPress={onClose}
        pointerEvents={open ? 'auto' : 'none'}
        style={{ top: 31 }}
      />
    </Pressable>
  );
}

export function PreviewTimer({
  height,
  progress,
}: {
  height: number;
  progress: SharedValue<number>;
}) {
  const { top: safeTop } = useSafeAreaInsets();
  const { colors } = useSheetColors();
  const style = useAnimatedStyle(() => ({
    left: 0,
    right: 0,
    top: interpolate(
      progress.value,
      [0, 1],
      [height * SHEET_LAYOUT.closedTop + 151, safeTop + 50],
    ),
  }));

  return (
    <AnimatedView
      className="absolute z-2 items-center"
      pointerEvents="none"
      style={style}>
      <View className="flex-row items-center gap-2">
        <View
          className="h-4 w-4 rounded-full border-2"
          style={{ borderColor: colors.dateText }}
        />
        <Text
          style={{ color: colors.dateText, fontSize: 22, fontWeight: '700' }}>
          0:06
        </Text>
      </View>
    </AnimatedView>
  );
}
