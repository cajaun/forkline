import { Pressable } from 'react-native';

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

export function OpenControls({
  onClose,
  open,
  progress,
}: {
  onClose: () => void;
  open: boolean;
  progress: SharedValue<number>;
}) {
  const { top } = useSafeAreaInsets();
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.52, 0.76, 1],
      [0, 0, 0.85, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [18, 0]) }],
  }));

  return (
    <AnimatedView
      className="absolute left-7 right-7 z-[4] flex-row justify-between"
      pointerEvents={open ? 'auto' : 'none'}
      style={[{ top: top + 6 }, controlsStyle]}>
      <Pressable
        accessibilityLabel="Close chessboard"
        className={circleClassName}
        onPress={onClose}>
        <Ionicons name="chevron-down" size={31} color={SHEET_COLORS.icon} />
      </Pressable>
      <Pressable accessibilityLabel="Chessboard settings" className={circleClassName}>
        <Ionicons name="settings-sharp" size={25} color={SHEET_COLORS.icon} />
      </Pressable>
    </AnimatedView>
  );
}
