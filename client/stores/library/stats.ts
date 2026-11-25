import { useMemo } from 'react';

import { useAtomValue } from 'jotai';

import type { GameSummary } from '@/types/games';
import { capturedFromFen } from '@/utils/fen';

import { libraryAtom } from './state';

export type PlayerStats = {
  captures: number;
  checkmates: number;
  completedShare: number | null;
  draws: number;
  losses: number;
  longestGame: number;
  movesPlayed: number;
  piecesLost: number;
  restarts: number;
  started: number;
  timeAverageMs: number | null;
  timeFastestWinMs: number | null;
  timePerMoveMs: number | null;
  timeTotalMs: number;
  winShare: number | null;
  won: number;
};

function humanMoves(game: GameSummary) {
  return game.config.humanColor === 'white' ? Math.ceil(game.moveCount / 2) : Math.floor(game.moveCount / 2);
}

function humanOutcome(game: GameSummary): 'won' | 'lost' | 'drawn' | null {
  if (game.status !== 'finished') return null;
  if (game.result === '1/2-1/2') return 'drawn';
  return (game.result === '1-0') === (game.config.humanColor === 'white') ? 'won' : 'lost';
}

const share = (part: number, whole: number) => (whole ? part / whole : null);

function computePlayerStats(allGames: GameSummary[]): PlayerStats {
  const games = allGames.filter(game => game.config.gameMode === 'human-vs-agent' && game.moveCount > 0);
  const finished = games.filter(game => game.status === 'finished');
  const won = finished.filter(game => humanOutcome(game) === 'won');
  const movesPlayed = games.reduce((total, game) => total + humanMoves(game), 0);
  const timeTotalMs = games.reduce((total, game) => total + game.elapsedMs, 0);

  let captures = 0;
  let piecesLost = 0;
  for (const game of games) {
    const captured = capturedFromFen(game.fen);
    const mine = game.config.humanColor === 'white' ? 'w' : 'b';
    captures += captured[mine].length;
    piecesLost += captured[mine === 'w' ? 'b' : 'w'].length;
  }

  return {
    captures,
    checkmates: won.filter(game => game.termination === 'checkmate').length,
    completedShare: share(finished.length, games.length),
    draws: finished.filter(game => humanOutcome(game) === 'drawn').length,
    losses: finished.filter(game => humanOutcome(game) === 'lost').length,
    longestGame: games.reduce((longest, game) => Math.max(longest, game.moveCount), 0),
    movesPlayed,
    piecesLost,
    restarts: games.reduce((total, game) => total + (game.revision ?? 0), 0),
    started: games.length,
    timeAverageMs: finished.length
      ? finished.reduce((total, game) => total + game.elapsedMs, 0) / finished.length
      : null,
    timeFastestWinMs: won.length ? Math.min(...won.map(game => game.elapsedMs)) : null,
    timePerMoveMs: movesPlayed ? timeTotalMs / movesPlayed : null,
    timeTotalMs,
    winShare: share(won.length, finished.length),
    won: won.length,
  };
}

// player stats cover games against the AI with at least one move
export function usePlayerStats() {
  const library = useAtomValue(libraryAtom);
  return useMemo(() => computePlayerStats(Object.values(library?.games ?? {})), [library]);
}
