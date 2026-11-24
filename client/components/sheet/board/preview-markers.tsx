import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Path as SvgPath } from 'react-native-svg';

import { AnimatedView } from '@/components/shared/uniwind';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { kingCellFromFen, pieceCellsFromFen } from '@/utils/fen';

import type { KingColors, KingDisplayState } from './constants';
import { hexagonPath } from './hexagon';

type SquareColors = { black: string; white: string };

function squareColor(
  index: number,
  colors: SquareColors,
  kingCell: number | null,
  kingDisplayState: KingDisplayState,
  kingColors: KingColors,
) {
  if (index === kingCell && kingDisplayState) return kingColors[kingDisplayState].square;
  const row = Math.floor(index / 8);
  return (row + (index % 8)) % 2 === 0 ? colors.white : colors.black;
}

const BoardSquares = memo(function BoardSquares({
  boardSize,
  colors,
  kingCell,
  kingColors,
  kingDisplayState,
}: {
  boardSize: number;
  colors: SquareColors;
  kingCell: number | null;
  kingColors: KingColors;
  kingDisplayState: KingDisplayState;
}) {
  const cell = boardSize / 8;

  return (
    <>
      {Array.from({ length: 64 }, (_, index) => (
        <View
          key={`square-${index}`}
          style={{
            backgroundColor: squareColor(index, colors, kingCell, kingDisplayState, kingColors),
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

// joins the markers of one colour into one path so a single SVG draws the board
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

// the closed board draws squares with a hexagon on each occupied square
export const PreviewMarkers = memo(function PreviewMarkers({
  boardSize,
  colors,
  fen,
  kingDisplayState,
  kingSide = null,
  progress,
}: {
  boardSize: number;
  colors: SquareColors;
  fen: string;
  kingDisplayState: KingDisplayState;
  kingSide?: 'w' | 'b' | null;
  progress: SharedValue<number>;
}) {
  const { colors: sheetColors, kingColors } = useSheetColors();
  const cell = boardSize / 8;
  const kingCell = useMemo(() => kingCellFromFen(fen, kingSide), [fen, kingSide]);
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

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <BoardSquares
        boardSize={boardSize}
        colors={colors}
        kingCell={kingCell}
        kingColors={kingColors}
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
          <Svg height={boardSize} style={StyleSheet.absoluteFill} width={boardSize}>
            <SvgPath d={markers.king} fill={kingColors[kingDisplayState].marker} />
          </Svg>
        </AnimatedView>
      ) : null}
    </View>
  );
});
