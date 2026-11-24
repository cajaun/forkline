import { atom, getDefaultStore } from 'jotai';

import { saveLibrary, saveMoves } from '@/services/game-storage';
import type { GameConfig, GameLibrary, GameMoves, GameSummary } from '@/types/games';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const INITIAL_GAME_CONFIG: GameConfig = {
  agent: 'material-mobility',
  depths: {
    'king-safety-position': 1,
    'material-mobility': 1,
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

export const store = getDefaultStore();

export const libraryAtom = atom<GameLibrary | null>(null);
export const selectedGameIdAtom = atom<string | null>(null);

// move lists load on demand and stay cached for the session
const movesCache = new Map<string, GameMoves>();

export const emptyMoves = (): GameMoves => ({ moves: [], startFen: START_FEN });

export const cachedMoves = (id: string) => movesCache.get(id);

export const cacheMoves = (id: string, moves: GameMoves) => movesCache.set(id, moves);

export const clearMovesCache = () => movesCache.clear();
export const forgetMoves = (id: string) => movesCache.delete(id);

export function storeMoves(id: string, moves: GameMoves) {
  cacheMoves(id, moves);
  void saveMoves(id, moves);
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

// batches rapid writes like moves and clock flushes into one save
function persistSoon() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const library = store.get(libraryAtom);
    if (library) void saveLibrary(library);
  }, PERSIST_DELAY_MS);
}

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
