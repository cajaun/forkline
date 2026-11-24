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

import { SHEET_CARD_TEXT } from '@/constants/sheet';

import { dateFromDayKey, dayLabels } from '@/utils/days';
import { TransitionText } from '@/components/shared/numeric-text';
import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';

const HANDLE_HEIGHT = 6;
const HANDLE_WIDTH = 52;
const WEEKDAY_LINE_HEIGHT = SHEET_CARD_TEXT.weekdayLineHeight;
const WEEKDAY_CLOSED_CENTER = SHEET_CARD_TEXT.weekdayTop + WEEKDAY_LINE_HEIGHT / 2;
const WEEKDAY_FALLBACK_WIDTH = 200;
// the weekday hands over to the handle near the handle width
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
  const dayNumber = Math.round(dateFromDayKey(dayKey).getTime() / 86_400_000);

  const weekdayWidth = useSharedValue(WEEKDAY_FALLBACK_WIDTH);
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
  // the weekday shrinks on the handle line as the sheet opens
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
    top: interpolate(progress.value, [0, 1], [SHEET_CARD_TEXT.dateTop, safeTop + 15]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 0.43]) },
    ],
  }));

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
            fillWidth
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
            fillWidth
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
