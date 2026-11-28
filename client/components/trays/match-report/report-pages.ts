import type { StatPage } from '@/components/trays/shared/stats/stat-card';

import { drawCount, type MatchReport } from './report-data';

type Agent = keyof MatchReport['scores'];

const MOBILITY: Agent = 'material-mobility';
const KING_SAFETY: Agent = 'king-safety-position';

const points = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

const record = (report: MatchReport, agent: Agent) => {
  const { draws, losses, wins } = report.scores[agent];
  return `${wins}-${draws}-${losses}`;
};

// the standings and search cards of the match report
export function matchReportPages(report: MatchReport): StatPage[] {
  return [
    {
      cells: [
        {
          fallback: 'trophy',
          icon: 'trophy.fill',
          label: 'Mobility',
          value: points(report.scores[MOBILITY].points),
        },
        {
          fallback: 'shield',
          icon: 'shield.fill',
          label: 'King safety',
          value: points(report.scores[KING_SAFETY].points),
        },
        { fallback: 'list', icon: 'list.number', label: 'Mobility W-D-L', value: record(report, MOBILITY) },
        { fallback: 'list', icon: 'list.number', label: 'Safety W-D-L', value: record(report, KING_SAFETY) },
      ],
      fallback: 'podium-outline',
      icon: 'medal',
      key: 'standings',
      title: 'Standings',
    },
    {
      cells: [
        {
          fallback: 'git-network',
          icon: 'point.3.connected.trianglepath.dotted',
          label: 'Mobility nodes',
          value: String(Math.round(report.search[MOBILITY].avg_nodes)),
        },
        {
          fallback: 'git-network',
          icon: 'point.3.connected.trianglepath.dotted',
          label: 'Safety nodes',
          value: String(Math.round(report.search[KING_SAFETY].avg_nodes)),
        },
        {
          fallback: 'cut',
          icon: 'scissors',
          label: 'Mobility pruned',
          value: String(Math.round(report.search[MOBILITY].avg_cutoffs)),
        },
        {
          fallback: 'cut',
          icon: 'scissors',
          label: 'Safety pruned',
          value: String(Math.round(report.search[KING_SAFETY].avg_cutoffs)),
        },
      ],
      fallback: 'git-network-outline',
      icon: 'point.3.connected.trianglepath.dotted',
      key: 'search',
      title: 'Search',
    },
    {
      cells: [
        { fallback: 'grid', icon: 'square.grid.2x2.fill', label: 'Games', value: String(report.games) },
        {
          fallback: 'layers',
          icon: 'square.stack.3d.up.fill',
          label: 'Depth',
          value: String(report.depth),
        },
        {
          fallback: 'flag',
          icon: 'flag.checkered',
          label: 'Checkmates',
          value: String(report.terminations.checkmate ?? 0),
        },
        {
          fallback: 'remove-circle-outline',
          icon: 'equal',
          label: 'Draws',
          value: String(drawCount(report)),
        },
      ],
      fallback: 'flag-outline',
      icon: 'flag.checkered',
      key: 'endings',
      title: 'Endings',
    },
    {
      cells: [
        {
          fallback: 'swap-vertical',
          icon: 'arrow.up.arrow.down',
          label: 'Avg moves',
          value: String(report.average_plies),
        },
        {
          fallback: 'move',
          icon: 'arrow.left.arrow.right',
          label: 'Mobility moves',
          value: String(report.search[MOBILITY].moves),
        },
        {
          fallback: 'move',
          icon: 'arrow.left.arrow.right',
          label: 'Safety moves',
          value: String(report.search[KING_SAFETY].moves),
        },
        {
          fallback: 'book',
          icon: 'book.fill',
          label: 'Openings',
          value: String(new Set(report.results.map(game => game.opening)).size),
        },
      ],
      fallback: 'list-outline',
      icon: 'list.number',
      key: 'match-games-card',
      title: 'Games',
    },
  ];
}
