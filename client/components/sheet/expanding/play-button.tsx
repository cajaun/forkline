import { Text } from 'react-native';

import { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { fold } from './fold';
import type { BoardMotion } from './use-board-motion';

export function PlayButton({
  left,
  motion,
  hidden = false,
  onPress,
  reveal,
  open,
  progress,
  size,
  top,
}: {
  left: number;
  hidden?: boolean;
  motion: BoardMotion;
  onPress: () => void;
  reveal: SharedValue<number>;
  open: boolean;
  progress: SharedValue<number>;
  size: number;
  top: number;
}) {
  const { colors } = useSheetColors();
  const { translate } = motion;

  const followStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value.x }, { translateY: translate.value.y }],
  }));
  // a won game folds the button away the same way opening the sheet does
  const fadeStyle = useAnimatedStyle(() => {
    const { opacity, scale } = fold(Math.max(progress.value, reveal.value));
    return { opacity, transform: [{ scale }] };
  });

  return (
    <AnimatedView
      className="absolute z-3 items-center justify-center"
      pointerEvents={open || hidden ? 'none' : 'box-none'}
      style={[{ height: size, left, top, width: size }, followStyle]}
    >
      <AnimatedView style={fadeStyle}>
        <PressableScale
          accessibilityLabel="Open chessboard"
          onPress={onPress}
          style={{
            alignItems: 'center',
            backgroundColor: colors.playButton,
            borderRadius: 28,
            flexDirection: 'row',
            gap: 4,
            height: 56,
            justifyContent: 'center',
            width: 110,
          }}
        >
          <SfSymbol
            fallback="play"
            name="play.fill"
            size={22}
            tintColor={colors.playButtonForeground}
            weight="medium"
          />
          <Text style={{ color: colors.playButtonForeground, fontSize: 24, fontWeight: '700' }}>Play</Text>
        </PressableScale>
      </AnimatedView>
    </AnimatedView>
  );
}
