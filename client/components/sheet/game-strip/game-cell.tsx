import { memo, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { useAtomValue } from 'jotai';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/shared/pressable-scale';
import { ClockFace } from '@/components/shared/clock-face';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { GameSummary } from '@/types/games';
import { dayLabels } from '@/utils/days';

import { REMOVE_FADE_MS, removingGameIdAtom } from '../delete-game-tray';
import type { StripGame } from './strip-items';

export const PILL_WIDTH_RATIO = 0.84;

const HIGHLIGHT_FADE = { duration: 220, easing: Easing.out(Easing.quad) };

// a game in progress fills against a typical game length and stops short of full
const TYPICAL_GAME_PLIES = 80;

const MAX_ACTIVE_PROGRESS = 0.9;

const STATUS_SIZE = 22;

// a game made this recently fades in while older games appear as the strip loads
const NEW_GAME_WINDOW_MS = 1500;
const FADE_MS = 180;
// the new game waits for its neighbours to make room before it fades in
const ENTER_DELAY_MS = 80;

// a check marks a finished game and the clock face shows progress for one in play
function GameStatusMark({ color, game, inner }: { color: string; game: GameSummary; inner: string }) {
  if (game.status === 'finished') {
    return (
      <SfSymbol
        fallback="checkmark-circle"
        name="checkmark.circle.fill"
        size={STATUS_SIZE}
        tintColor={color}
      />
    );
  }
  const progress = Math.min(MAX_ACTIVE_PROGRESS, game.moveCount / TYPICAL_GAME_PLIES);
  return <ClockFace fraction={1 - progress} inner={inner} outer={color} size={STATUS_SIZE} />;
}

export const GameCell = memo(function GameCell({
  entry,
  onLongPress,
  onPress,
  selected,
  width,
}: {
  entry: StripGame;
  onLongPress: (gameId: string, label: string) => void;
  onPress: (gameId: string) => void;
  selected: boolean;
  width: number;
}) {
  const { colors } = useSheetColors();
  const { game, numberInDay } = entry;
  const labels = dayLabels(game.dayKey);
  const textColor = selected ? colors.selectedDateText : colors.text;
  const heading = numberInDay ? `${labels.shortWeekday} · ${numberInDay}` : labels.shortWeekday;
  const [isNew] = useState(() => Date.now() - game.createdAt < NEW_GAME_WINDOW_MS);
  const highlight = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    highlight.set(withTiming(selected ? 1 : 0, HIGHLIGHT_FADE));
  }, [highlight, selected]);
  // one opacity drives both fades since a Reanimated entering animation fights a style that sets opacity
  const removing = useAtomValue(removingGameIdAtom) === game.id;
  const presence = useSharedValue(isNew ? 0 : 1);
  useEffect(() => {
    if (removing) presence.set(withTiming(0, { duration: REMOVE_FADE_MS }));
    else presence.set(withDelay(isNew ? ENTER_DELAY_MS : 0, withTiming(1, { duration: FADE_MS })));
  }, [isNew, presence, removing]);
  const presenceStyle = useAnimatedStyle(() => ({ opacity: presence.get() }));
  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlight.get(),
    transform: [{ scale: 0.92 + highlight.get() * 0.08 }],
  }));

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          height: '100%',
          justifyContent: 'center',
          width,
        },
        presenceStyle,
      ]}>
      <PressableScale
        accessibilityLabel={`Game ${numberInDay ?? 1} on ${labels.weekday} ${labels.monthDay}`}
        onLongPress={() => onLongPress(game.id, `${labels.weekday} ${labels.monthDay}`)}
        onPress={() => onPress(game.id)}
        style={{
          alignItems: 'center',
          borderRadius: 23,
          gap: 5,
          height: '100%',
          justifyContent: 'center',
          paddingVertical: 15,
          width: width * PILL_WIDTH_RATIO,
        }}>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              backgroundColor: colors.selectedDateBackground,
              borderCurve: 'continuous',
              borderRadius: 23,
              bottom: 0,
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
            },
            highlightStyle,
          ]}
        />
        <Text numberOfLines={1} style={{ color: textColor, fontSize: 14, fontWeight: '800' }}>
          {heading}
        </Text>
        <Text numberOfLines={1} style={{ color: textColor, fontSize: 28, fontWeight: '900' }}>
          {labels.date}
        </Text>
        <View style={{ marginTop: 3 }}>
          <GameStatusMark
            color={selected ? colors.selectedDateText : colors.mutedText}
            game={game}
            // the inner circle takes the colour behind it
            inner={selected ? colors.selectedDateBackground : colors.appBackground}
          />
        </View>
      </PressableScale>
    </Animated.View>
  );
});
