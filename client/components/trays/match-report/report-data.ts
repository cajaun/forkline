import report from '@/constants/match-report.json';
import type { AgentName } from '@/components/trays/settings/types';

// the depth 2 match report the harness wrote into the app
export const MATCH_REPORT = report;

export type ReportGame = (typeof report.results)[number];

const TERMINATION_LABELS: Record<string, string> = {
  checkmate: 'Checkmate',
  'fifty-moves': 'Fifty-move rule',
  'fivefold-repetition': 'Repetition',
  'insufficient-material': 'Insufficient material',
  'maximum-plies': 'Move limit',
  'seventyfive-moves': 'Seventy-five-move rule',
  stalemate: 'Stalemate',
  'threefold-repetition': 'Repetition',
};

const SHORT_AGENT_LABELS: Record<AgentName, string> = {
  'king-safety-position': 'King safety',
  'material-mobility': 'Mobility',
};

const shortAgentLabel = (name: string) => SHORT_AGENT_LABELS[name as AgentName] ?? name;

const terminationLabel = (termination: string) => TERMINATION_LABELS[termination] ?? termination;

export function gameOutcome(game: ReportGame) {
  const moves = `${game.plies} moves`;
  if (game.result === '1-0') return `${shortAgentLabel(game.white_agent)} won · ${moves}`;
  if (game.result === '0-1') return `${shortAgentLabel(game.black_agent)} won · ${moves}`;
  return `Draw · ${moves}`;
}

// groups endings by label since several python chess terminations read the same
export function endingCounts() {
  const counts: Record<string, number> = {};
  for (const [termination, count] of Object.entries(MATCH_REPORT.terminations)) {
    const label = terminationLabel(termination);
    counts[label] = (counts[label] ?? 0) + count;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}
