import { Text } from 'react-native';

import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import type { BoardMotion } from './use-board-motion';

const FADE_INPUT = [0, 0.45, 0.78, 1];

// the Play pill centred on the closed board, shrinking away as the sheet opens
export function PlayButton({
  left,
  motion,
  onPress,
  open,
  progress,
  size,
  top,
}: {
  left: number;
  motion: BoardMotion;
  onPress: () => void;
  open: boolean;
  progress: SharedValue<number>;
  size: number;
  top: number;
}) {
  const { colors } = useSheetColors();
  const { translate } = motion;

  // follows the board's centre but skips its scale, so the pill keeps its size
  const followStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value.x }, { translateY: translate.value.y }],
  }));
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, FADE_INPUT, [1, 1, 0.35, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(progress.value, FADE_INPUT, [1, 0.9, 0.35, 0], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <AnimatedView
      className="absolute z-3 items-center justify-center"
      pointerEvents={open ? 'none' : 'box-none'}
      style={[{ height: size, left, top, width: size }, followStyle]}>
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
          }}>
          <SfSymbol
            fallback="play"
            name="play.fill"
            size={22}
            tintColor={colors.playButtonForeground}
            weight="medium"
          />
          <Text style={{ color: colors.playButtonForeground, fontSize: 24, fontWeight: '700' }}>
            Play
          </Text>
        </PressableScale>
      </AnimatedView>
    </AnimatedView>
  );
}
