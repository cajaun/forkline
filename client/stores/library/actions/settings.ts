import type { GameConfig } from '@/types/games';

import { updateGame, updateLibrary } from '../state';

export function updateGameConfig(id: string, changes: Partial<GameConfig>) {
  updateGame(id, game => ({ ...game, config: { ...game.config, ...changes } }));
}

export function setDefaults(changes: Partial<GameConfig>) {
  updateLibrary(current => ({ ...current, defaults: { ...current.defaults, ...changes } }));
}

// games nobody has played yet take the defaults chosen during setup
export function completeOnboarding() {
  updateLibrary(current => ({
    ...current,
    games: Object.fromEntries(
      Object.entries(current.games).map(([id, game]) => [
        id,
        game.moveCount === 0 ? { ...game, config: current.defaults } : game,
      ]),
    ),
    onboardingComplete: true,
  }));
}
