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
import { SettingsTray } from '@/components/trays/settings';
import type { GameSummary } from '@/types/games';

import { DateStrip } from './date-strip';
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

export const HomeChrome = memo(function HomeChrome({
  days,
  gamesByDay,
  onSelectDay,
  progress,
  selectedDayKey,
}: {
  days: string[];
  gamesByDay: Record<string, GameSummary[]>;
  onSelectDay: (dayKey: string) => void;
  progress: SharedValue<number>;
  selectedDayKey: string | null;
}) {
  const { colors } = useSheetColors();
  // move closed-sheet chrome away as the sheet takes over the screen
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
        <AppBubble
          color={colors.controlBackground}
          fallback="bar-chart-outline"
          icon="chart.bar.fill"
          iconColor={colors.controlIcon}
        />
        <SettingsTray size={48} />
      </AnimatedView>

      <AnimatedView
        className="absolute bottom-8.5 left-0 right-0 h-30.75"
        style={bottomChromeStyle}>
        <DateStrip
          days={days}
          gamesByDay={gamesByDay}
          onSelectDay={onSelectDay}
          selectedDayKey={selectedDayKey}
        />
      </AnimatedView>
    </View>
  );
});
