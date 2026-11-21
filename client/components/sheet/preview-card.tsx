import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dateFromDayKey, dayLabels } from '@/utils/days';
import { TransitionText } from '@/components/shared/numeric-text';
import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

// the handle starts on the weekday's centre line, 75pt below the sheet's top, and ends under the status bar
const HANDLE_HEIGHT = 6;
const HANDLE_WIDTH = 52;
const WEEKDAY_LINE_HEIGHT = 56;
const WEEKDAY_CLOSED_CENTER = 47 + WEEKDAY_LINE_HEIGHT / 2;
// replaced by the measured width after the first layout
const WEEKDAY_FALLBACK_WIDTH = 200;
// the word hands over near the handle's width, which (1 - p)^1.5 reaches around p = 0.6 for a 200pt word
const MORPH_CROSSFADE = [0.42, 0.64];

export const PreviewCard = memo(function PreviewCard({
  dayKey,
  onClose,
  onOpen,
  open,
  progress,
}: {
  dayKey: string;
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
  progress: SharedValue<number>;
}) {
  const { top: safeTop } = useSafeAreaInsets();
  const { colors } = useSheetColors();
  const { monthDay, weekday } = dayLabels(dayKey);
  // whole days since the epoch, so an earlier date rolls the other way
  const dayNumber = Math.round(dateFromDayKey(dayKey).getTime() / 86_400_000);

  // the weekday shrinks on the handle's line and cross-fades into the handle at matching width
  const weekdayWidth = useSharedValue(WEEKDAY_FALLBACK_WIDTH);
  // stable, so the memoised weekday text isn't re-rendered by the card
  const setWeekdayWidth = useCallback(
    (width: number) => {
      weekdayWidth.set(width);
    },
    [weekdayWidth],
  );
  const anchorY = (p: number) => {
    'worklet';
    return interpolate(
      p,
      [0, 1],
      [WEEKDAY_CLOSED_CENTER, safeTop + HANDLE_HEIGHT / 2],
    );
  };
  const weekdayShrink = (p: number) => {
    'worklet';
    return Math.pow(Math.min(Math.max(1 - p, 0), 1), 1.5);
  };
  const weekdayStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: interpolate(
        p,
        MORPH_CROSSFADE,
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        { translateY: anchorY(p) - WEEKDAY_CLOSED_CENTER },
        { scale: weekdayShrink(p) },
      ],
    };
  });
  const handleStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const wordWidth = weekdayWidth.value * weekdayShrink(p);
    return {
      opacity: interpolate(
        p,
        MORPH_CROSSFADE,
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        { translateY: anchorY(p) - WEEKDAY_CLOSED_CENTER },
        { scaleX: Math.max(wordWidth / HANDLE_WIDTH, 1) },
      ],
    };
  });
  const dateStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [95, safeTop + 15]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 0.43]) },
    ],
  }));

  // keep the close target inactive until the sheet is open

  return (
    <Pressable
      accessibilityLabel="Open chessboard sheet"
      className="absolute inset-0 z-1 overflow-visible rounded-[34px]"
      onPress={open ? undefined : onOpen}
      pointerEvents={open ? 'box-none' : 'auto'}>
      <View className="absolute inset-0 items-center" pointerEvents="none">
        <AnimatedView
          className="absolute left-0 right-0 items-center"
          style={[{ top: WEEKDAY_CLOSED_CENTER - WEEKDAY_LINE_HEIGHT / 2 }, weekdayStyle]}>
          <TransitionText
            color={colors.weekdayText}
            lineHeight={WEEKDAY_LINE_HEIGHT}
            onWidth={setWeekdayWidth}
            size={46}
            text={weekday}
            value={dayNumber}
            weight="black"
          />
        </AnimatedView>
        <AnimatedView
          className="absolute left-0 right-0 items-center"
          style={[{ top: WEEKDAY_CLOSED_CENTER - HANDLE_HEIGHT / 2 }, handleStyle]}>
          <View
            className="rounded-[3px]"
            style={{
              backgroundColor: colors.handle,
              height: HANDLE_HEIGHT,
              width: HANDLE_WIDTH,
            }}
          />
        </AnimatedView>
        <AnimatedView
          className="absolute left-0 right-0 items-center"
          style={dateStyle}>
          <TransitionText
            color={colors.dateText}
            letterSpacing={-1.3}
            lineHeight={56}
            size={48}
            text={monthDay}
            value={dayNumber}
            weight="black"
          />
        </AnimatedView>
      </View>
      <Pressable
        accessibilityLabel="Close chessboard"
        className="absolute left-0 right-0 z-5 h-9.5 items-center justify-center"
        onPress={onClose}
        pointerEvents={open ? 'auto' : 'none'}
        style={{ top: 31 }}
      />
    </Pressable>
  );
});
