import { useCallback } from 'react';

import { gameActions, useSettingsSlice } from '@/stores/games';
import type { GameConfig } from '@/types/games';

import type { SettingsScope } from './types';

// defaults apply to new games, while a started game takes strategy and depth from its next move and restarts for a new mode or colour
export function useScopedConfig(scope: SettingsScope) {
  const { defaults, game } = useSettingsSlice(scope);
  const editsGame = scope === 'game' && game !== null;
  const config: GameConfig = editsGame ? game.config : defaults;

  const change = useCallback(
    (changes: Partial<GameConfig>) => {
      if (!editsGame || !game) {
        gameActions.setDefaults(changes);
        return;
      }
      const restarts =
        (changes.gameMode !== undefined && changes.gameMode !== game.config.gameMode) ||
        (changes.humanColor !== undefined && changes.humanColor !== game.config.humanColor);
      if (restarts && game.started) {
        gameActions.createGame({ ...game.config, ...changes });
        return;
      }
      gameActions.updateGameConfig(game.id, changes);
    },
    [editsGame, game],
  );

  const startNewGame = useCallback(() => {
    gameActions.createGame(config);
  }, [config]);

  return {
    change,
    config,
    // the game's mode and colour are locked once it has moves
    modeLocked: editsGame && (game?.started ?? false),
    scope: editsGame ? ('game' as const) : ('defaults' as const),
    startNewGame,
  };
}
