import { Platform } from 'react-native';

import type { PieceSymbol, Square } from 'chess.js';

import type {
  AgentName,
  GameSettings,
  GameplaySettings,
} from '@/components/trays/settings/types';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const CHESS_API_URL =
  configuredApiUrl ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');

export type BackendMove = {
  ply: number;
  color: 'white' | 'black';
  player: string;
  san: string;
  uci: string;
  fen: string;
};

export type BackendState = {
  fen: string;
  turn: 'white' | 'black';
  legal_moves: string[];
  is_game_over: boolean;
  result: string | null;
  termination: string | null;
  mode: 'human-vs-agent' | 'agent-vs-agent';
  players: Record<'white' | 'black', string>;
  human_color: 'white' | 'black' | null;
  depth: number | null;
  depths?: Record<'white' | 'black', number | null>;
  moves: BackendMove[];
};

export type BackendGameResponse = BackendState & {
  game_id: string;
};

export type BackendMatchResponse = BackendState & {
  match_id: string;
};

export type BackendMoveResponse = BackendState & {
  move: BackendMove;
  search?: {
    score: number;
    nodes: number;
    cutoffs: number;
    transposition_hits: number;
  };
  game_id?: string;
  match_id?: string;
};

type ApiErrorPayload = { detail?: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${CHESS_API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new Error(
      `Could not reach the chess server at ${CHESS_API_URL}. Start the FastAPI server or set EXPO_PUBLIC_API_URL.`,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiErrorPayload
    | null;
  if (!response.ok) {
    const detail =
      payload && typeof payload === 'object' && 'detail' in payload
        ? payload.detail
        : undefined;
    throw new Error(detail || `Chess server returned ${response.status}.`);
  }

  return payload as T;
}

export function opponentAgent(agent: AgentName): AgentName {
  return agent === 'material-mobility'
    ? 'king-safety-position'
    : 'material-mobility';
}

export function moveFromUci(uci: string): {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
} {
  return {
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    ...(uci.length === 5 ? { promotion: uci[4] as PieceSymbol } : {}),
  };
}

export async function createHumanGame(
  game: GameSettings,
  gameplay: GameplaySettings,
  fen: string,
): Promise<BackendGameResponse> {
  return request<BackendGameResponse>('/games', {
    body: JSON.stringify({
      agent: game.agent,
      depth: gameplay.depths[game.agent],
      fen,
      human_color: game.humanColor,
    }),
    method: 'POST',
  });
}

export async function createAgentMatch(
  game: GameSettings,
  gameplay: GameplaySettings,
  fen: string,
): Promise<BackendMatchResponse> {
  const opposingAgent = opponentAgent(game.agent);
  return request<BackendMatchResponse>('/matches/sessions', {
    body: JSON.stringify({
      black_agent: opposingAgent,
      black_depth: gameplay.depths[opposingAgent],
      fen,
      white_agent: game.agent,
      white_depth: gameplay.depths[game.agent],
    }),
    method: 'POST',
  });
}

export async function submitHumanMove(
  gameId: string,
  uci: string,
): Promise<BackendMoveResponse> {
  return request<BackendMoveResponse>(`/games/${gameId}/moves`, {
    body: JSON.stringify({ uci }),
    method: 'POST',
  });
}

export async function requestHumanGameAiMove(
  gameId: string,
): Promise<BackendMoveResponse> {
  return request<BackendMoveResponse>(`/games/${gameId}/ai-move`, {
    method: 'POST',
  });
}

export async function requestMatchAiMove(
  matchId: string,
): Promise<BackendMoveResponse> {
  return request<BackendMoveResponse>(`/matches/sessions/${matchId}/step`, {
    method: 'POST',
  });
}
