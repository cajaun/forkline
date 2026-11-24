import { useEffect, useRef } from 'react';

import { Easing, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import * as Haptics from '@/services/haptics';
import type { GameSummary } from '@/types/games';
import { resultOf } from '@/utils/game-ending';

// the confetti flies first and the board steps aside once it peaks
const RESULT_DELAY_MS = 450;
const RESULT_SPRING = { damping: 26, mass: 1, stiffness: 180 };

// drives the result layout and fires confetti only when a game is won in front of the player
export function useWinCelebration(game: GameSummary | null, onWin: () => void) {
  const result = useSharedValue(0);
  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  });
  const seenRef = useRef<{ id: string | null; status: string | null }>({ id: null, status: null });

  const id = game?.id ?? null;
  const status = game?.status ?? null;
  const outcome = resultOf(game);
  const shows = outcome !== null;
  const won = outcome?.win ?? false;

  useEffect(() => {
    const seen = seenRef.current;
    seenRef.current = { id, status };
    const sameGame = seen.id === id;

    if (!shows) {
      // Start over on the same game slides the board back while a game switch jumps
      result.set(sameGame ? withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) }) : 0);
      return;
    }

    if (sameGame && seen.status === 'active') {
      // only a player win fires the confetti while a draw or a watched result just settles in
      if (won) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onWinRef.current();
      }
      result.set(withDelay(RESULT_DELAY_MS, withSpring(1, RESULT_SPRING)));
      return;
    }
    // a finished game opens straight onto its stats
    result.set(1);
  }, [id, result, shows, status, won]);

  return result;
}
