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
    description: 'Both AIs look moves ahead with Minimax and use Alpha-Beta pruning to skip lines that lose',
    fallback: 'git-branch-outline',
    icon: 'arrow.triangle.branch',
    title: 'An AI that thinks ahead',
  },
  {
    description: 'One chases material and mobility and the other guards its king and pawn structure',
    fallback: 'hardware-chip-outline',
    icon: 'cpu',
    title: 'Two strategies',
  },
  {
    description: 'Take on either AI yourself or watch the two face off move by move',
    fallback: 'people-outline',
    icon: 'person.2',
    title: 'Play or watch',
  },
  {
    description: 'Each game runs on a 15 minute clock with a hint or an undo when you get stuck',
    fallback: 'timer-outline',
    icon: 'timer',
    title: 'Fifteen minutes a game',
  },
];

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

// info pages sit after each setup page so Continue can skip them
const STEPS = ['welcome', 'play', 'info', 'strategy', 'info', 'difficulty', 'info'] as const;
export const LAST_SETUP_STEP = STEPS.lastIndexOf('difficulty');

// counts the steps from the current page to the next setup page
export function stepsToNextSetup(index: number) {
  let target = index + 1;
  while (STEPS[target] === 'info') target += 1;
  return target - index;
}
