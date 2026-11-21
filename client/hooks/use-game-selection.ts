import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as Haptics from 'expo-haptics';
import { Gesture } from 'react-native-gesture-handler';

import type { GameLibrary, GameSummary } from '@/types/games';
import { todayKey } from '@/utils/days';

// a horizontal swipe on the closed card moves between games of the same day
const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 450;

// a day tap or card swipe shows the picked game at once, while a transition moves the board and server over
export function useGameSelection({
  gamesByDay,
  library,
  onOpen,
  open,
  selectGame,
  selectedGame,
}: {
  gamesByDay: Record<string, GameSummary[]>;
  library: GameLibrary | null;
  onOpen: () => void;
  open: boolean;
  selectGame: (id: string) => void;
  selectedGame: GameSummary | null;
}) {
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const pendingGame = pendingGameId ? (library?.games[pendingGameId] ?? null) : null;
  const shownGame = pendingGame ?? selectedGame;
  const shownDayKey = shownGame?.dayKey ?? todayKey();
  const dayGames = useMemo(() => gamesByDay[shownDayKey] ?? [], [gamesByDay, shownDayKey]);
  const gameIndex = shownGame ? dayGames.findIndex(game => game.id === shownGame.id) : -1;

  const showGame = useCallback(
    (gameId: string) => {
      setPendingGameId(gameId);
      startTransition(() => {
        selectGame(gameId);
        setPendingGameId(null);
      });
    },
    [selectGame],
  );

  // the handlers read the latest values from a ref, so the memoised strip and card keep the same callbacks
  const latest = useRef({ gamesByDay, hasGame: false, onOpen, shownGameId: '' });
  useEffect(() => {
    latest.current = {
      gamesByDay,
      hasGame: selectedGame !== null,
      onOpen,
      shownGameId: shownGame?.id ?? '',
    };
  });

  // a day opens on its most recent game
  const selectDay = useCallback(
    (dayKey: string) => {
      const games = latest.current.gamesByDay[dayKey];
      const target = games?.[games.length - 1];
      if (target && target.id !== latest.current.shownGameId) showGame(target.id);
    },
    [showGame],
  );

  const openShownGame = useCallback(() => {
    if (latest.current.hasGame) latest.current.onOpen();
  }, []);

  // swipe left for the next, newer game and right for the previous one
  const swipeTo = useCallback(
    (translationX: number, velocityX: number) => {
      const swiped =
        Math.abs(translationX) > SWIPE_DISTANCE || Math.abs(velocityX) > SWIPE_VELOCITY;
      if (!swiped || gameIndex < 0) return;
      const target = dayGames[gameIndex + (translationX < 0 ? 1 : -1)];
      if (!target) return;
      void Haptics.selectionAsync();
      showGame(target.id);
    },
    [dayGames, gameIndex, showGame],
  );

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .enabled(!open && dayGames.length > 1)
        .activeOffsetX([-16, 16])
        .failOffsetY([-12, 12])
        .onEnd(event => swipeTo(event.translationX, event.velocityX)),
    [dayGames.length, open, swipeTo],
  );

  return {
    dayGames,
    gameIndex,
    openShownGame,
    pendingGame,
    selectDay,
    shownDayKey,
    shownGame,
    swipeGesture,
  };
}
