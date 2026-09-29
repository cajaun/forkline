import type { ImageSourcePropType } from 'react-native';

import type { Side } from '@/types/chess';

// map chess piece codes to the board image assets
export const PIECE_IMG: Record<Side, Record<string, ImageSourcePropType>> = {
  w: {
    p: require('../assets/images/chess-pieces/gray/pawn.png'),
    n: require('../assets/images/chess-pieces/gray/knight.png'),
    b: require('../assets/images/chess-pieces/gray/bishop.png'),
    r: require('../assets/images/chess-pieces/gray/rook.png'),
    q: require('../assets/images/chess-pieces/gray/queen.png'),
    k: require('../assets/images/chess-pieces/gray/king.png'),
  },
  b: {
    p: require('../assets/images/chess-pieces/black/pawn.png'),
    n: require('../assets/images/chess-pieces/black/knight.png'),
    b: require('../assets/images/chess-pieces/black/bishop.png'),
    r: require('../assets/images/chess-pieces/black/rook.png'),
    q: require('../assets/images/chess-pieces/black/queen.png'),
    k: require('../assets/images/chess-pieces/black/king.png'),
  },
};

export const PIECE_SPRITE = require('../assets/images/chess-pieces/sprite.png');
export const DARK_PIECE_SPRITE = require('../assets/images/chess-pieces/dark/sprite.png');

export const DARK_PIECE_IMG: Record<Side, Record<string, ImageSourcePropType>> = {
  w: {
    p: require('../assets/images/chess-pieces/dark/gray/pawn.png'),
    n: require('../assets/images/chess-pieces/dark/gray/knight.png'),
    b: require('../assets/images/chess-pieces/dark/gray/bishop.png'),
    r: require('../assets/images/chess-pieces/dark/gray/rook.png'),
    q: require('../assets/images/chess-pieces/dark/gray/queen.png'),
    k: require('../assets/images/chess-pieces/dark/gray/king.png'),
  },
  b: {
    p: require('../assets/images/chess-pieces/dark/black/pawn.png'),
    n: require('../assets/images/chess-pieces/dark/black/knight.png'),
    b: require('../assets/images/chess-pieces/dark/black/bishop.png'),
    r: require('../assets/images/chess-pieces/dark/black/rook.png'),
    q: require('../assets/images/chess-pieces/dark/black/queen.png'),
    k: require('../assets/images/chess-pieces/dark/black/king.png'),
  },
};

export const CHECKMATE_KING_IMG = require(
  '../assets/images/chess-pieces/orange/king.png',
);
export const GAME_OVER_KING_IMG = require(
  '../assets/images/chess-pieces/red/king.png',
);

export const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
