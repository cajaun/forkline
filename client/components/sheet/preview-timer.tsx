import { memo, useEffect, useState } from 'react';
import { View } from 'react-native';

import { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NumericText } from '@/components/shared/numeric-text';
import { AnimatedView } from '@/components/shared/uniwind';
import { SHEET_LAYOUT } from '@/constants/sheet';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { formatElapsed } from '@/utils/days';

// how often a running clock writes to the store and disk, re-rendering only itself in between
const CLOCK_FLUSH_MS = 15_000;

// counts time since the last store write, so the per-second tick re-renders only the clock
function useRunningClock(
  gameId: string | null,
  running: boolean,
  onCommit: (gameId: string, ms: number) => void,
) {
  const [unsaved, setUnsaved] = useState(0);

  useEffect(() => {
    if (!running || !gameId) return;
    let since = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = now - since;
      if (delta >= CLOCK_FLUSH_MS) {
        // the store and the local counter update in the same render
        onCommit(gameId, delta);
        since = now;
        setUnsaved(0);
      } else {
        setUnsaved(delta);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
      // save whatever ran since the last write when the clock stops
      onCommit(gameId, Date.now() - since);
      setUnsaved(0);
    };
  }, [gameId, onCommit, running]);

  return unsaved;
}

// the game clock under the date, rising with the sheet to sit below the status bar
export const PreviewTimer = memo(function PreviewTimer({
  elapsedMs,
  gameId,
  height,
  onCommitElapsed,
  progress,
  running,
}: {
  // time already saved on the game
  elapsedMs: number;
  gameId: string | null;
  height: number;
  onCommitElapsed: (gameId: string, ms: number) => void;
  progress: SharedValue<number>;
  running: boolean;
}) {
  const { top: safeTop } = useSafeAreaInsets();
  const { colors } = useSheetColors();
  const shownMs = elapsedMs + useRunningClock(gameId, running, onCommitElapsed);
  const style = useAnimatedStyle(() => ({
    left: 0,
    right: 0,
    top: interpolate(
      progress.value,
      [0, 1],
      [height * SHEET_LAYOUT.closedTop + 151, safeTop + 50],
    ),
  }));

  return (
    <AnimatedView
      className="absolute z-2 items-center"
      pointerEvents="none"
      style={style}>
      <View className="flex-row items-center gap-2">
        <View
          className="h-4 w-4 rounded-full border-2"
          style={{ borderColor: colors.dateText }}
        />
        <NumericText
          color={colors.dateText}
          lineHeight={26}
          monospacedDigits
          size={22}
          text={formatElapsed(shownMs)}
          value={Math.floor(shownMs / 1000)}
          weight="bold"
        />
      </View>
    </AnimatedView>
  );
});
