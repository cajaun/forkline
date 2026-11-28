import type { SettingsInfo } from '@/components/trays/settings/info-content';
import type { StatPage } from '@/components/trays/shared/stats/stat-card';

type AgentPage = StatPage & { info: Pick<SettingsInfo, 'items'> };

const MATERIAL = {
  fallback: 'barbell-outline',
  icon: 'scalemass.fill',
  label: 'Material',
  value: '100–900',
} as const;

// each agent shows the four numbers behind its evaluation and explains them one step further in
export const AGENT_PAGES: AgentPage[] = [
  {
    cells: [
      MATERIAL,
      {
        fallback: 'move',
        icon: 'arrow.up.and.down.and.arrow.left.and.right',
        label: 'Mobility',
        value: '7 / move',
      },
      { fallback: 'locate-outline', icon: 'scope', label: 'Centre', value: '4 squares' },
      { fallback: 'swap-horizontal', icon: 'arrow.left.arrow.right', label: 'Castling', value: '15 / right' },
    ],
    fallback: 'flash-outline',
    icon: 'bolt',
    info: {
      items: [
        {
          body: 'Plays for activity and brings its pieces to the squares with the most moves',
          title: 'Strategy',
        },
        { body: '7 points for each legal move it has beyond the opponent', title: 'Mobility' },
        {
          body: 'Extra points for pieces on the four centre squares and for each castling right kept',
          title: 'Centre and castling',
        },
      ],
    },
    key: 'material-mobility',
    title: 'Material + Mobility',
  },
  {
    cells: [
      MATERIAL,
      { fallback: 'shield', icon: 'shield.fill', label: 'Shelter', value: '18 / pawn' },
      { fallback: 'warning', icon: 'exclamationmark.triangle.fill', label: 'In check', value: '−45' },
      { fallback: 'apps', icon: 'square.grid.3x3.fill', label: 'Squares', value: '6 tables' },
    ],
    fallback: 'shield-outline',
    icon: 'shield',
    info: {
      items: [
        { body: 'Plays for structure and keeps pawns in front of its king', title: 'Strategy' },
        { body: '18 points for each pawn sheltering its king and 45 off when in check', title: 'Shelter' },
        { body: 'A score for the square each piece stands on, from six standard tables', title: 'Squares' },
      ],
    },
    key: 'king-safety-position',
    title: 'King Safety + Position',
  },
];
