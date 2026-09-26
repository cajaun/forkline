import type { ComponentProps } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SHEET_COLORS } from '../config';
import { AnimatedView } from '../../../shared/uniwind';

type IconName = ComponentProps<typeof Ionicons>['name'];

function AppBubble({ color, icon }: { color: string; icon: IconName }) {
  return (
    <View
      className="h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}>
      <Ionicons
        name={icon}
        size={27}
        color={color === SHEET_COLORS.primary ? '#ffffff' : SHEET_COLORS.icon}
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
      className={`h-full w-full items-center justify-center gap-[5px] rounded-[23px] py-[15px] ${selected ? 'bg-[#dcdcdc]' : ''}`}>
      <Text
        className={`text-[14px] text-[#606166] ${muted ? 'text-[#aeb0b3]' : ''}`}
        style={{ fontFamily: 'SF-Pro-Rounded-Bold' }}>
        {day}
      </Text>
      <Text
        className={`text-[28px] text-[#53555a] ${muted ? 'text-[#aeb0b3]' : ''}`}
        style={{ fontFamily: 'SF-Pro-Rounded-Heavy' }}>
        {date}
      </Text>
      <View
        className={`mt-[3px] h-[17px] w-[17px] rounded-[9px] border-2 border-dotted ${selected ? 'border-[#202124]' : 'border-[#b9bbbf]'} ${muted ? 'opacity-65' : ''}`}
      />
    </View>
  );
}

export function HomeChrome({ progress }: { progress: SharedValue<number> }) {
  const topChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.58, 1],
      [1, 0.55, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -134]) }],
  }));
  const bottomChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.58, 1],
      [1, 0.55, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, 165]) }],
  }));

  return (
    <View className="flex-1 bg-[#e6e6e6] pt-[68px]">
      <AnimatedView
        className="flex-row items-center gap-3 px-7"
        style={topChromeStyle}>
        <AppBubble color={SHEET_COLORS.primary} icon="trophy" />
        <AppBubble color={SHEET_COLORS.lightControl} icon="leaf-outline" />
        <View className="flex-1" />
        <AppBubble color={SHEET_COLORS.lightControl} icon="people" />
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#b2c8dd]">
          <Text
            className="text-[27px] text-white"
            style={{ fontFamily: 'SF-Pro-Rounded-Heavy' }}>
            C
          </Text>
        </View>
      </AnimatedView>

      <AnimatedView
        className="absolute bottom-[34px] left-0 right-0 h-[123px]"
        style={bottomChromeStyle}>
        <View className="absolute bottom-0 left-[5.1%] h-full w-[8%]">
          <DateBubble day="Thu" date="24" muted />
        </View>
        <View className="absolute bottom-0 left-[25.2%] h-full w-[8%]">
          <DateBubble day="Fri" date="25" muted />
        </View>
        <View className="absolute bottom-0 left-[40.7%] h-full w-[18.5%]">
          <DateBubble day="Sat" date="26" selected />
        </View>
        <View className="absolute bottom-0 left-[69.4%] h-full w-[18.5%]">
          <View className="h-full w-full items-center justify-center gap-[7px] rounded-[23px] py-[15px]">
            <Text
              className="text-[14px] text-[#aeb0b3]"
              style={{ fontFamily: 'SF-Pro-Rounded-Bold' }}>
              Next in
            </Text>
            <Text
              className="text-[25px] text-[#aeb0b3]"
              style={{ fontFamily: 'SF-Pro-Rounded-Heavy' }}>
              11 hrs
            </Text>
            <Ionicons name="time-outline" size={20} color="#a8aaad" />
          </View>
        </View>
      </AnimatedView>
    </View>
  );
}
