import { Text, View } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { SettingsTray } from '@/components/trays/settings';
import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

function AppBubble({
  color,
  fallback,
  icon,
  iconColor,
}: {
  color: string;
  fallback: Parameters<typeof SfSymbol>[0]['fallback'];
  icon: Parameters<typeof SfSymbol>[0]['name'];
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

function DateBubble({
  day,
  date,
  muted,
  selected,
  textColor,
  mutedColor,
  selectedColor,
  selectedTextColor,
}: {
  day: string;
  date: string;
  muted?: boolean;
  selected?: boolean;
  textColor: string;
  mutedColor: string;
  selectedColor: string;
  selectedTextColor: string;
}) {
  return (
    <View
      className="h-full w-full items-center justify-center gap-1.25 rounded-[23px] py-3.75"
      style={selected ? { backgroundColor: selectedColor } : undefined}>
      <Text
        style={{
          color: muted ? mutedColor : selected ? selectedTextColor : textColor,
          fontSize: 14,
          fontWeight: '800',
        }}>
        {day}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          color: muted ? mutedColor : selected ? selectedTextColor : textColor,
          fontSize: 28,
          fontWeight: '900',
        }}>
        {date}
      </Text>
      <View
        className={`mt-0.75 h-4.25 w-4.25 rounded-[9px] border-2 border-dotted ${muted ? 'opacity-65' : ''}`}
        style={{ borderColor: selected ? selectedTextColor : mutedColor }}
      />
    </View>
  );
}

export function HomeChrome({ progress }: { progress: SharedValue<number> }) {
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
        <View className="absolute bottom-0 left-[5.1%] h-full" style={{ width: '12%' }}>
          <DateBubble
            day="Thu"
            date="24"
            muted
            mutedColor={colors.weekdayText}
            selectedColor={colors.selectedDateBackground}
            selectedTextColor={colors.selectedDateText}
            textColor={colors.text}
          />
        </View>
        <View className="absolute bottom-0 left-[25.2%] h-full" style={{ width: '12%' }}>
          <DateBubble
            day="Fri"
            date="25"
            muted
            mutedColor={colors.weekdayText}
            selectedColor={colors.controlBackground}
            selectedTextColor={colors.selectedDateText}
            textColor={colors.text}
          />
        </View>
        <View className="absolute bottom-0 left-[40.7%] h-full w-[18.5%]">
          <DateBubble
            day="Sat"
            date="26"
            mutedColor={colors.weekdayText}
            selected
            selectedColor={colors.selectedDateBackground}
            selectedTextColor={colors.selectedDateText}
            textColor={colors.text}
          />
        </View>
        <View className="absolute bottom-0 left-[69.4%] h-full w-[18.5%]">
          <View className="h-full w-full items-center justify-center gap-1.75 rounded-[23px] py-3.75">
            <Text style={{ color: colors.weekdayText, fontSize: 14, fontWeight: '800' }}>
              Next in
            </Text>
            <Text
              style={{ color: colors.weekdayText, fontSize: 25, fontWeight: '900' }}>
              11 hrs
            </Text>
            <SfSymbol
              fallback="time-outline"
              name="clock"
              size={20}
              tintColor={colors.controlIcon}
            />
          </View>
        </View>
      </AnimatedView>
    </View>
  );
}
