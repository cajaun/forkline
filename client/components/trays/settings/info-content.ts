import type { SymbolFallback, SymbolName } from '@/components/shared/sf-symbol';


export type SettingsInfoKey =
  | 'appearance'
  | 'difficulty'
  | 'game'
  | 'game-mode'
  | 'match'
  | 'play-as'
  | 'strategy';

export type SettingsInfo = {
  fallback: SymbolFallback;
  icon: SymbolName;
  items: { body: string; title: string }[];
  subtitle: string;
  title: string;
};

// what each settings screen controls, with strategy text that mirrors server/chess/evaluation.py
export const SETTINGS_INFO: Record<SettingsInfoKey, SettingsInfo> = {
  appearance: {
    fallback: 'color-palette-outline',
    icon: 'paintpalette.fill',
    items: [
      { body: 'Follows your device, switching between light and dark with it.', title: 'System' },
      { body: 'Always use the light or the dark theme, whatever the device uses.', title: 'Light and Dark' },
    ],
    subtitle: 'How Forkline looks.',
    title: 'Appearance',
  },
  difficulty: {
    fallback: 'speedometer-outline',
    icon: 'gauge.with.dots.needle.67percent',
    items: [
      {
        body: 'How many moves ahead the AI looks before it chooses. It searches with Minimax and skips lines that cannot change its choice (Alpha-Beta pruning).',
        title: 'Search depth',
      },
      {
        body: 'Each level adds a full set of replies to consider. Depth 1 only weighs its own move; depth 3 and up plays much stronger chess but takes longer to think.',
        title: 'Stronger takes longer',
      },
      {
        body: 'Each AI has its own depth, so you can give one strategy an edge when they play each other.',
        title: 'Set per AI',
      },
    ],
    subtitle: 'How far ahead each AI thinks.',
    title: 'Difficulty',
  },
  game: {
    fallback: 'game-controller-outline',
    icon: 'gamecontroller.fill',
    items: [
      { body: 'Play an AI yourself, or watch the two AIs play each other.', title: 'Game mode' },
      { body: 'White moves first. Only used when you are playing.', title: 'Play as' },
      { body: 'Which of the two AI personalities you face.', title: 'AI strategy' },
    ],
    subtitle: 'Who plays, and against what.',
    title: 'Game',
  },
  'game-mode': {
    fallback: 'people-outline',
    icon: 'person.2.fill',
    items: [
      { body: 'You play one side against the AI strategy you choose.', title: 'Human vs AI' },
      { body: 'The two strategies play each other live; the one you pick plays White.', title: 'AI vs AI' },
      {
        body: 'Once a game has moves, changing the mode starts a new game with your new settings. The old game stays in your history.',
        title: 'During a game',
      },
    ],
    subtitle: 'Play, or watch the AIs play.',
    title: 'Game mode',
  },
  match: {
    fallback: 'stats-chart-outline',
    icon: 'chart.bar.fill',
    items: [
      { body: 'How many games the two AIs play in one match.', title: 'Games per match' },
      {
        body: 'Swaps which AI plays White each game, so moving first does not decide the score.',
        title: 'Alternate colors',
      },
    ],
    subtitle: 'Running a series between the two AIs.',
    title: 'Match',
  },
  'play-as': {
    fallback: 'ellipse-outline',
    icon: 'circle.lefthalf.filled',
    items: [
      { body: 'You move first and the AI answers.', title: 'White' },
      { body: 'The AI opens and you reply.', title: 'Black' },
      {
        body: 'Once a game has moves, switching color starts a new game. The old game stays in your history.',
        title: 'During a game',
      },
    ],
    subtitle: 'Which side you play.',
    title: 'Play as',
  },
  strategy: {
    fallback: 'hardware-chip-outline',
    icon: 'cpu.fill',
    items: [
      {
        body: 'Counts material, then adds points for every extra legal move it has over you and for pieces on the four centre squares. It plays actively and goes after loose pieces.',
        title: 'Material + Mobility',
      },
      {
        body: 'Counts the same material, then values a pawn shield in front of its king, avoids doubled and isolated pawns, and rewards advanced pawns and developed knights and bishops. It plays solid, positional chess.',
        title: 'King Safety + Position',
      },
    ],
    subtitle: 'Two ways an AI can judge a position.',
    title: 'AI strategy',
  },
};
