import { Image } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { PIECE_IMG } from '../../../shared/chess-pieces';
import { AnimatedView } from '../../../shared/uniwind';
import { piecesFromFen } from '../utils';

function PreviewPiece({
  cellSize,
  index,
  piece,
  progress,
  side,
}: {
  cellSize: number;
  index: number;
  piece: string;
  progress: SharedValue<number>;
  side: 'b' | 'w';
}) {
  const row = Math.floor(index / 8);
  const column = index % 8;
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.16, 0.86, 0.94, 1],
      [0, 1, 1, 0, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.16, 0.56, 0.86],
          [0.12, 0.28, 1, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <AnimatedView
      className="absolute items-center justify-center"
      pointerEvents="none"
      style={[{ height: cellSize, left: column * cellSize, top: row * cellSize, width: cellSize }, style]}>
      <Image
        source={PIECE_IMG[side][piece]}
        style={{ height: cellSize * 0.88, width: cellSize * 0.88 }}
      />
    </AnimatedView>
  );
}

export function PreviewPieces({
  boardSize,
  fen,
  progress,
}: {
  boardSize: number;
  fen: string;
  progress: SharedValue<number>;
}) {
  const cellSize = boardSize / 8;
  const pieces = piecesFromFen(fen);

  return (
    <AnimatedView className="absolute inset-0 z-[3]" pointerEvents="none">
      {pieces.map(({ index, piece, side }) => (
        <PreviewPiece
          cellSize={cellSize}
          index={index}
          key={index}
          piece={piece}
          progress={progress}
          side={side}
        />
      ))}
    </AnimatedView>
  );
}
