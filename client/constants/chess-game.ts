import { theme, withAlpha } from '@/constants/theme';
import { players } from '@/constants/players';

import type { AnnotatedMove, Side } from '@/types/chess-game';
import type { Square } from 'chess.js';

export const START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const PLAYERS: Record<Side, { name: string; rating: string }> = players;

export const CLOCK_START: Record<Side, number> = { w: 180, b: 180 };

export {
  CHECKMATE_KING_IMG,
  GAME_OVER_KING_IMG,
  PIECE_IMG,
  VALUE,
} from '@/constants/chess-pieces';

export const BOARD_COLORS = {
  white: theme.boardLight,
  black: theme.boardDark,
  lastMoveHighlight: withAlpha(theme.accent, 0.4),
  checkmateHighlight: theme.lose,
};

export const REPLAY = {
  START_DELAY: 300,
  MOVE_GAP: 260,
  PAUSE_POLL: 120,
  AURA_DELAY: 580,
} as const;

export const FOOLS_MATE: [Square, Square][] = [
  ['f2', 'f3'],
  ['e7', 'e5'],
  ['g2', 'g4'],
  ['d8', 'h4'],
];

export const REVIEW_MOVES: AnnotatedMove[] = [
  { san: 'f3', quality: 'mistake' },
  { san: 'e5', quality: 'best' },
  { san: 'g4', quality: 'blunder' },
  { san: 'Qh4#', quality: 'brilliant' },
];

export const REVIEW_ACCURACY = { you: 11.2, opp: 100 };
