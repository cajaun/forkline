import type {
  AgentName,
  GameMode,
  HumanColor,
} from '@/components/trays/settings/types';

export type GameConfig = {
  gameMode: GameMode;
  humanColor: HumanColor;
  agent: AgentName;
  depths: Record<AgentName, number>;
};

export type GameStatus = 'active' | 'finished';

export type GameSummary = {
  id: string;
  dayKey: string;
  createdAt: number;
  config: GameConfig;
  status: GameStatus;
  result: string | null;
  termination: string | null;
  fen: string;
  moveCount: number;
  elapsedMs: number;
  revision?: number;
  undoCount?: number;
};

export type GameMoves = {
  startFen: string;
  moves: string[];
};

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
