import { clearAllGames, loadLibrary, loadMoves } from '@/services/game-storage';
import type { GameConfig, GameMoves, RecordedState } from '@/types/games';
import { todayKey } from '@/utils/days';

import { buildSampleHistory } from './sample-history';
import {
  EMPTY_LIBRARY,
  INITIAL_GAME_CONFIG,
  START_FEN,
  cacheMoves,
  cachedMoves,
  clearMovesCache,
  emptyMoves,
  groupByDay,
  libraryAtom,
  newGameId,
  newGameSummary,
  selectedGameIdAtom,
  store,
  storeMoves,
  updateGame,
  updateLibrary,
} from './state';

async function hydrate() {
  const saved = await loadLibrary();
  store.set(libraryAtom, saved ?? EMPTY_LIBRARY);
}

// starts a game today with the given settings, or the defaults, and selects it
function createGame(config?: GameConfig) {
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

// today always has a game to open, and the selection falls back to today's latest
function ensureTodayGame() {
  const library = store.get(libraryAtom);
  if (!library?.onboardingComplete) return;
  const todays = groupByDay(library.games)[todayKey()];
  if (!todays?.length) {
    createGame();
    return;
  }
  const selectedId = store.get(selectedGameIdAtom);
  if (!selectedId || !library.games[selectedId]) {
    store.set(selectedGameIdAtom, todays[todays.length - 1].id);
  }
}

function selectGame(id: string) {
  store.set(selectedGameIdAtom, id);
}

async function getMoves(id: string): Promise<GameMoves> {
  const cached = cachedMoves(id);
  if (cached) return cached;
  const saved = (await loadMoves(id)) ?? emptyMoves();
  cacheMoves(id, saved);
  return saved;
}

// mirrors the server's authoritative state, skipping the library write when nothing visible changed
function recordState(id: string, state: RecordedState) {
  storeMoves(id, { moves: state.moves, startFen: cachedMoves(id)?.startFen ?? START_FEN });
  updateGame(id, game =>
    game.fen === state.fen &&
    game.moveCount === state.moves.length &&
    game.status === state.status &&
    game.result === state.result
      ? game
      : {
          ...game,
          fen: state.fen,
          moveCount: state.moves.length,
          result: state.result,
          status: state.status,
          termination: state.termination,
        },
  );
}

// "Start over" keeps the game and its settings, clears the board and clock, and bumps the revision
function restartGame(id: string) {
  storeMoves(id, emptyMoves());
  updateGame(id, game => ({
    ...newGameSummary(game.id, game.config, game.dayKey, game.createdAt),
    revision: (game.revision ?? 0) + 1,
  }));
}

// reads the selection at call time, so the undo tray's action never changes identity
function restartSelectedGame() {
  const id = store.get(selectedGameIdAtom);
  if (id) restartGame(id);
}

function updateGameConfig(id: string, changes: Partial<GameConfig>) {
  updateGame(id, game => ({ ...game, config: { ...game.config, ...changes } }));
}

// the clock only counts for games still in play
function addElapsed(id: string, ms: number) {
  if (ms <= 0) return;
  updateGame(id, game =>
    game.status === 'active' ? { ...game, elapsedMs: game.elapsedMs + ms } : game,
  );
}

function setDefaults(changes: Partial<GameConfig>) {
  updateLibrary(current => ({ ...current, defaults: { ...current.defaults, ...changes } }));
}

function completeOnboarding() {
  updateLibrary(current => ({ ...current, onboardingComplete: true }));
}

// development only, fills the past week with saved games
function seedSampleHistory() {
  if (!__DEV__) return;
  const { games, moves } = buildSampleHistory(
    store.get(libraryAtom)?.defaults ?? INITIAL_GAME_CONFIG,
  );
  for (const [id, history] of Object.entries(moves)) storeMoves(id, history);
  updateLibrary(current => ({ ...current, games: { ...current.games, ...games } }));
}

// development only, wipes everything so onboarding runs again
async function resetLibrary() {
  if (!__DEV__) return;
  await clearAllGames();
  clearMovesCache();
  store.set(selectedGameIdAtom, null);
  store.set(libraryAtom, EMPTY_LIBRARY);
}

export const gameActions = {
  addElapsed,
  completeOnboarding,
  createGame,
  ensureTodayGame,
  getMoves,
  hydrate,
  recordState,
  resetLibrary,
  restartGame,
  restartSelectedGame,
  seedSampleHistory,
  selectGame,
  setDefaults,
  updateGameConfig,
};
