import { Image, Text, View } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { PIECE_IMG, VALUE } from '../../../shared/chess-pieces';
import type { Side } from '../../../shared/chess-types';
import { AnimatedView } from '../../../shared/uniwind';

function CapturePieces({
  foe,
  pieces,
  pieceSize,
}: {
  foe: Side;
  pieces: string[];
  pieceSize: number;
}) {
  const sorted = [...pieces].sort((a, b) => (VALUE[a] ?? 0) - (VALUE[b] ?? 0));
  const overlap = pieceSize * 0.28;
  const value = pieces.reduce((sum, piece) => sum + (VALUE[piece] ?? 0), 0);

  return (
    <View className="flex-row items-center">
      <View className="flex-row items-center">
        {sorted.map((piece, index) => (
          <Image
            key={`${piece}-${index}`}
            source={PIECE_IMG[foe][piece]}
            style={{
              height: pieceSize,
              marginLeft: index > 0 ? -overlap : 0,
              width: pieceSize,
            }}
          />
        ))}
      </View>
      {value > 0 ? (
        <Text
          className="text-[#8f9298]"
          style={{ fontSize: Math.max(9, pieceSize * 0.72), marginLeft: 3 }}>
          +{value}
        </Text>
      ) : null}
    </View>
  );
}

export function BoardCaptures({
  boardSize,
  captured,
  closedLeft,
  closedTop,
  openLeft,
  openTop,
  previewSize,
  progress,
}: {
  boardSize: number;
  captured: Record<'b' | 'w', string[]>;
  closedLeft: number;
  closedTop: number;
  openLeft: number;
  openTop: number;
  previewSize: number;
  progress: SharedValue<number>;
}) {
  const pieceSize = Math.min(22, boardSize / 16);
  const overlap = pieceSize * 0.28;
  const bottomPieceWidth = Math.max(
    pieceSize,
    captured.w.length * pieceSize - Math.max(0, captured.w.length - 1) * overlap,
  );
  const bottomValue = captured.w.reduce((sum, piece) => sum + (VALUE[piece] ?? 0), 0);
  const bottomValueWidth =
    bottomValue > 0
      ? pieceSize * (0.45 * `+${bottomValue}`.length) + 3
      : 0;
  const bottomWidth = bottomPieceWidth + bottomValueWidth;
  const bottomRightInset = 4;
  const closedVisualLeft = closedLeft + (boardSize - previewSize) / 2;
  const closedVisualTop = closedTop + (boardSize - previewSize) / 2;
  const topStyle = useAnimatedStyle(() => ({
    left: interpolate(
      progress.value,
      [0, 1],
      [closedVisualLeft, openLeft],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    top: interpolate(
      progress.value,
      [0, 1],
      [closedVisualTop - pieceSize / 2, openTop - pieceSize - 12],
      Extrapolation.CLAMP,
    ),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.72, 1]) }],
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    left: interpolate(
      progress.value,
      [0, 1],
      [
        closedVisualLeft + previewSize - bottomWidth - bottomRightInset,
        openLeft + boardSize - bottomWidth - bottomRightInset,
      ],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    top: interpolate(
      progress.value,
      [0, 1],
      [closedVisualTop + previewSize - pieceSize / 2, openTop + boardSize + 8],
      Extrapolation.CLAMP,
    ),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.72, 1]) }],
  }));

  return (
    <>
      <AnimatedView
        className="absolute z-1"
        pointerEvents="none"
        style={topStyle}>
        <CapturePieces foe="w" pieces={captured.b} pieceSize={pieceSize} />
      </AnimatedView>
      <AnimatedView
        className="absolute z-1"
        pointerEvents="none"
        style={bottomStyle}>
        <CapturePieces foe="b" pieces={captured.w} pieceSize={pieceSize} />
      </AnimatedView>
    </>
  );
}
