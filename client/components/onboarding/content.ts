import type { SymbolFallback, SymbolName } from '@/components/shared/sf-symbol';
import type { GameConfig } from '@/types/games';

type Feature = {
  description: string;
  fallback: SymbolFallback;
  icon: SymbolName;
  title: string;
};

type PlayOption = {
  config: Pick<GameConfig, 'gameMode' | 'humanColor'>;
  fallback: SymbolFallback;
  icon: SymbolName;
  label: string;
};

export const FEATURES: Feature[] = [
  {
    description: 'Each day gets its own board, kept in your history.',
    fallback: 'calendar-outline',
    icon: 'calendar',
    title: 'A new game every day',
  },
  {
    description: 'One plays for material and activity, one for king safety.',
    fallback: 'hardware-chip-outline',
    icon: 'cpu',
    title: 'Two AI opponents',
  },
  {
    description: 'Pit the two strategies against each other, move by move.',
    fallback: 'people-outline',
    icon: 'person.2',
    title: 'Watch the AIs play',
  },
  {
    description: 'Every game is saved. Tap a date to pick it back up.',
    fallback: 'time-outline',
    icon: 'clock.arrow.circlepath',
    title: 'Pick up where you left off',
  },
];

// you as White, you as Black, or the two AIs against each other
export const PLAY_OPTIONS: PlayOption[] = [
  {
    config: { gameMode: 'human-vs-agent', humanColor: 'white' },
    fallback: 'ellipse-outline',
    icon: 'circle',
    label: 'Play as White',
  },
  {
    config: { gameMode: 'human-vs-agent', humanColor: 'black' },
    fallback: 'ellipse',
    icon: 'circle.fill',
    label: 'Play as Black',
  },
  {
    config: { gameMode: 'agent-vs-agent', humanColor: 'white' },
    fallback: 'hardware-chip-outline',
    icon: 'cpu',
    label: 'Watch AI vs AI',
  },
];

// each setup step is followed by its info step, which the header's ? opens
export const STEPS = ['welcome', 'play', 'info', 'strategy', 'info', 'difficulty', 'info'] as const;
export const LAST_SETUP_STEP = STEPS.lastIndexOf('difficulty');

// how many steps forward the next setup step sits, skipping info steps
export function stepsToNextSetup(index: number) {
  let target = index + 1;
  while (STEPS[target] === 'info') target += 1;
  return target - index;
}
