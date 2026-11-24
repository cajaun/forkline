import type { StatPage } from '@/components/trays/shared/stats/stat-card';

import { MATCH_REPORT, endingCounts } from './report-data';

type Agent = keyof typeof MATCH_REPORT.scores;

const MOBILITY: Agent = 'material-mobility';
const KING_SAFETY: Agent = 'king-safety-position';

const points = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

const record = (agent: Agent) => {
  const { draws, losses, wins } = MATCH_REPORT.scores[agent];
  return `${wins}-${draws}-${losses}`;
};

const ending = (index: number) => endingCounts()[index] ?? ['–', 0];

// the standings and search cards of the match report
export function matchReportPages(): StatPage[] {
  const [firstEnding, firstCount] = ending(0);
  const [secondEnding, secondCount] = ending(1);

  return [
    {
      cells: [
        { fallback: 'trophy', icon: 'trophy.fill', label: 'Mobility', value: points(MATCH_REPORT.scores[MOBILITY].points) },
        { fallback: 'shield', icon: 'shield.fill', label: 'King safety', value: points(MATCH_REPORT.scores[KING_SAFETY].points) },
        { fallback: 'list', icon: 'list.number', label: 'Mobility W-D-L', value: record(MOBILITY) },
        { fallback: 'list', icon: 'list.number', label: 'Safety W-D-L', value: record(KING_SAFETY) },
      ],
      fallback: 'podium-outline',
      icon: 'medal',
      key: 'standings',
      title: 'Standings',
    },
    {
      cells: [
        { fallback: 'git-network', icon: 'point.3.connected.trianglepath.dotted', label: 'Mobility nodes', value: String(Math.round(MATCH_REPORT.search[MOBILITY].avg_nodes)) },
        { fallback: 'git-network', icon: 'point.3.connected.trianglepath.dotted', label: 'Safety nodes', value: String(Math.round(MATCH_REPORT.search[KING_SAFETY].avg_nodes)) },
        { fallback: 'cut', icon: 'scissors', label: 'Mobility pruned', value: String(Math.round(MATCH_REPORT.search[MOBILITY].avg_cutoffs)) },
        { fallback: 'cut', icon: 'scissors', label: 'Safety pruned', value: String(Math.round(MATCH_REPORT.search[KING_SAFETY].avg_cutoffs)) },
      ],
      fallback: 'git-network-outline',
      icon: 'point.3.connected.trianglepath.dotted',
      key: 'search',
      title: 'Search',
    },
    {
      cells: [
        { fallback: 'grid', icon: 'square.grid.2x2.fill', label: 'Games', value: String(MATCH_REPORT.games) },
        { fallback: 'layers', icon: 'square.stack.3d.up.fill', label: 'Depth', value: String(MATCH_REPORT.depth) },
        { fallback: 'flag', icon: 'flag.checkered', label: firstEnding, value: String(firstCount) },
        { fallback: 'repeat', icon: 'repeat', label: secondEnding, value: String(secondCount) },
      ],
      fallback: 'flag-outline',
      icon: 'flag.checkered',
      key: 'endings',
      title: 'Endings',
    },
    {
      cells: [
        { fallback: 'swap-vertical', icon: 'arrow.up.arrow.down', label: 'Avg moves', value: String(MATCH_REPORT.average_plies) },
        { fallback: 'move', icon: 'arrow.left.arrow.right', label: 'Mobility moves', value: String(MATCH_REPORT.search[MOBILITY].moves) },
        { fallback: 'move', icon: 'arrow.left.arrow.right', label: 'Safety moves', value: String(MATCH_REPORT.search[KING_SAFETY].moves) },
        { fallback: 'book', icon: 'book.fill', label: 'Openings', value: String(new Set(MATCH_REPORT.results.map(game => game.opening)).size) },
      ],
      fallback: 'list-outline',
      icon: 'list.number',
      key: 'match-games-card',
      title: 'Games',
    },
  ];
}
