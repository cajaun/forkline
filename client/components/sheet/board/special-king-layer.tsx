import { Circle, Image as SkiaImage, Rect, rect } from '@shopify/react-native-skia';
import type { SkImage } from '@shopify/react-native-skia';
import type { Square } from 'chess.js';
import { useAnimatedReaction, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { PieceCode } from 'react-native-chessboard/src/state/types';
import { SQUARES } from 'react-native-chessboard/src/state/types';
import { squareToPosition } from 'react-native-chessboard/src/state/use-board-state';

import { KING_DOT, KING_STATE_FADE_OPTIONS, type KingColors } from './constants';
import type { BoardConfig, BoardState } from './board-types';

// a moving piece counts as landed within this share of a square from its target
const LANDED_DISTANCE = 0.08;

// the spring settles long after the piece looks landed so distance decides instead
function moveInFlight(boardState: BoardState, size: number, flipped: boolean) {
  'worklet';
  const lastMove = boardState.lastMove.get();
  if (!lastMove) return false;
  const moving = boardState.squares[lastMove.from];
  if (moving.zIndex.get() === 0) return false;
  const target = squareToPosition(lastMove.to, size, flipped);
  const near = size * LANDED_DISTANCE;
  return (
    Math.abs(moving.translateX.get() - target.x) > near || Math.abs(moving.translateY.get() - target.y) > near
  );
}

// 0 means no check and 1 a check and 2 a checkmate
function kingTone(boardState: BoardState, mated: SharedValue<boolean>) {
  'worklet';
  const square = boardState.kingInCheckSquare.get();
  const piece = square ? boardState.squares[square].piece.get() : null;
  if (piece !== 'wk' && piece !== 'bk') return 0;
  return mated.get() ? 2 : 1;
}

// a resigned king may stand outside check so the layer finds it by piece
function kingSquareOf(boardState: BoardState, code: NonNullable<PieceCode>) {
  'worklet';
  for (const at of SQUARES) {
    if (boardState.squares[at].piece.get() === code) return at;
  }
  return null;
}

const RESIGNED = 3;

// the lowest alpha Skia still draws so the effect stays invisible when idle
// drawing it every frame compiles its GPU shaders up front so a first check never stalls
const IDLE_OPACITY = 0.004;

// tints the king square and swaps in the coloured king once the attacking move lands
export function SpecialKingLayer({
  boardState,
  checkmateImage,
  config,
  gameOverImage,
  kingColors,
  mated,
  resigned,
}: {
  boardState: BoardState;
  checkmateImage: SkImage | null;
  config: BoardConfig;
  gameOverImage: SkImage | null;
  kingColors: KingColors;
  mated: SharedValue<boolean>;
  resigned: SharedValue<'w' | 'b' | null>;
}) {
  const size = config.pieceSize;
  const checkFade = useSharedValue(0);
  const mateFade = useSharedValue(0);
  const square = useSharedValue<Square | null>(null);
  const kingCode = useSharedValue<NonNullable<PieceCode> | null>(null);
  const applied = useSharedValue(0);

  // the square rides along with the tone so a switch between two ended games moves the tint too
  useAnimatedReaction(
    () => {
      const side = resigned.get();
      if (side) return { at: kingSquareOf(boardState, `${side}k` as NonNullable<PieceCode>), tone: RESIGNED };
      const tone = kingTone(boardState, mated);
      const at = boardState.kingInCheckSquare.get();
      return { at, tone: tone > 0 && moveInFlight(boardState, size, config.flipped) ? -1 : tone };
    },
    (next, previous) => {
      const { tone } = next;
      if (tone < 0) return;
      if (tone === applied.get() && next.at === previous?.at) return;
      // leaving a resignation pins the square so the red fades out in place
      const previousCode = kingCode.get();
      if (applied.get() === RESIGNED && tone !== RESIGNED && previousCode) {
        square.set(kingSquareOf(boardState, previousCode));
      }
      applied.set(tone);
      const side = resigned.get();
      if (tone === RESIGNED && side) {
        square.set(next.at);
        kingCode.set(`${side}k` as NonNullable<PieceCode>);
      } else if (tone > 0 && next.at) {
        square.set(next.at);
        kingCode.set(boardState.squares[next.at].piece.get());
      }
      checkFade.set(withTiming(tone === 1 ? 1 : 0, KING_STATE_FADE_OPTIONS));
      mateFade.set(withTiming(tone >= 2 ? 1 : 0, KING_STATE_FADE_OPTIONS));
    },
  );

  const checkOpacity = useDerivedValue(() => Math.max(checkFade.get(), IDLE_OPACITY));
  const mateOpacity = useDerivedValue(() => Math.max(mateFade.get(), IDLE_OPACITY));

  // a resigned king square follows the king while a game switch moves the pieces
  const squareRect = useDerivedValue(() => {
    const code = kingCode.get();
    const at = applied.get() === RESIGNED && code ? kingSquareOf(boardState, code) : square.get();
    if (!at) return rect(0, 0, size, size);
    const position = squareToPosition(at, size, config.flipped);
    return rect(position.x, position.y, size, size);
  });

  const kingRect = useDerivedValue(() => {
    const code = kingCode.get();
    if (!code || checkFade.get() + mateFade.get() === 0) return rect(0, 0, size, size);
    for (const at of SQUARES) {
      const state = boardState.squares[at];
      if (state.piece.get() !== code) continue;
      const scaled = size * state.scale.get();
      const inset = (size - scaled) / 2;
      return rect(state.translateX.get() + inset, state.translateY.get() + inset, scaled, scaled);
    }
    return rect(0, 0, size, size);
  });

  const dotCenter = useDerivedValue(() => {
    const box = squareRect.get();
    return { x: box.x + size * KING_DOT.x, y: box.y + size * KING_DOT.y };
  });
  const dotRadius = (size * KING_DOT.diameter) / 2;

  return (
    <>
      <Rect color={kingColors.checkmate.square} opacity={checkOpacity} rect={squareRect} />
      <Rect color={kingColors.gameOver.square} opacity={mateOpacity} rect={squareRect} />
      <Circle c={dotCenter} color={kingColors.checkmate.dot} opacity={checkOpacity} r={dotRadius} />
      <Circle c={dotCenter} color={kingColors.gameOver.dot} opacity={mateOpacity} r={dotRadius} />
      <SkiaImage fit="contain" image={checkmateImage} opacity={checkOpacity} rect={kingRect} />
      <SkiaImage fit="contain" image={gameOverImage} opacity={mateOpacity} rect={kingRect} />
    </>
  );
}
