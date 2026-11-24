import { memo } from 'react';
import { View } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { StatsTray } from '@/components/trays/stats/stats-tray';
import { SettingsTray } from '@/components/trays/settings';
import type { GameSummary } from '@/types/games';

import { PromotionPreview } from './board/promotion-tray';
import { DeleteGameTray } from './delete-game-tray';
import { GameStrip } from './game-strip';
import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

function AppBubble({
  color,
  fallback,
  icon,
  iconColor,
}: {
  color: string;
  fallback: SymbolFallback;
  icon: SymbolName;
  iconColor: string;
}) {
  return (
    <PressableScale
      className="h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}>
      <SfSymbol
        fallback={fallback}
        name={icon}
        size={27}
        tintColor={iconColor}
      />
    </PressableScale>
  );
}

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
      <AnimatedView
        className="flex-row items-center gap-3 px-7"
        style={topChromeStyle}>
        <AppBubble
          color={colors.controlBackground}
          fallback="leaf-outline"
          icon="laurel.leading.laurel.trailing"
          iconColor={colors.controlIcon}
        />
        <View className="flex-1" />
        <StatsTray size={48} />
        <SettingsTray size={48} />
        {__DEV__ ? <PromotionPreview /> : null}
        <DeleteGameTray />
      </AnimatedView>

      <AnimatedView
        className="absolute bottom-8.5 left-0 right-0 h-30.75"
        style={bottomChromeStyle}>
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
