import { View } from 'react-native';

import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { GameSummary } from '@/types/games';

// one dot per game on the shown day, fading out as the sheet opens
export function GameDots({
  activeIndex,
  games,
  progress,
  top,
}: {
  activeIndex: number;
  games: GameSummary[];
  progress: SharedValue<number>;
  top: number;
}) {
  const { colors } = useSheetColors();
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.25], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <AnimatedView
      className="absolute left-0 right-0 flex-row justify-center gap-1.5"
      pointerEvents="none"
      style={[{ top }, fadeStyle]}>
      {games.map((game, index) => (
        <View
          key={game.id}
          style={{
            backgroundColor: index === activeIndex ? colors.text : colors.weekdayText,
            borderRadius: 3,
            height: 6,
            opacity: index === activeIndex ? 1 : 0.4,
            width: 6,
          }}
        />
      ))}
    </AnimatedView>
  );
}
