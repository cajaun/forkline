import { Chess } from 'chess.js';

import type { GameConfig, GameMoves, GameStatus, GameSummary } from '@/types/games';
import { dayKeyFromDate } from '@/utils/days';

import { newGameId, newGameSummary, START_FEN } from './state';

const SAMPLE_PLAN = [3, 1, 0, 2, 0, 1];
const FOOLS_MATE = ['f2f3', 'e7e5', 'g2g4', 'd8h4'];

const CONFIG_VARIANTS: Partial<GameConfig>[] = [
  {},
  { agent: 'king-safety-position', humanColor: 'black' },
  { gameMode: 'agent-vs-agent' },
];

function outcome(chess: Chess) {
  if (!chess.isGameOver()) {
    return { result: null, status: 'active' as GameStatus, termination: null };
  }
  if (chess.isCheckmate()) {
    return {
      result: chess.turn() === 'w' ? '0-1' : '1-0',
      status: 'finished' as GameStatus,
      termination: 'checkmate',
    };
  }
  return {
    result: '1/2-1/2',
    status: 'finished' as GameStatus,
    termination: chess.isStalemate() ? 'stalemate' : 'draw',
  };
}

function sampleGame(dayIndex: number, gameIndex: number) {
  const chess = new Chess();
  const scripted = dayIndex === 0 && gameIndex === 0 ? FOOLS_MATE : null;
  const plies = scripted ? scripted.length : 8 + Math.floor(Math.random() * 30);
  const moves: string[] = [];

  for (let ply = 0; ply < plies && !chess.isGameOver(); ply += 1) {
    const uci = scripted?.[ply];
    const legal = chess.moves({ verbose: true });
    const move = uci
      ? chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4) })
      : chess.move(legal[Math.floor(Math.random() * legal.length)]);
    moves.push(move.from + move.to + (move.promotion ?? ''));
  }

  return { fen: chess.fen(), moves, ...outcome(chess) };
}

// a dev helper that fills the past week with saved games
export function buildSampleHistory(defaults: GameConfig) {
  const games: Record<string, GameSummary> = {};
  const moves: Record<string, GameMoves> = {};

  SAMPLE_PLAN.forEach((count, dayIndex) => {
    const day = new Date();
    day.setDate(day.getDate() - (dayIndex + 1));

    for (let gameIndex = 0; gameIndex < count; gameIndex += 1) {
      const id = newGameId();
      const game = sampleGame(dayIndex, gameIndex);
      const createdAt = new Date(day);
      createdAt.setHours(9 + gameIndex * 3, 15, 0, 0);
      const config = {
        ...defaults,
        ...CONFIG_VARIANTS[(gameIndex + dayIndex) % CONFIG_VARIANTS.length],
      };

      moves[id] = { moves: game.moves, startFen: START_FEN };
      games[id] = {
        ...newGameSummary(id, config, dayKeyFromDate(day), createdAt.getTime()),
        elapsedMs: (30 + Math.floor(Math.random() * 900)) * 1000,
        fen: game.fen,
        moveCount: game.moves.length,
        result: game.result,
        status: game.status,
        termination: game.termination,
      };
    }
  });

  return { games, moves };
}
