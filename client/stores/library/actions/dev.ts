import { clearAllGames } from '@/services/game-storage';

import { buildSampleHistory } from '../sample-history';
import { EMPTY_LIBRARY, INITIAL_GAME_CONFIG, clearMovesCache, libraryAtom, selectedGameIdAtom, store, storeMoves, updateLibrary } from '../state';

// dev builds can fill the history with sample games
export function seedSampleHistory() {
  if (!__DEV__) return;
  const { games, moves } = buildSampleHistory(
    store.get(libraryAtom)?.defaults ?? INITIAL_GAME_CONFIG,
  );
  for (const [id, history] of Object.entries(moves)) storeMoves(id, history);
  updateLibrary(current => ({ ...current, games: { ...current.games, ...games } }));
}

// dev builds can wipe everything so onboarding runs again
export async function resetLibrary() {
  if (!__DEV__) return;
  await clearAllGames();
  clearMovesCache();
  store.set(selectedGameIdAtom, null);
  store.set(libraryAtom, EMPTY_LIBRARY);
}
