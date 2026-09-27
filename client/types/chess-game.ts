export type { Side } from '@/types/chess';

export type Quality =
  | 'brilliant'
  | 'great'
  | 'book'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'miss'
  | 'blunder';

export type AnnotatedMove = { san: string; quality: Quality };

export type ShowOpts = {
  x: number;
  y: number;
  subtitle: string;
  oppName: string;
  accuracy: { you: number; opp: number };
  moves: AnnotatedMove[];
  onReplay: () => void;
  onBack: () => void;
};
