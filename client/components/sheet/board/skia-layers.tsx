import { Atlas, Image as SkiaImage, Path, Rect, Skia, rect } from '@shopify/react-native-skia';
import type { SkImage, SkRect, SkRSXform } from '@shopify/react-native-skia';
import type { Square } from 'chess.js';
import { useDerivedValue, withTiming } from 'react-native-reanimated';
import type { useBoardConfig, useBoardStateValues } from 'react-native-chessboard/src/state';
import type { PieceCode } from 'react-native-chessboard/src/state/types';
import { SQUARES } from 'react-native-chessboard/src/state/types';
import { squareToPosition } from 'react-native-chessboard/src/state/use-board-state';

import {
  KING_COLORS,
  KING_STATE_FADE_OPTIONS,
  MOVE_DOT_RADIUS_SCALE,
  SPRITE_CELL_SIZE,
  SPRITE_RECTS,
  type KingDisplayState,
} from './constants';

type BoardState = ReturnType<typeof useBoardStateValues>;
type BoardConfig = ReturnType<typeof useBoardConfig>;

const EMPTY_RECT = rect(0, 0, 0, 0);

// occupied squares in draw order, so a dragged piece (higher zIndex) paints on top
function orderedPieces(squares: BoardState['squares']) {
  'worklet';
  const pieces: { piece: NonNullable<PieceCode>; square: Square; zIndex: number }[] = [];
  for (const square of SQUARES) {
    const piece = squares[square].piece.get();
    if (piece) pieces.push({ piece, square, zIndex: squares[square].zIndex.get() });
  }
  return pieces.sort((a, b) => a.zIndex - b.zIndex);
}

// true when the square under check still holds a king
function kingInCheck(boardState: BoardState) {
  'worklet';
  const square = boardState.kingInCheckSquare.get();
  const piece = square ? boardState.squares[square].piece.get() : null;
  return piece === 'wk' || piece === 'bk';
}

// fades a king layer in while `show` holds for a checked king
function useKingFade(boardState: BoardState, show: boolean) {
  return useDerivedValue(() =>
    withTiming(kingInCheck(boardState) && show ? 1 : 0, KING_STATE_FADE_OPTIONS),
  );
}

export function MoveDots({ boardState, config }: { boardState: BoardState; config: BoardConfig }) {
  const radius = config.pieceSize * MOVE_DOT_RADIUS_SCALE;
  const half = config.pieceSize / 2;
  // one path with a circle per legal target square
  const path = useDerivedValue(() => {
    const nextPath = Skia.Path.Make();
    for (const move of boardState.validMoves.get()) {
      const position = squareToPosition(move, config.pieceSize, config.flipped);
      nextPath.addCircle(position.x + half, position.y + half, radius);
    }
    return nextPath;
  });

  return <Path color="rgba(0, 0, 0, 0.3)" opacity={0.5} path={path} />;
}

// every piece in one Atlas draw, placed from the board's per-square shared values
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
      // scale about the square's centre, so a lifted piece grows in place
      const centerX = state.translateX.get() + boardSize / 16;
      const centerY = state.translateY.get() + boardSize / 16;
      const scaledHalf = (SPRITE_CELL_SIZE / 2) * scale;
      return Skia.RSXform(scale, 0, centerX - scaledHalf, centerY - scaledHalf);
    }),
  );

  // the atlas has to load before any piece can draw
  if (!spriteImage) return null;

  return <Atlas image={spriteImage} sprites={sprites} transforms={transforms} />;
}

// tints the checked king's square and swaps in the orange or red king
export function SpecialKingLayer({
  boardState,
  checkmateImage,
  config,
  gameOverImage,
  kingDisplayState,
}: {
  boardState: BoardState;
  checkmateImage: SkImage | null;
  config: BoardConfig;
  gameOverImage: SkImage | null;
  kingDisplayState: KingDisplayState;
}) {
  const kingRect = useDerivedValue(() => {
    const square = boardState.kingInCheckSquare.get();
    if (!square) return EMPTY_RECT;
    const position = squareToPosition(square, config.pieceSize, config.flipped);
    return rect(position.x, position.y, config.pieceSize, config.pieceSize);
  });
  const squareOpacity = useKingFade(boardState, kingDisplayState !== null);
  const checkmateOpacity = useKingFade(boardState, kingDisplayState === 'checkmate');
  const gameOverOpacity = useKingFade(boardState, kingDisplayState === 'gameOver');
  const squareColor = KING_COLORS[kingDisplayState ?? 'checkmate'].square;

  return (
    <>
      <Rect color={squareColor} opacity={squareOpacity} rect={kingRect} />
      <SkiaImage fit="contain" image={checkmateImage} opacity={checkmateOpacity} rect={kingRect} />
      <SkiaImage fit="contain" image={gameOverImage} opacity={gameOverOpacity} rect={kingRect} />
    </>
  );
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
    if (!square) return EMPTY_RECT;
    const position = squareToPosition(square, config.pieceSize, config.flipped);
    return rect(position.x, position.y, config.pieceSize, config.pieceSize);
  });
  const opacity = useDerivedValue(() => (boardState.selectedSquare.get() ? 1 : 0));

  return <Rect color={config.colors.lastMoveHighlight} opacity={opacity} rect={selectedRect} />;
}
