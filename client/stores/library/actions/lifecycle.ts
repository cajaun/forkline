import { deleteMoves, loadLibrary, loadMoves } from '@/services/game-storage';
import type { GameConfig, GameMoves } from '@/types/games';
import { todayKey } from '@/utils/days';

import { EMPTY_LIBRARY, cacheMoves, cachedMoves, emptyMoves, forgetMoves, libraryAtom, newGameId, newGameSummary, selectedGameIdAtom, store, storeMoves, updateLibrary } from '../state';

export async function hydrate() {
  const saved = await loadLibrary();
  store.set(libraryAtom, saved ?? EMPTY_LIBRARY);
}

export function createGame(config?: GameConfig) {
  const id = newGameId();
  updateLibrary(current => ({
    ...current,
    games: {
      ...current.games,
      [id]: newGameSummary(id, config ?? current.defaults, todayKey()),
    },
  }));
  storeMoves(id, emptyMoves());
  store.set(selectedGameIdAtom, id);
  return id;
}

// games appear from the + button so this keeps the selection on an existing game
export function ensureSelection() {
  const library = store.get(libraryAtom);
  if (!library) return;
  const selectedId = store.get(selectedGameIdAtom);
  if (selectedId && library.games[selectedId]) return;
  const newest = Object.values(library.games).sort((a, b) => b.createdAt - a.createdAt)[0];
  store.set(selectedGameIdAtom, newest?.id ?? null);
}

// removes a game and its moves for good then selects the newest game left
export function deleteGame(id: string) {
  const wasSelected = store.get(selectedGameIdAtom) === id;
  updateLibrary(current => {
    if (!current.games[id]) return current;
    const games = { ...current.games };
    delete games[id];
    return { ...current, games };
  });
  forgetMoves(id);
  void deleteMoves(id);
  if (wasSelected) {
    store.set(selectedGameIdAtom, null);
    ensureSelection();
  }
}

export function selectGame(id: string) {
  store.set(selectedGameIdAtom, id);
}

export async function getMoves(id: string): Promise<GameMoves> {
  const cached = cachedMoves(id);
  if (cached) return cached;
  const saved = (await loadMoves(id)) ?? emptyMoves();
  cacheMoves(id, saved);
  return saved;
}
