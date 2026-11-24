import { startTransition, useCallback, useEffect, useRef, useState } from 'react';

import type { GameLibrary, GameSummary } from '@/types/games';
import { todayKey } from '@/utils/days';

// a strip tap shows the picked game at once while a transition moves the board and server
export function useGameSelection({
  library,
  onOpen,
  selectGame,
  selectedGame,
}: {
  library: GameLibrary | null;
  onOpen: () => void;
  selectGame: (id: string) => void;
  selectedGame: GameSummary | null;
}) {
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const pendingGame = pendingGameId ? (library?.games[pendingGameId] ?? null) : null;
  const shownGame = pendingGame ?? selectedGame;
  const shownDayKey = shownGame?.dayKey ?? todayKey();

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

  const latest = useRef({ hasGame: false, onOpen });
  useEffect(() => {
    latest.current = { hasGame: selectedGame !== null, onOpen };
  });

  const openShownGame = useCallback(() => {
    if (latest.current.hasGame) latest.current.onOpen();
  }, []);

  return { openShownGame, pendingGame, showGame, shownDayKey, shownGame };
}
