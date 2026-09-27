import { Text, View } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_COLORS } from '../config';
import { SfSymbol } from '../../../shared/sf-symbol';
import { AnimatedView } from '../../../shared/uniwind';

function AppBubble({
  color,
  fallback,
  icon,
}: {
  color: string;
  fallback: Parameters<typeof SfSymbol>[0]['fallback'];
  icon: Parameters<typeof SfSymbol>[0]['name'];
}) {
  return (
    <View
      className="h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}>
      <SfSymbol
        fallback={fallback}
        name={icon}
        size={27}
        tintColor={color === SHEET_COLORS.primary ? '#FEFFFF' : SHEET_COLORS.icon}
      />
    </View>
  );
}

function DateBubble({
  day,
  date,
  muted,
  selected,
}: {
  day: string;
  date: string;
  muted?: boolean;
  selected?: boolean;
}) {
  return (
    <View
      className={`h-full w-full items-center justify-center gap-1.25 rounded-[23px] py-3.75 ${selected ? 'bg-[#dcdcdc]' : ''}`}>
      <Text
        className={`text-[14px] text-[#606166] ${muted ? 'text-[#aeb0b3]' : ''}`}
        style={{ fontSize: 14, fontWeight: '800' }}>
        {day}
      </Text>
      <Text
        numberOfLines={1}
        className={`text-[28px] text-[#53555a] ${muted ? 'text-[#aeb0b3]' : ''}`}
        style={{ fontSize: 28, fontWeight: '900' }}>
        {date}
      </Text>
      <View
        className={`mt-0.75 h-4.25 w-4.25 rounded-[9px] border-2 border-dotted ${selected ? 'border-[#262626]' : 'border-[#b9bbbf]'} ${muted ? 'opacity-65' : ''}`}
      />
    </View>
  );
}

export function HomeChrome({ progress }: { progress: SharedValue<number> }) {
  const topChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -134]) }],
  }));
  const bottomChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, 165]) }],
  }));

  return (
    <View className="flex-1 bg-[#e6e6e6] pt-17">
      <AnimatedView
        className="flex-row items-center gap-3 px-7"
        style={topChromeStyle}>
        <AppBubble
          color={SHEET_COLORS.primary}
          fallback="trophy"
          icon="trophy.fill"
        />
        <AppBubble
          color={SHEET_COLORS.lightControl}
          fallback="leaf-outline"
          icon="laurel.leading.laurel.trailing"
        />
        <View className="flex-1" />
        <AppBubble
          color={SHEET_COLORS.lightControl}
          fallback="people"
          icon="person.2.fill"
        />
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#b2c8dd]">
          <Text
            className="text-[#FEFFFF]"
            style={{ fontSize: 27, fontWeight: '800' }}>
            C
          </Text>
        </View>
      </AnimatedView>

      <AnimatedView
        className="absolute bottom-8.5 left-0 right-0 h-30.75"
        style={bottomChromeStyle}>
        <View className="absolute bottom-0 left-[5.1%] h-full" style={{ width: '12%' }}>
          <DateBubble day="Thu" date="24" muted />
        </View>
        <View className="absolute bottom-0 left-[25.2%] h-full" style={{ width: '12%' }}>
          <DateBubble day="Fri" date="25" muted />
        </View>
        <View className="absolute bottom-0 left-[40.7%] h-full w-[18.5%]">
          <DateBubble day="Sat" date="26" selected />
        </View>
        <View className="absolute bottom-0 left-[69.4%] h-full w-[18.5%]">
          <View className="h-full w-full items-center justify-center gap-1.75 rounded-[23px] py-3.75">
            <Text
              className="text-[#aeb0b3]"
              style={{ fontSize: 14, fontWeight: '800' }}>
              Next in
            </Text>
            <Text
              className="text-[#aeb0b3]"
              style={{ fontSize: 25, fontWeight: '900' }}>
              11 hrs
            </Text>
            <SfSymbol
              fallback="time-outline"
              name="clock"
              size={20}
              tintColor="#a8aaad"
            />
          </View>
        </View>
      </AnimatedView>
    </View>
  );
}
