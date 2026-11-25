import { useMemo } from 'react';

import { atom, useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';

import type { GameSummary } from '@/types/games';
import { dayRange, todayKey } from '@/utils/days';
import { endedByApp, humanOutcome } from '@/utils/game-ending';

import { gameActions } from './actions';
import { INITIAL_GAME_CONFIG, groupByDay, libraryAtom, selectedGameIdAtom } from './state';

const selectedGameAtom = atom(get => {
  const library = get(libraryAtom);
  const id = get(selectedGameIdAtom);
  return (library && id ? library.games[id] : null) ?? null;
});

const onboardingAtom = selectAtom(
  libraryAtom,
  library => ({
    defaults: library?.defaults ?? INITIAL_GAME_CONFIG,
    hydrated: library !== null,
    onboardingComplete: library?.onboardingComplete ?? false,
  }),
  (a, b) =>
    a.defaults === b.defaults && a.hydrated === b.hydrated && a.onboardingComplete === b.onboardingComplete,
);

// the game settings tray reads fields a move leaves alone
const gameSettingsAtom = selectAtom(
  atom(get => ({ defaults: get(libraryAtom)?.defaults, game: get(selectedGameAtom) })),
  ({ defaults, game }) => ({
    defaults: defaults ?? INITIAL_GAME_CONFIG,
    game: game ? { config: game.config, id: game.id, started: game.moveCount > 0 } : null,
  }),
  (a, b) =>
    a.defaults === b.defaults &&
    a.game?.id === b.game?.id &&
    a.game?.config === b.game?.config &&
    a.game?.started === b.game?.started,
);

const defaultSettingsAtom = selectAtom(
  libraryAtom,
  library => ({ defaults: library?.defaults ?? INITIAL_GAME_CONFIG, game: null }),
  (a, b) => a.defaults === b.defaults,
);

const selectedStandingAtom = selectAtom(
  selectedGameAtom,
  game =>
    game
      ? {
          canUndo: canUndo(game),
          gameMode: game.config.gameMode,
          status: game.status,
          won: humanOutcome(game) === 'win',
        }
      : null,
  (a, b) =>
    a?.gameMode === b?.gameMode && a?.status === b?.status && a?.canUndo === b?.canUndo && a?.won === b?.won,
);

// a game against the AI with a human move on the board and no app ending or win to take back
function canUndo(game: GameSummary) {
  if (game.config.gameMode !== 'human-vs-agent') return false;
  if (endedByApp(game.termination) || humanOutcome(game) === 'win') return false;
  return game.moveCount >= (game.config.humanColor === 'white' ? 1 : 2);
}

export function useSelectedGameStanding() {
  return useAtomValue(selectedStandingAtom);
}

export function useOnboardingState() {
  return useAtomValue(onboardingAtom);
}

export function useSettingsSlice(scope: 'defaults' | 'game') {
  return useAtomValue(scope === 'game' ? gameSettingsAtom : defaultSettingsAtom);
}

export function useGameLibrary() {
  const library = useAtomValue(libraryAtom);
  const selectedGame = useAtomValue(selectedGameAtom);
  const gamesByDay = useMemo(() => (library ? groupByDay(library.games) : {}), [library]);
  // each day from the first game to today so the strip has no gaps
  const days = useMemo(() => {
    const today = todayKey();
    const keys = Object.keys(gamesByDay).sort();
    return dayRange(keys[0] ?? today, today);
  }, [gamesByDay]);

  return { ...gameActions, days, gamesByDay, library, selectedGame };
}
