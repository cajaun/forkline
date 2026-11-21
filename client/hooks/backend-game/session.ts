import {
  createAgentMatch,
  createHumanGame,
  moveFromUci,
  type BackendMove,
  type BackendState,
} from '@/services/chess-api';
import type { GameConfig, GameMoves, GameSummary, RecordedState } from '@/types/games';

export type ActiveSession = {
  gameId: string;
  id: string;
  kind: 'game' | 'match';
  state: BackendState;
};

export type RemoteMove = {
  id: string;
  move: ReturnType<typeof moveFromUci>;
};

export type SyncRequest = {
  id: number;
  fen: string;
};

// unique per session and ply, so the board applies each server move once
export const moveId = (sessionId: string, move: BackendMove) =>
  `${sessionId}:${move.ply}:${move.uci}`;

export const remoteMoveFrom = (sessionId: string, move: BackendMove): RemoteMove => ({
  id: moveId(sessionId, move),
  move: moveFromUci(move.uci),
});

// in AI vs AI every turn belongs to an AI, otherwise the side the human isn't playing
export function isAiTurn(state: BackendState, config: GameConfig) {
  if (state.is_game_over) return false;
  if (config.gameMode === 'agent-vs-agent') return true;
  return state.turn !== config.humanColor;
}

// everything that needs a fresh server session when it changes
export function sessionKey(game: GameSummary | null) {
  if (!game) return null;
  const { agent, depths, gameMode, humanColor } = game.config;
  return [
    game.id,
    game.revision ?? 0,
    gameMode,
    humanColor,
    agent,
    depths['material-mobility'],
    depths['king-safety-position'],
  ].join('|');
}

export function toRecordedState(state: BackendState): RecordedState {
  return {
    fen: state.fen,
    moves: state.moves.map(move => move.uci),
    result: state.result,
    status: state.is_game_over ? 'finished' : 'active',
    termination: state.termination,
  };
}

export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

// replays a saved game on the server as a human game or an AI match
export async function openSession(
  gameId: string,
  config: GameConfig,
  history: GameMoves,
): Promise<ActiveSession> {
  if (config.gameMode === 'agent-vs-agent') {
    const created = await createAgentMatch(config, history);
    return { gameId, id: created.match_id, kind: 'match', state: created };
  }
  const created = await createHumanGame(config, history);
  return { gameId, id: created.game_id, kind: 'game', state: created };
}
