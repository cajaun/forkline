import { rect } from '@shopify/react-native-skia';
import type { SkRect } from '@shopify/react-native-skia';
import { Easing } from 'react-native-reanimated';
import type { PieceCode } from 'react-native-chessboard/src/state/types';

export type KingDisplayState = 'checkmate' | 'gameOver' | null;

export const SPRITE_CELL_SIZE = 192;

const SPRITE_ORDER = ['p', 'n', 'b', 'r', 'q', 'k'] as const;

// white pieces fill the first atlas row and black pieces the second
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

export const PIECE_REVEAL_OPACITY = [0, 0.2, 0.78, 1] as const;
export const PIECE_REVEAL_OPACITY_VALUES = [0, 0.55, 1, 1] as const;

export const PIECE_REVEAL_START_SCALE = 0.12;

// the Skia board shows once the sheet has settled open
export const SKIA_SETTLED_PROGRESS = 0.99;

export const KING_STATE_FADE_OPTIONS = {
  duration: 150,
  easing: Easing.inOut(Easing.quad),
};

// orange marks a check and red marks a finished game
export const KING_COLORS = {
  checkmate: { dot: '#FC6002', marker: '#FD8223', square: '#FFDFC1' },
  gameOver: { dot: '#E5262B', marker: '#FF3F43', square: '#FEC2C4' },
} as const;

export const DARK_KING_COLORS = {
  checkmate: { dot: '#FB6A01', marker: '#FF9A37', square: '#5F3E20' },
  gameOver: { dot: '#FF1902', marker: '#FF4244', square: '#5C2324' },
} as const;

export type KingColors = typeof KING_COLORS | typeof DARK_KING_COLORS;

// the corner dot centre and size as shares of a square
export const KING_DOT = { diameter: 0.082, x: 0.089, y: 0.87 } as const;
