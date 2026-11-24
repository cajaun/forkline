import { Chess } from 'chess.js';

import { GAME_TIME_LIMIT_MS } from '@/constants/game-rules';
import type { GameSummary, RecordedState } from '@/types/games';
import { aiWinResult, endedByApp } from '@/utils/game-ending';

import { START_FEN, cachedMoves, emptyMoves, libraryAtom, newGameSummary, selectedGameIdAtom, store, storeMoves, updateGame } from '../state';

// mirrors the server state and skips the write when nothing visible changed
export function recordState(id: string, state: RecordedState) {
  storeMoves(id, { moves: state.moves, startFen: cachedMoves(id)?.startFen ?? START_FEN });
  updateGame(id, game =>
    // a resignation or timeout belongs to the app so a late server reply cannot reopen it
    endedByApp(game.termination) ||
    (game.fen === state.fen &&
    game.moveCount === state.moves.length &&
    game.status === state.status &&
    game.result === state.result)
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

// Start over keeps the game and settings and bumps the revision
export function restartGame(id: string) {
  storeMoves(id, emptyMoves());
  updateGame(id, game => ({
    ...newGameSummary(game.id, game.config, game.dayKey, game.createdAt),
    revision: (game.revision ?? 0) + 1,
  }));
}

export function restartSelectedGame() {
  const id = store.get(selectedGameIdAtom);
  if (id) restartGame(id);
}

// the human loses a resign or timeout ending while an AI match takes the given result
function endEarly(id: string, termination: string, watchedResult: string | null, extra: Partial<GameSummary> = {}) {
  updateGame(id, game => {
    if (game.status !== 'active') return game;
    const result = game.config.gameMode === 'human-vs-agent' ? aiWinResult(game.config) : watchedResult;
    return { ...game, ...extra, result, status: 'finished', termination };
  });
}

export function resignSelectedGame() {
  const id = store.get(selectedGameIdAtom);
  if (id) endEarly(id, 'resignation', null);
}

export function timeOutGame(id: string) {
  endEarly(id, 'timeout', '1/2-1/2', { elapsedMs: GAME_TIME_LIMIT_MS });
}

// takes back the human move and any AI reply after it
export function undoSelectedTurn() {
  const id = store.get(selectedGameIdAtom);
  const game = id ? store.get(libraryAtom)?.games[id] : null;
  const history = id ? cachedMoves(id) : null;
  if (!id || !game || !history || game.config.gameMode !== 'human-vs-agent') return false;
  if (endedByApp(game.termination)) return false;

  const human = game.config.humanColor === 'white' ? 'w' : 'b';
  const chess = new Chess(history.startFen);
  const movers = history.moves.map(uci => chess.move(uci).color);
  let cut = movers.length;
  // drops the AI replies and then the human move before them
  while (cut > 0 && movers[cut - 1] !== human) cut -= 1;
  if (cut === 0) return false;
  cut -= 1;

  const moves = history.moves.slice(0, cut);
  const replay = new Chess(history.startFen);
  for (const uci of moves) replay.move(uci);
  storeMoves(id, { moves, startFen: history.startFen });
  updateGame(id, current => ({
    ...current,
    fen: replay.fen(),
    moveCount: moves.length,
    result: null,
    status: 'active',
    termination: null,
    undoCount: (current.undoCount ?? 0) + 1,
  }));
  return true;
}

// the clock counts for games in play and stops at the limit
// a shown hint spends one of the game's hints and an undo gives none back
export function spendHint(id: string) {
  updateGame(id, game => ({ ...game, hintsUsed: (game.hintsUsed ?? 0) + 1 }));
}

export function addElapsed(id: string, ms: number) {
  if (ms <= 0) return;
  updateGame(id, game =>
    game.status === 'active'
      ? { ...game, elapsedMs: Math.min(GAME_TIME_LIMIT_MS, game.elapsedMs + ms) }
      : game,
  );
}
