import type { GameConfig } from '@/types/games';

import { libraryAtom, store, updateGame, updateLibrary } from '../state';

import { createGame } from './lifecycle';

export function updateGameConfig(id: string, changes: Partial<GameConfig>) {
  updateGame(id, game => ({ ...game, config: { ...game.config, ...changes } }));
}

export function setDefaults(changes: Partial<GameConfig>) {
  updateLibrary(current => ({ ...current, defaults: { ...current.defaults, ...changes } }));
}

// finishing setup opens with a game for today in the chosen defaults when the history is empty
export function completeOnboarding() {
  updateLibrary(current => ({ ...current, onboardingComplete: true }));
  const library = store.get(libraryAtom);
  if (library && Object.keys(library.games).length === 0) createGame();
}
