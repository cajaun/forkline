import { createGame, deleteGame, ensureSelection, getMoves, hydrate, selectGame } from './lifecycle';
import {
  addElapsed,
  spendHint,
  recordState,
  resignSelectedGame,
  restartGame,
  restartSelectedGame,
  timeOutGame,
  undoSelectedTurn,
} from './play';
import { completeOnboarding, setDefaults, updateGameConfig } from './settings';
import { resetLibrary, seedSampleHistory, simulateWin } from './dev';

export const gameActions = {
  addElapsed,
  completeOnboarding,
  createGame,
  deleteGame,
  ensureSelection,
  getMoves,
  hydrate,
  recordState,
  resetLibrary,
  resignSelectedGame,
  restartGame,
  restartSelectedGame,
  seedSampleHistory,
  selectGame,
  simulateWin,
  setDefaults,
  spendHint,
  timeOutGame,
  undoSelectedTurn,
  updateGameConfig,
};
