import type { SettingsInfo } from '@/components/trays/settings/info-content';

import type { MatchReport } from './report-data';

type Info = Pick<SettingsInfo, 'items'>;

// what the standings card and the match itself mean
export function matchInfo(report: MatchReport): Info {
  return {
    items: [
      {
        body: `The two agents played ${report.games} games, each looking ${report.depth} moves ahead. Five openings each started two games, once with each agent as White`,
        title: 'The match',
      },
      { body: 'A win scores 1 point and a draw half a point for each side', title: 'Points' },
      { body: 'Wins, draws and losses in that order', title: 'W-D-L' },
    ],
  };
}

// one explainer per card keyed by the card it sits behind
export const MATCH_CARD_INFO: Record<string, Info> = {
  endings: {
    items: [
      {
        body: 'How many games the match played and how many moves ahead each agent looked',
        title: 'Games and depth',
      },
      { body: 'Games that ended with a king in checkmate', title: 'Checkmates' },
      {
        body: 'Games that ended level, by repetition, stalemate or too little material to mate',
        title: 'Draws',
      },
    ],
  },
  'match-games-card': {
    items: [
      { body: 'The average length of a game, counting both sides', title: 'Avg moves' },
      { body: 'The total moves each agent made across the match', title: 'Mobility and safety moves' },
      { body: 'How many different openings started the games', title: 'Openings' },
    ],
  },
  search: {
    items: [
      { body: 'The positions an agent looked at before each move, on average', title: 'Nodes' },
      {
        body: "The branches Alpha-Beta pruning skipped on each move because they couldn't change the choice, on average",
        title: 'Pruned',
      },
      {
        body: 'More pruning means less work for the same move, so the search runs faster',
        title: 'Why it matters',
      },
    ],
  },
};
