import type { StatPage } from '@/components/trays/shared/stats/stat-card';
import type { PlayerStats } from '@/stores/library/stats';

import { clock, duration, perMove, percent } from './stats-format';

export const PLAYER_CARDS = [
  { fallback: 'trophy-outline', icon: 'trophy', key: 'games', title: 'Games' },
  { fallback: 'stopwatch-outline', icon: 'stopwatch', key: 'speed', title: 'Speed' },
  { fallback: 'grid-outline', icon: 'square.grid.3x3', key: 'board', title: 'Board' },
  { fallback: 'options-outline', icon: 'slider.horizontal.3', key: 'advanced', title: 'Advanced' },
] as const satisfies readonly Omit<StatPage, 'cells'>[];

export function playerStatPages(stats: PlayerStats): StatPage[] {
  return [
    {
      cells: [
        { fallback: 'play', icon: 'play.fill', label: 'Started', value: String(stats.started) },
        { fallback: 'trophy', icon: 'trophy.fill', label: 'Won', value: String(stats.won) },
        { fallback: 'flag', icon: 'flag.checkered', label: 'Checkmates', value: String(stats.checkmates) },
        {
          fallback: 'checkmark-circle',
          icon: 'checkmark.circle.fill',
          label: 'Completed',
          value: percent(stats.completedShare),
        },
      ],
      ...PLAYER_CARDS[0],
    },
    {
      cells: [
        { fallback: 'flash', icon: 'hare.fill', label: 'Fastest win', value: clock(stats.timeFastestWinMs) },
        {
          fallback: 'speedometer',
          icon: 'gauge.with.dots.needle.50percent',
          label: 'Average',
          value: clock(stats.timeAverageMs),
        },
        { fallback: 'time', icon: 'clock.fill', label: 'Total', value: duration(stats.timeTotalMs) },
        {
          fallback: 'stopwatch',
          icon: 'stopwatch.fill',
          label: 'Per move',
          value: perMove(stats.timePerMoveMs),
        },
      ],
      ...PLAYER_CARDS[1],
    },
    {
      cells: [
        {
          fallback: 'move',
          icon: 'arrow.up.and.down.and.arrow.left.and.right',
          label: 'Moves',
          value: String(stats.movesPlayed),
        },
        { fallback: 'stats-chart', icon: 'percent', label: 'Win rate', value: percent(stats.winShare) },
        { fallback: 'locate', icon: 'scope', label: 'Captures', value: String(stats.captures) },
        {
          fallback: 'remove-circle',
          icon: 'minus.circle.fill',
          label: 'Pieces lost',
          value: String(stats.piecesLost),
        },
      ],
      ...PLAYER_CARDS[2],
    },
    {
      cells: [
        {
          fallback: 'refresh',
          icon: 'arrow.counterclockwise',
          label: 'Restarts',
          value: String(stats.restarts),
        },
        { fallback: 'resize', icon: 'ruler.fill', label: 'Longest', value: String(stats.longestGame) },
        { fallback: 'reorder-two', icon: 'equal.circle.fill', label: 'Draws', value: String(stats.draws) },
        { fallback: 'close-circle', icon: 'xmark.circle.fill', label: 'Losses', value: String(stats.losses) },
      ],
      ...PLAYER_CARDS[3],
    },
  ];
}
