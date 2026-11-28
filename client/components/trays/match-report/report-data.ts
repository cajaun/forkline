import depthTwo from '@/constants/match-report-depth-2.json';
import depthThree from '@/constants/match-report-depth-3.json';
import type { AgentName } from '@/components/trays/settings/types';

type AgentScore = { draws: number; losses: number; points: number; wins: number };
type AgentSearch = { avg_cutoffs: number; avg_nodes: number; moves: number };

export type ReportGame = {
  black_agent: string;
  game_number: number;
  opening: string;
  plies: number;
  result: string;
  termination: string;
  white_agent: string;
};

export type MatchReport = {
  average_plies: number;
  depth: number;
  games: number;
  results: ReportGame[];
  scores: Record<AgentName, AgentScore>;
  search: Record<AgentName, AgentSearch>;
  terminations: Record<string, number>;
};

// the depth 2 and depth 3 matches the harness wrote into the app
export const MATCH_REPORTS: readonly MatchReport[] = [depthTwo, depthThree];

export const drawCount = (report: MatchReport) =>
  report.results.filter(game => game.result === '1/2-1/2').length;
