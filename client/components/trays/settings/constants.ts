import type {
  AgentName,
  Category,
  GameMode,
  HumanColor,
  ThemeMode,
} from './types';
import { SfSymbol } from '@/components/shared/sf-symbol';

type SymbolName = Parameters<typeof SfSymbol>[0]['name'];
type SymbolFallback = Parameters<typeof SfSymbol>[0]['fallback'];

export const AGENT_LABELS: Record<AgentName, string> = {
  'material-mobility': 'Material + Mobility',
  'king-safety-position': 'King Safety + Position',
};

export const CATEGORY_TITLES: Record<Category, string> = {
  game: 'Game',
  gameplay: 'Gameplay',
  match: 'Match',
  appearance: 'Appearance',
};

export const SETTINGS_STEP_INDEX = {
  settings: 0,
  game: 1,
  gameMode: 2,
  playAs: 3,
  aiStrategy: 4,
  gameplay: 5,
  match: 6,
  appearance: 7,
} as const;

export const CATEGORY_STEP_INDEX: Record<Category, number> = {
  appearance: SETTINGS_STEP_INDEX.appearance,
  game: SETTINGS_STEP_INDEX.game,
  gameplay: SETTINGS_STEP_INDEX.gameplay,
  match: SETTINGS_STEP_INDEX.match,
};

export const CATEGORY_OPTIONS = [
  {
    fallback: 'game-controller-outline',
    icon: 'gamecontroller',
    key: 'game',
    title: 'Game',
  },
  {
    fallback: 'play-circle-outline',
    icon: 'play.circle',
    key: 'gameplay',
    title: 'Gameplay',
  },
  {
    fallback: 'stats-chart-outline',
    icon: 'chart.bar',
    key: 'match',
    title: 'Match',
  },
  {
    fallback: 'color-palette-outline',
    icon: 'paintpalette',
    key: 'appearance',
    title: 'Appearance',
  },
] as const satisfies readonly {
  fallback: SymbolFallback;
  icon: SymbolName;
  key: Category;
  title: string;
}[];

export const GAME_MODE_OPTIONS = [
  { label: 'Human vs AI', value: 'human-vs-agent' },
  { label: 'AI vs AI', value: 'agent-vs-agent' },
] as const satisfies readonly {
  label: string;
  value: GameMode;
}[];

export const HUMAN_COLOR_OPTIONS = [
  { label: 'Play as White', value: 'white' },
  { label: 'Play as Black', value: 'black' },
] as const satisfies readonly {
  label: string;
  value: HumanColor;
}[];

export const AGENT_OPTIONS = [
  {
    label: AGENT_LABELS['material-mobility'],
    value: 'material-mobility',
  },
  {
    label: AGENT_LABELS['king-safety-position'],
    value: 'king-safety-position',
  },
] as const satisfies readonly {
  label: string;
  value: AgentName;
}[];

export const THEME_OPTIONS = [
  {
    fallback: 'phone-portrait-outline',
    icon: 'iphone',
    label: 'System',
    value: 'system',
  },
  {
    fallback: 'sunny-outline',
    icon: 'sun.max',
    label: 'Light',
    value: 'light',
  },
  {
    fallback: 'moon-outline',
    icon: 'moon',
    label: 'Dark',
    value: 'dark',
  },
] as const satisfies readonly {
  fallback: SymbolFallback;
  icon: SymbolName;
  label: string;
  value: ThemeMode;
}[];
