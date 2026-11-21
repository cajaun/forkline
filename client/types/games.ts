import type {
  AgentName,
  GameMode,
  HumanColor,
} from '@/components/trays/settings/types';

// everything that decides how one game is played
export type GameConfig = {
  gameMode: GameMode;
  humanColor: HumanColor;
  agent: AgentName;
  depths: Record<AgentName, number>;
};

export type GameStatus = 'active' | 'finished';

// the per-game record kept in the index, enough for the strip, card and preview without move lists
export type GameSummary = {
  id: string;
  // local calendar day the game belongs to, YYYY-MM-DD
  dayKey: string;
  createdAt: number;
  config: GameConfig;
  status: GameStatus;
  result: string | null;
  termination: string | null;
  fen: string;
  moveCount: number;
  elapsedMs: number;
  // bumped by "Start over" so the server session is rebuilt from scratch
  revision?: number;
};

// the full move history, stored separately per game
export type GameMoves = {
  startFen: string;
  moves: string[];
};

// the server's view of a game, mirrored into the library after every response
export type RecordedState = {
  fen: string;
  moves: string[];
  result: string | null;
  status: GameStatus;
  termination: string | null;
};

export type GameLibrary = {
  version: 1;
  onboardingComplete: boolean;
  defaults: GameConfig;
  games: Record<string, GameSummary>;
};
