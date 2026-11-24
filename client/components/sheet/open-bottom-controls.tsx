import { memo } from 'react';
import { useWindowDimensions } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/components/shared/uniwind';

import { GameActionsTray } from './game-actions-tray';
import { HintButton } from './hint-button';

export const OpenBottomControls = memo(function OpenBottomControls({
  hintEnabled,
  hintThinking,
  onHint,
  open,
  progress,
}: {
  hintEnabled: boolean;
  hintThinking: boolean;
  onHint: () => void;
  open: boolean;
  progress: SharedValue<number>;
}) {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // the two buttons start at the centre and slide out to the corners
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
        <GameActionsTray />
      </AnimatedView>
      <AnimatedView className="absolute right-0 top-0" style={rightActionStyle}>
        <HintButton enabled={hintEnabled} onPress={onHint} thinking={hintThinking} />
      </AnimatedView>
    </AnimatedView>
  );
});
