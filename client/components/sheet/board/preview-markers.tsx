import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Path as SvgPath } from 'react-native-svg';

import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { kingCellFromFen, pieceCellsFromFen } from '@/utils/fen';

import { KING_COLORS, type KingDisplayState } from './constants';
import { hexagonPath } from './hexagon';

type SquareColors = { black: string; white: string };

function squareColor(
  index: number,
  colors: SquareColors,
  kingCell: number | null,
  kingDisplayState: KingDisplayState,
) {
  if (index === kingCell && kingDisplayState) return KING_COLORS[kingDisplayState].square;
  const row = Math.floor(index / 8);
  return (row + (index % 8)) % 2 === 0 ? colors.white : colors.black;
}

// the 64 squares change only with board size, colours or the king's state
const BoardSquares = memo(function BoardSquares({
  boardSize,
  colors,
  kingCell,
  kingDisplayState,
}: {
  boardSize: number;
  colors: SquareColors;
  kingCell: number | null;
  kingDisplayState: KingDisplayState;
}) {
  const cell = boardSize / 8;

  return (
    <>
      {Array.from({ length: 64 }, (_, index) => (
        <View
          key={`square-${index}`}
          style={{
            backgroundColor: squareColor(index, colors, kingCell, kingDisplayState),
            height: cell,
            left: (index % 8) * cell,
            position: 'absolute',
            top: Math.floor(index / 8) * cell,
            width: cell,
          }}
        />
      ))}
    </>
  );
});

// joins every marker of one colour into a single path, so one SVG draws the whole board
function buildMarkerPaths(
  fen: string,
  cell: number,
  kingCell: number | null,
  kingDisplayState: KingDisplayState,
) {
  const markerSize = Math.max(6, cell * 0.4);
  const inset = (cell - markerSize) / 2;
  const paths = { black: '', gray: '', king: '' };

  for (const [index, color] of pieceCellsFromFen(fen)) {
    const path = hexagonPath(
      (index % 8) * cell + inset,
      Math.floor(index / 8) * cell + inset,
      markerSize,
    );
    if (index === kingCell && kingDisplayState !== null) paths.king += path;
    else paths[color] += path;
  }

  return paths;
}

// the closed board: squares plus a hexagon marker on each occupied square
export const PreviewMarkers = memo(function PreviewMarkers({
  boardSize,
  colors,
  fen,
  kingDisplayState,
  progress,
}: {
  boardSize: number;
  colors: SquareColors;
  fen: string;
  kingDisplayState: KingDisplayState;
  progress: SharedValue<number>;
}) {
  const { colors: sheetColors } = useSheetColors();
  const cell = boardSize / 8;
  const kingCell = useMemo(() => kingCellFromFen(fen), [fen]);
  const markers = useMemo(
    () => buildMarkerPaths(fen, cell, kingCell, kingDisplayState),
    [cell, fen, kingCell, kingDisplayState],
  );
  const markerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.2, 0.7, 0.96, 1],
      [1, 0.85, 0.35, 0, 0],
      Extrapolation.CLAMP,
    ),
  }));
  // the checked king's marker fades out sooner than the rest
  const kingMarkerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12, 0.2, 1], [1, 0, 0, 0], Extrapolation.CLAMP),
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <BoardSquares
        boardSize={boardSize}
        colors={colors}
        kingCell={kingCell}
        kingDisplayState={kingDisplayState}
      />
      <AnimatedView className="absolute inset-0" pointerEvents="none" style={markerStyle}>
        <Svg height={boardSize} style={StyleSheet.absoluteFill} width={boardSize}>
          <SvgPath d={markers.black} fill={sheetColors.pieceBlack} />
          <SvgPath d={markers.gray} fill={sheetColors.pieceWhite} />
        </Svg>
      </AnimatedView>
      {markers.king && kingDisplayState ? (
        <AnimatedView className="absolute inset-0" pointerEvents="none" style={markerStyle}>
          <AnimatedView className="absolute inset-0" style={kingMarkerStyle}>
            <Svg height={boardSize} style={StyleSheet.absoluteFill} width={boardSize}>
              <SvgPath d={markers.king} fill={KING_COLORS[kingDisplayState].marker} />
            </Svg>
          </AnimatedView>
        </AnimatedView>
      ) : null}
    </View>
  );
});
