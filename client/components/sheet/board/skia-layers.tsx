import { Atlas, Path, Rect, Skia, rect } from '@shopify/react-native-skia';
import type { SkImage, SkRect, SkRSXform } from '@shopify/react-native-skia';
import type { Square } from 'chess.js';
import { useDerivedValue } from 'react-native-reanimated';
import type { PieceCode } from 'react-native-chessboard/src/state/types';
import { SQUARES } from 'react-native-chessboard/src/state/types';
import { squareToPosition } from 'react-native-chessboard/src/state/use-board-state';

import { MOVE_DOT_RADIUS_SCALE, SPRITE_CELL_SIZE, SPRITE_RECTS } from './constants';
import type { BoardConfig, BoardState } from './board-types';

// a raised piece draws last so a dragged piece paints on top
function orderedPieces(squares: BoardState['squares']) {
  'worklet';
  const pieces: { piece: NonNullable<PieceCode>; square: Square; zIndex: number }[] = [];
  for (const square of SQUARES) {
    const piece = squares[square].piece.get();
    if (piece) pieces.push({ piece, square, zIndex: squares[square].zIndex.get() });
  }
  return pieces.sort((a, b) => a.zIndex - b.zIndex);
}

// one path with a circle on each legal target square
export function MoveDots({
  boardState,
  config,
  isDark,
}: {
  boardState: BoardState;
  config: BoardConfig;
  isDark: boolean;
}) {
  const radius = config.pieceSize * MOVE_DOT_RADIUS_SCALE;
  const half = config.pieceSize / 2;
  const path = useDerivedValue(() => {
    const nextPath = Skia.Path.Make();
    for (const move of boardState.validMoves.get()) {
      const position = squareToPosition(move, config.pieceSize, config.flipped);
      nextPath.addCircle(position.x + half, position.y + half, radius);
    }
    return nextPath;
  });

  return <Path color={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'} path={path} />;
}

// the pieces draw in one atlas call placed from the per square shared values
export function PieceAtlas({
  boardSize,
  boardState,
  spriteImage,
}: {
  boardSize: number;
  boardState: BoardState;
  spriteImage: SkImage | null;
}) {
  const pieceScale = boardSize / 8 / SPRITE_CELL_SIZE;
  const sprites = useDerivedValue<SkRect[]>(() =>
    orderedPieces(boardState.squares).map(({ piece }) => SPRITE_RECTS[piece]),
  );
  const transforms = useDerivedValue<SkRSXform[]>(() =>
    orderedPieces(boardState.squares).map(({ square }) => {
      const state = boardState.squares[square];
      const scale = state.scale.get() * pieceScale;
      const centerX = state.translateX.get() + boardSize / 16;
      const centerY = state.translateY.get() + boardSize / 16;
      const scaledHalf = (SPRITE_CELL_SIZE / 2) * scale;
      return Skia.RSXform(scale, 0, centerX - scaledHalf, centerY - scaledHalf);
    }),
  );

  if (!spriteImage) return null;

  return <Atlas image={spriteImage} sprites={sprites} transforms={transforms} />;
}

export function SelectedSquareHighlight({
  boardState,
  config,
}: {
  boardState: BoardState;
  config: BoardConfig;
}) {
  const selectedRect = useDerivedValue(() => {
    const square = boardState.selectedSquare.get();
    if (!square) return rect(0, 0, 0, 0);
    const position = squareToPosition(square, config.pieceSize, config.flipped);
    return rect(position.x, position.y, config.pieceSize, config.pieceSize);
  });
  const opacity = useDerivedValue(() => (boardState.selectedSquare.get() ? 1 : 0));

  return <Rect color={config.colors.lastMoveHighlight} opacity={opacity} rect={selectedRect} />;
}
