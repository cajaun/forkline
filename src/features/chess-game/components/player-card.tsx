import { Image, Text, View } from 'react-native';

import React from 'react';

import ColorLib from 'color';
import { useAtomValue } from 'jotai';
import {
  Easing,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ReText } from 'react-native-redash';

import { CaptureTray } from '../../../shared/capture-tray';
import { PLAYERS, VALUE } from '../constants';
import {
  capturedAtom,
  clockSv,
  gameOverSv,
  gameResultAtom,
  turnSv,
} from '../state';
import { avatar, theme, withAlpha } from '../theme';
import { toRgba } from '../utils';
import { AnimatedView } from '../../../shared/uniwind';

import type { Side } from '../types';

const surfaceRgb = ColorLib(theme.surface).rgb().array();
const borderRgb = ColorLib(theme.border).rgb().array();

export const PlayerCard: React.FC<{ side: Side }> = ({ side }) => {
  const { name, rating } = PLAYERS[side];
  const foe: Side = side === 'w' ? 'b' : 'w';
  const capturedAll = useAtomValue(capturedAtom);
  const winner = useAtomValue(gameResultAtom);
  const captured = capturedAll[side];
  const matW = capturedAll.w.reduce((sum, piece) => sum + (VALUE[piece] ?? 0), 0);
  const matB = capturedAll.b.reduce((sum, piece) => sum + (VALUE[piece] ?? 0), 0);
  const lead = side === 'w' ? Math.max(0, matW - matB) : Math.max(0, matB - matW);
  const result: 'win' | 'lose' | null = winner
    ? winner === side
      ? 'win'
      : 'lose'
    : null;

  const active = useSharedValue(0);
  const pulse = useSharedValue(0);

  useAnimatedReaction(
    () => !gameOverSv.get() && turnSv.get() === side,
    (toMove, previous) => {
      if (previous !== null && toMove === previous) return;
      active.set(withTiming(toMove ? 1 : 0, { duration: 280 }));
      pulse.set(
        toMove
          ? withRepeat(
              withTiming(1, {
                duration: 950,
                easing: Easing.inOut(Easing.ease),
              }),
              -1,
              true,
            )
          : withTiming(0, { duration: 200 }),
      );
    },
  );

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: toRgba(surfaceRgb, active.get()),
    borderColor: toRgba(borderRgb, active.get()),
  }));
  const clockTintStyle = useAnimatedStyle(() => ({ opacity: active.get() }));
  const clockTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(active.get(), [0, 1], [theme.textMuted, theme.text]),
  }));
  const clockText = useDerivedValue(() => {
    const seconds = clockSv[side].get();
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder < 10 ? '0' : ''}${remainder}`;
  });
  const dotStyle = useAnimatedStyle(() => ({
    marginRight: active.get() * 6,
    opacity: active.get() * (0.45 + pulse.get() * 0.55),
    transform: [{ scale: 0.8 + pulse.get() * 0.5 }],
    width: active.get() * 6,
  }));

  return (
    <AnimatedView
      className="w-full flex-row items-center gap-3 rounded-[18px] border p-1.5"
      style={cardStyle}>
      <Image className="h-10 w-10 rounded-xl" source={avatar[side]} />
      <View className="flex-1 gap-[3px]">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-[15px] tracking-[-0.1px] text-[#f0f2f5]"
           >
            {name}
          </Text>
          <Text
            className="text-[13px] tracking-[0.2px] text-[#8f9298]"
            style={{ fontVariant: ['tabular-nums'] }}>
            {rating}
          </Text>
          {result ? (
            <Text
              className="overflow-hidden rounded-[5px] px-1.5 py-0.5 text-[10px] tracking-[0.6px]"
              style={{
                backgroundColor: result === 'win' ? withAlpha(theme.accent, 0.15) : withAlpha(theme.lose, 0.15),
                color: result === 'win' ? theme.accent : theme.lose,
              }}>
              {result === 'win' ? 'WON' : 'LOST'}
            </Text>
          ) : null}
        </View>
        <CaptureTray pieces={captured} lead={lead} foe={foe} />
      </View>
      <View className="relative flex-row items-center overflow-hidden rounded-xl bg-[#202329] px-[9px] py-[9px]">
        <AnimatedView
          className="absolute inset-0 bg-[#3a91f8]"
          pointerEvents="none"
          style={[{ opacity: 0 }, clockTintStyle]}
        />
        <AnimatedView className="h-1.5 rounded-full bg-[#3a91f8]" style={dotStyle} />
        <ReText
          text={clockText}
          style={[
            {
              color: theme.textMuted,
              fontSize: 16,
              fontVariant: ['tabular-nums'],
              padding: 0,
              textAlign: 'center',
              width: 44,
            },
            clockTextStyle,
          ]}
        />
      </View>
    </AnimatedView>
  );
};
