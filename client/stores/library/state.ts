import { atom, getDefaultStore } from 'jotai';

import { saveLibrary, saveMoves } from '@/services/game-storage';
import type { GameConfig, GameLibrary, GameMoves, GameSummary } from '@/types/games';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const INITIAL_GAME_CONFIG: GameConfig = {
  agent: 'material-mobility',
  depths: {
    'king-safety-position': 2,
    'material-mobility': 2,
  },
  gameMode: 'human-vs-agent',
  humanColor: 'white',
};

export const EMPTY_LIBRARY: GameLibrary = {
  defaults: INITIAL_GAME_CONFIG,
  games: {},
  onboardingComplete: false,
  version: 1,
};

const PERSIST_DELAY_MS = 300;

// actions use jotai's default store directly so they stay stable, and components subscribe through selectors.ts
export const store = getDefaultStore();

// null until the saved library has been read from disk
export const libraryAtom = atom<GameLibrary | null>(null);
export const selectedGameIdAtom = atom<string | null>(null);

// move lists load on demand and nothing renders them, so a plain map caches them
const movesCache = new Map<string, GameMoves>();

export const emptyMoves = (): GameMoves => ({ moves: [], startFen: START_FEN });

export const cachedMoves = (id: string) => movesCache.get(id);

export const cacheMoves = (id: string, moves: GameMoves) => movesCache.set(id, moves);

export const clearMovesCache = () => movesCache.clear();

// caches a game's moves for the session and writes them through to disk
export function storeMoves(id: string, moves: GameMoves) {
  cacheMoves(id, moves);
  void saveMoves(id, moves);
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

// batches rapid changes like moves and clock flushes into one write
function persistSoon() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const library = store.get(libraryAtom);
    if (library) void saveLibrary(library);
  }, PERSIST_DELAY_MS);
}

// an update that returns the same object counts as a no-op and skips the write
export function updateLibrary(update: (library: GameLibrary) => GameLibrary) {
  const current = store.get(libraryAtom);
  if (!current) return;
  const next = update(current);
  if (next === current) return;
  store.set(libraryAtom, next);
  persistSoon();
}

export function updateGame(id: string, update: (game: GameSummary) => GameSummary) {
  updateLibrary(current => {
    const game = current.games[id];
    if (!game) return current;
    const next = update(game);
    return next === game ? current : { ...current, games: { ...current.games, [id]: next } };
  });
}

export function newGameId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// a fresh game record at the start position
export function newGameSummary(
  id: string,
  config: GameConfig,
  dayKey: string,
  createdAt = Date.now(),
): GameSummary {
  return {
    config,
    createdAt,
    dayKey,
    elapsedMs: 0,
    fen: START_FEN,
    id,
    moveCount: 0,
    result: null,
    status: 'active',
    termination: null,
  };
}

// games grouped by day, oldest first within each day
export function groupByDay(games: Record<string, GameSummary>) {
  const byDay: Record<string, GameSummary[]> = {};
  for (const game of Object.values(games)) {
    (byDay[game.dayKey] ??= []).push(game);
  }
  for (const list of Object.values(byDay)) {
    list.sort((a, b) => a.createdAt - b.createdAt);
  }
  return byDay;
}
