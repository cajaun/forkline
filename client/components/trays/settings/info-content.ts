import type { SymbolFallback, SymbolName } from '@/components/shared/sf-symbol';

export type SettingsInfoKey =
  'appearance' | 'difficulty' | 'game' | 'game-mode' | 'haptics' | 'play-as' | 'strategy';

export type SettingsInfo = {
  fallback: SymbolFallback;
  icon: SymbolName;
  items: { body: string; title: string }[];
  title: string;
};

export const SETTINGS_INFO: Record<SettingsInfoKey, SettingsInfo> = {
  appearance: {
    fallback: 'color-palette-outline',
    icon: 'paintpalette.fill',
    items: [
      { body: 'Forkline follows your device and switches between light and dark with it', title: 'System' },
      { body: 'You keep one theme whatever your device uses', title: 'Light and Dark' },
    ],
    title: 'Appearance',
  },
  difficulty: {
    fallback: 'speedometer-outline',
    icon: 'gauge.with.dots.needle.67percent',
    items: [
      {
        body: "The AI looks this many moves ahead with Minimax and skips lines that can't change its choice (Alpha-Beta pruning)",
        title: 'Search depth',
      },
      {
        body: 'Depth 1 weighs its own move alone, while depth 3 and up plays stronger chess and takes longer to think',
        title: 'Stronger takes longer',
      },
      {
        body: 'You set a depth for each AI, so you can give one strategy an edge when they play each other',
        title: 'Set per AI',
      },
    ],
    title: 'Difficulty',
  },
  game: {
    fallback: 'game-controller-outline',
    icon: 'gamecontroller.fill',
    items: [
      { body: 'You play an AI yourself or watch the two AIs play each other', title: 'Game mode' },
      { body: 'You pick your side when you play, and White moves first', title: 'Play as' },
      { body: 'You pick which of the two AI personalities you face', title: 'AI strategy' },
    ],
    title: 'Game',
  },
  'game-mode': {
    fallback: 'people-outline',
    icon: 'person.2.fill',
    items: [
      { body: 'You play one side against the AI strategy you choose', title: 'Human vs AI' },
      {
        body: 'The two strategies play each other live, and the one you pick plays White',
        title: 'AI vs AI',
      },
      {
        body: 'Changing the mode mid-game starts a new game and keeps the old one in your history',
        title: 'During a game',
      },
    ],
    title: 'Game mode',
  },
  haptics: {
    fallback: 'pulse-outline',
    icon: 'iphone.radiowaves.left.and.right',
    items: [
      { body: 'Your phone taps back when you move a piece or pick a game or open a tray', title: 'Taps' },
      { body: 'Turn them off and Forkline stays still while everything else works the same', title: 'Off' },
    ],
    title: 'Haptics',
  },
  'play-as': {
    fallback: 'ellipse-outline',
    icon: 'circle.lefthalf.filled',
    items: [
      { body: 'You move first and the AI answers', title: 'White' },
      { body: 'The AI opens and you reply', title: 'Black' },
      {
        body: 'Switching colour mid-game starts a new game and keeps the old one in your history',
        title: 'During a game',
      },
    ],
    title: 'Play as',
  },
  strategy: {
    fallback: 'hardware-chip-outline',
    icon: 'cpu.fill',
    items: [
      {
        body: 'It counts material and adds points for each extra legal move it has over you and for pieces on the four centre squares, so it plays active chess and hunts loose pieces',
        title: 'Material + Mobility',
      },
      {
        body: 'It counts the same material, then rewards a pawn shield in front of its king, healthy pawns and developed knights and bishops, so it plays solid positional chess',
        title: 'King Safety + Position',
      },
    ],
    title: 'AI strategy',
  },
};
