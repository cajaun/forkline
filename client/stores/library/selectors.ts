import { useMemo } from 'react';

import { atom, useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { dayRange, todayKey } from '@/utils/days';

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
    a.defaults === b.defaults &&
    a.hydrated === b.hydrated &&
    a.onboardingComplete === b.onboardingComplete,
);

// the in-game settings tray needs the defaults and the open game's settings, which a move never changes
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

// the home tray ignores the open game, so selecting another game doesn't re-render it
const defaultSettingsAtom = selectAtom(
  libraryAtom,
  library => ({ defaults: library?.defaults ?? INITIAL_GAME_CONFIG, game: null }),
  (a, b) => a.defaults === b.defaults,
);

export function useOnboardingState() {
  return useAtomValue(onboardingAtom);
}

export function useSettingsSlice(scope: 'defaults' | 'game') {
  return useAtomValue(scope === 'game' ? gameSettingsAtom : defaultSettingsAtom);
}

// the main screen's view: the whole history and the selected game
export function useGameLibrary() {
  const library = useAtomValue(libraryAtom);
  const selectedGame = useAtomValue(selectedGameAtom);
  const gamesByDay = useMemo(() => (library ? groupByDay(library.games) : {}), [library]);
  // every day from the first game to today, so the strip has no gaps
  const days = useMemo(() => {
    const today = todayKey();
    const keys = Object.keys(gamesByDay).sort();
    return dayRange(keys[0] ?? today, today);
  }, [gamesByDay]);

  return { ...gameActions, days, gamesByDay, library, selectedGame };
}
