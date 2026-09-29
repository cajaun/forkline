import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { useSheetColors } from '@/hooks/use-sheet-colors';
import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { SettingsTray } from '@/components/trays/settings';
import { AnimatedView } from '@/components/shared/uniwind';

const circleClassName =
  'h-14 w-14 items-center justify-center rounded-full';

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
  const { colors } = useSheetColors();

  // reveal header controls after the board expansion clears their path
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.55, 0.82, 1],
      [0, 0.75, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [6, 0]) }],
  }));

  return (
    <AnimatedView
      className="absolute left-7 right-7 z-4 flex-row justify-between"
      pointerEvents={open ? 'auto' : 'none'}
      style={[{ top: top + 18 }, controlsStyle]}>
      <PressableScale
        accessibilityLabel="Close chessboard"
        className={circleClassName}
        onPress={onClose}
        style={{ backgroundColor: colors.controlBackground }}>
        <SfSymbol
          fallback="chevron-down"
          name="chevron.down"
          size={25}
          tintColor={colors.icon}
          weight="medium"
        />
      </PressableScale>
      <SettingsTray />
    </AnimatedView>
  );
}
