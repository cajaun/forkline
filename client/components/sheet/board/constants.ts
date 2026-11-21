import { rect } from '@shopify/react-native-skia';
import type { SkRect } from '@shopify/react-native-skia';
import { Easing } from 'react-native-reanimated';
import type { PieceCode } from 'react-native-chessboard/src/state/types';

export type KingDisplayState = 'checkmate' | 'gameOver' | null;

// a square tops out near 156px at 3x, so 192px cells keep pieces sharp without decoding extra pixels
export const SPRITE_CELL_SIZE = 192;

const SPRITE_ORDER = ['p', 'n', 'b', 'r', 'q', 'k'] as const;

// white pieces fill the atlas's first row and black pieces its second
export const SPRITE_RECTS = {} as Record<NonNullable<PieceCode>, SkRect>;
(['w', 'b'] as const).forEach((color, row) =>
  SPRITE_ORDER.forEach((type, column) => {
    SPRITE_RECTS[`${color}${type}`] = rect(
      column * SPRITE_CELL_SIZE,
      row * SPRITE_CELL_SIZE,
      SPRITE_CELL_SIZE,
      SPRITE_CELL_SIZE,
    );
  }),
);

export const MOVE_DOT_RADIUS_SCALE = 0.08;

// pieces fade in late so the preview markers carry the first half of the opening
export const PIECE_REVEAL_OPACITY = [0, 0.2, 0.78, 1] as const;
export const PIECE_REVEAL_OPACITY_VALUES = [0, 0.55, 1, 1] as const;

// pieces grow in from this fraction of their size as the board opens
export const PIECE_REVEAL_START_SCALE = 0.12;

// Skia draws on its own schedule, so the board shows it only once the sheet has settled
export const SKIA_SETTLED_PROGRESS = 0.99;

export const KING_STATE_FADE_OPTIONS = {
  duration: 180,
  easing: Easing.linear,
};

// a check tints the king's square orange and a finished game tints it red
export const KING_COLORS = {
  checkmate: { marker: '#FD8223', square: '#FFE1C1' },
  gameOver: { marker: '#FF3F43', square: '#FEC2C4' },
} as const;
