import { Image, Text, View } from 'react-native';

import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from 'pressto';
import { Easing, withDelay, withTiming } from 'react-native-reanimated';

import { PLAYERS } from '../constants';
import { avatar, quality, theme } from '../theme';
import { AnimatedView } from '../../../shared/uniwind';

import type { Quality, ShowOpts } from '../types';
import type { StyleProp, ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';

const qualityMeta: Record<Quality, { glyph: string; color: string; label: string }> = {
  brilliant: { glyph: '!!', color: quality.brilliant, label: 'Brilliant' },
  great: { glyph: '!', color: quality.great, label: 'Great' },
  book: { glyph: '⌑', color: quality.book, label: 'Book' },
  best: { glyph: '★', color: quality.best, label: 'Best' },
  excellent: { glyph: '✓', color: quality.excellent, label: 'Excellent' },
  good: { glyph: '✓', color: quality.good, label: 'Good' },
  inaccuracy: { glyph: '?!', color: quality.inaccuracy, label: 'Inaccuracy' },
  mistake: { glyph: '?', color: quality.mistake, label: 'Mistake' },
  miss: { glyph: '✕', color: quality.miss, label: 'Miss' },
  blunder: { glyph: '??', color: quality.blunder, label: 'Blunder' },
};

const qualityOrder: Quality[] = [
  'brilliant',
  'great',
  'book',
  'best',
  'excellent',
  'good',
  'inaccuracy',
  'mistake',
  'miss',
  'blunder',
];

const enter = (delay: number) => () => {
  'worklet';
  const easing = Easing.bezier(0.16, 0.84, 0.44, 1);
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: 9 }, { scale: 0.985 }] as [
        { translateY: number },
        { scale: number },
      ],
    },
    animations: {
      opacity: withDelay(delay, withTiming(1, { duration: 400, easing })),
      transform: [
        { translateY: withDelay(delay, withTiming(0, { duration: 400, easing })) },
        { scale: withDelay(delay, withTiming(1, { duration: 400, easing })) },
      ] as unknown as [{ translateY: number }, { scale: number }],
    },
  };
};

export const GameReviewCard: React.FC<{
  card: ShowOpts;
  style: StyleProp<AnimatedStyle<ViewStyle>>;
  onHide: () => void;
}> = ({ card, style, onHide }) => {
  const rows = qualityOrder
    .map(q => ({
      q,
      you: card.moves.filter((m, i) => i % 2 === 0 && m.quality === q).length,
      opp: card.moves.filter((m, i) => i % 2 === 1 && m.quality === q).length,
    }))
    .filter(row => row.you + row.opp > 0);

  return (
    <AnimatedView className="absolute bottom-10 left-[22px] right-[22px]" style={style}>
      <AnimatedView entering={enter(0)}>
        <Text
          className="text-[11px] tracking-[2px] text-[#8f9298]"
         >
          GAME REVIEW
        </Text>
        <Text
          className="mb-4 mt-[5px] text-[26px] tracking-[-0.9px] text-[#f0f2f5]"
         >
          {card.subtitle}
        </Text>
      </AnimatedView>

      <AnimatedView className="h-11 flex-row items-center" entering={enter(55)}>
        <View className="flex-1" />
        <Text
          className="w-[62px] text-center text-xs text-[#8f9298]"
         >
          {PLAYERS.w.name}
        </Text>
        <View className="w-11" />
        <Text
          className="w-[62px] text-center text-xs text-[#8f9298]"
          numberOfLines={1}
         >
          {card.oppName}
        </Text>
      </AnimatedView>

      <AnimatedView className="h-11 flex-row items-center" entering={enter(95)}>
        <Text
          className="flex-1 text-sm text-[#8f9298]"
         >
          Players
        </Text>
        <View className="w-[62px] items-center">
          <Image className="h-[38px] w-[38px] rounded-[11px]" source={avatar.w} />
        </View>
        <View className="w-11" />
        <View className="w-[62px] items-center">
          <Image className="h-[38px] w-[38px] rounded-[11px]" source={avatar.b} />
        </View>
      </AnimatedView>

      <AnimatedView className="mb-[2px] h-11 flex-row items-center" entering={enter(135)}>
        <Text
          className="flex-1 text-sm text-[#8f9298]"
         >
          Accuracy
        </Text>
        <View className="w-[62px] items-center">
          <View className="w-14 items-center rounded-[9px] bg-[rgba(240,242,245,0.1)] py-2">
            <Text
              className="text-[15px] text-[#f0f2f5]"
             >
              {card.accuracy.you.toFixed(1)}
            </Text>
          </View>
        </View>
        <View className="w-11" />
        <View className="w-[62px] items-center">
          <View className="w-14 items-center rounded-[9px] bg-[#3a91f8] py-2">
            <Text
              className="text-[15px] text-[#0d0e12]"
             >
              {card.accuracy.opp.toFixed(1)}
            </Text>
          </View>
        </View>
      </AnimatedView>

      <AnimatedView entering={enter(170)}>
        <View className="mb-1 mt-2 h-px bg-[#2c2f35]" />
      </AnimatedView>

      {rows.map((row, index) => {
        const meta = qualityMeta[row.q];
        return (
          <AnimatedView
            className="h-[50px] flex-row items-center"
            entering={enter(210 + index * 50)}
            key={row.q}>
            <Text
              className="flex-1 text-base"
              style={{ color: meta.color }}>
              {meta.label}
            </Text>
            <Text
              className="w-[62px] text-center text-[17px]"
              style={{
                color: row.you === 0 ? theme.textFaint : meta.color,
              }}>
              {row.you}
            </Text>
            <View className="w-11 items-center justify-center">
              <View
                className="h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: meta.color }}>
                <Text className="text-sm font-black" style={{ color: theme.bg }}>
                  {meta.glyph}
                </Text>
              </View>
            </View>
            <Text
              className="w-[62px] text-center text-[17px]"
              style={{
                color: row.opp === 0 ? theme.textFaint : meta.color,
              }}>
              {row.opp}
            </Text>
          </AnimatedView>
        );
      })}

      <AnimatedView className="mt-6 flex-row gap-2.5" entering={enter(470)}>
        <PressableScale
          onPress={() => {
            onHide();
            card.onBack();
          }}
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(240,242,245,0.08)',
            borderColor: 'rgba(240,242,245,0.16)',
            borderRadius: 18,
            borderWidth: 0.5,
            flex: 1,
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'center',
            paddingVertical: 14,
          }}>
          <Ionicons name="arrow-back" size={18} color={theme.text} />
          <Text
            className="text-base text-[#f0f2f5]"
           >
            Back
          </Text>
        </PressableScale>
        <PressableScale
          onPress={() => {
            onHide();
            card.onReplay();
          }}
          style={{
            alignItems: 'center',
            backgroundColor: theme.text,
            borderRadius: 18,
            flex: 1,
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'center',
            paddingVertical: 14,
          }}>
          <Ionicons name="reload" size={20} color={theme.bg} />
          <Text
            className="text-base text-[#0d0e12]"
           >
            Replay
          </Text>
        </PressableScale>
      </AnimatedView>
    </AnimatedView>
  );
};
