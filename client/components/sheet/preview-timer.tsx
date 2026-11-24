import { memo, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClockFace } from '@/components/shared/clock-face';
import { NumericText } from '@/components/shared/numeric-text';
import { AnimatedView } from '@/components/shared/uniwind';
import { GAME_TIME_LIMIT_MS } from '@/constants/game-rules';
import { SHEET_CARD_TEXT, SHEET_LAYOUT } from '@/constants/sheet';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { formatElapsed } from '@/utils/days';

// a running clock writes to the store at this pace and re-renders itself in between
const CLOCK_FLUSH_MS = 15_000;
const CLOCK_TEXT_WIDTH = 62;

// counts time since the last write and ends the game at the limit
function useRunningClock(
  gameId: string | null,
  running: boolean,
  elapsedMs: number,
  onCommit: (gameId: string, ms: number) => void,
  onTimeUp: (gameId: string) => void,
) {
  const [unsaved, setUnsaved] = useState(0);
  const savedRef = useRef(elapsedMs);
  useEffect(() => {
    savedRef.current = elapsedMs;
  });

  useEffect(() => {
    if (!running || !gameId) return;
    let since = Date.now();
    let ended = false;
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = now - since;
      if (savedRef.current + delta >= GAME_TIME_LIMIT_MS) {
        ended = true;
        clearInterval(timer);
        onCommit(gameId, delta);
        since = now;
        setUnsaved(0);
        onTimeUp(gameId);
        return;
      }
      if (delta >= CLOCK_FLUSH_MS) {
        onCommit(gameId, delta);
        since = now;
        setUnsaved(0);
      } else {
        setUnsaved(delta);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
      if (!ended) onCommit(gameId, Date.now() - since);
      setUnsaved(0);
    };
  }, [gameId, onCommit, onTimeUp, running]);

  return unsaved;
}

export const PreviewTimer = memo(function PreviewTimer({
  elapsedMs,
  gameId,
  height,
  onCommitElapsed,
  onTimeUp,
  progress,
  running,
}: {
  elapsedMs: number;
  gameId: string | null;
  height: number;
  onCommitElapsed: (gameId: string, ms: number) => void;
  onTimeUp: (gameId: string) => void;
  progress: SharedValue<number>;
  running: boolean;
}) {
  const { top: safeTop } = useSafeAreaInsets();
  const { colors } = useSheetColors();
  const unsaved = useRunningClock(gameId, running, elapsedMs, onCommitElapsed, onTimeUp);
  const shownMs = Math.min(GAME_TIME_LIMIT_MS, elapsedMs + unsaved);
  // rounds up so the clock reads 0:00 once time is out
  const remainingMs = Math.ceil((GAME_TIME_LIMIT_MS - shownMs) / 1000) * 1000;
  const style = useAnimatedStyle(() => ({
    left: 0,
    right: 0,
    top: interpolate(
      progress.value,
      [0, 1],
      [height * SHEET_LAYOUT.closedTop + SHEET_CARD_TEXT.timerOffset, safeTop + 50],
    ),
  }));

  return (
    <AnimatedView
      className="absolute z-2 items-center"
      pointerEvents="none"
      style={style}>
      <View className="flex-row items-center gap-2">
        <ClockFace
          fraction={1 - shownMs / GAME_TIME_LIMIT_MS}
          inner={colors.background}
          outer={colors.dateText}
          size={19}
        />
        {/* the time sits in a slot as wide as 00:00 so a shorter time never shifts the clock */}
        <View style={{ alignItems: 'flex-start', width: CLOCK_TEXT_WIDTH }}>
          <NumericText
            color={colors.dateText}
            lineHeight={26}
            monospacedDigits
            size={22}
            text={formatElapsed(remainingMs)}
            value={remainingMs / 1000}
            weight="bold"
          />
        </View>
      </View>
    </AnimatedView>
  );
});
