import { memo } from 'react';
import { View } from 'react-native';
import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/components/shared/uniwind';
import { AiTray } from '@/components/trays/ai/ai-tray';
import { StatsTray } from '@/components/trays/stats/stats-tray';
import { SettingsTray } from '@/components/trays/settings';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { GameSummary } from '@/types/games';

import { PromotionPreview } from './board/promotion-tray';
import { DeleteGameTray } from './delete-game-tray';
import { GameStrip } from './game-strip';

// the home buttons and the game strip slide away as the sheet opens
export const HomeChrome = memo(function HomeChrome({
  days,
  gamesByDay,
  onSelectGame,
  progress,
  selectedGameId,
}: {
  days: string[];
  gamesByDay: Record<string, GameSummary[]>;
  onSelectGame: (gameId: string) => void;
  progress: SharedValue<number>;
  selectedGameId: string | null;
}) {
  const { colors } = useSheetColors();
  const topChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -134]) }],
  }));
  const bottomChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, 165]) }],
  }));

  return (
    <View className="flex-1 pt-17" style={{ backgroundColor: colors.appBackground }}>
      <AnimatedView className="flex-row items-center gap-3 px-7" style={topChromeStyle}>
        {/* the AI sits apart on the left while your own stats and settings share the right */}
        <AiTray size={48} />
        <View className="flex-1" />
        <StatsTray size={48} />
        <SettingsTray size={48} />
        {__DEV__ ? <PromotionPreview /> : null}
        <DeleteGameTray />
      </AnimatedView>

      <AnimatedView className="absolute bottom-8.5 left-0 right-0 h-30.75" style={bottomChromeStyle}>
        <GameStrip
          days={days}
          gamesByDay={gamesByDay}
          onSelectGame={onSelectGame}
          selectedGameId={selectedGameId}
        />
      </AnimatedView>
    </View>
  );
});
