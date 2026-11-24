import { memo, useEffect, useMemo, useRef } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import * as Haptics from '@/services/haptics';
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { AnimatedStyle, SharedValue } from 'react-native-reanimated';

import { PressableScale } from '@/components/shared/pressable-scale';
import { AnimatedView } from '@/components/shared/uniwind';
import type { PIECE_IMG } from '@/constants/chess-pieces';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { Side } from '@/types/chess';

export type CaptureSide = 'top' | 'bottom';

const COLUMNS = 8;
const ROWS = 2;
const COLLAPSED_SCALE = 0.14;
const EXPANSION_DURATION = 200;
const RADIUS = 8;
const COLLAPSED_GAP_RATIO = 1 / 3;
const DOT_SIZE_RATIO = 0.1;

// fades a layer across part of the expansion
const fade = (expansion: SharedValue<number>, input: number[], output: number[]) => {
  'worklet';
  return interpolate(expansion.value, input, output, Extrapolation.CLAMP);
};

type LayerStyle = StyleProp<AnimatedStyle<ViewStyle>>;

type SquareProps = {
  boardColors: { black: string; white: string };
  cellSize: number;
  cellsStyle: LayerStyle;
  dotColor: string;
  dotStyles: LayerStyle[];
  emptyDotColor: string;
  foe: Side;
  height: number;
  index: number;
  piece: string | undefined;
  pieceImages: typeof PIECE_IMG;
  piecesStyle: LayerStyle;
};

// the animated styles keep one identity per board so a square only redraws when its piece or size changes
function sameSquare(previous: SquareProps, next: SquareProps) {
  return (
    previous.piece === next.piece &&
    previous.index === next.index &&
    previous.cellSize === next.cellSize &&
    previous.height === next.height &&
    previous.foe === next.foe &&
    previous.dotColor === next.dotColor &&
    previous.emptyDotColor === next.emptyDotColor &&
    previous.boardColors === next.boardColors &&
    previous.pieceImages === next.pieceImages
  );
}

const MiniSquare = memo(function MiniSquare({
  boardColors,
  cellSize,
  cellsStyle,
  dotColor,
  dotStyles,
  emptyDotColor,
  foe,
  height,
  index,
  piece,
  pieceImages,
  piecesStyle,
}: SquareProps) {
  const row = Math.floor(index / COLUMNS);
  const dotSize = cellSize * DOT_SIZE_RATIO;

  return (
    <View style={{ alignItems: 'center', height, justifyContent: 'center', width: cellSize }}>
      <AnimatedView
        pointerEvents="none"
        style={[
          {
            backgroundColor: (row + (index % COLUMNS)) % 2 === 0 ? boardColors.white : boardColors.black,
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          },
          cellsStyle,
        ]}
      />
      <AnimatedView
        pointerEvents="none"
        style={[
          {
            backgroundColor: piece ? dotColor : emptyDotColor,
            borderRadius: dotSize,
            height: dotSize,
            position: 'absolute',
            width: dotSize,
          },
          ...dotStyles,
        ]}
      />
      {piece ? (
        <AnimatedView pointerEvents="none" style={piecesStyle}>
          <Image source={pieceImages[foe][piece]} style={{ height: cellSize, width: cellSize }} />
        </AnimatedView>
      ) : null}
    </View>
  );
}, sameSquare);

// a two row board of captured pieces that collapses into a dot strip
export const CaptureMiniBoard = memo(function CaptureMiniBoard({
  boardColors,
  expanded,
  foe,
  onToggle,
  pieceImages,
  pieces,
  side,
  size,
}: {
  boardColors: { black: string; white: string };
  expanded: boolean;
  foe: Side;
  onToggle: (side: CaptureSide) => void;
  pieceImages: typeof PIECE_IMG;
  pieces: string[];
  side: CaptureSide;
  size: { height: number; width: number };
}) {
  const { colors } = useSheetColors();
  const expansion = useSharedValue(expanded ? 1 : 0);
  const previousExpanded = useRef(expanded);
  const cellSize = size.width / COLUMNS;
  const collapsedGap = size.height * COLLAPSED_GAP_RATIO;
  const collapsedTravel = size.height - (collapsedGap + (size.height * COLLAPSED_SCALE) / 2);

  useEffect(() => {
    expansion.set(
      withTiming(expanded ? 1 : 0, {
        duration: EXPANSION_DURATION,
        easing: Easing.out(Easing.cubic),
      }),
    );
    if (expanded !== previousExpanded.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    previousExpanded.current = expanded;
  }, [expanded, expansion]);

  const translationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: fade(expansion, [0, 1], [side === 'top' ? collapsedTravel : -collapsedTravel, 0]),
      },
    ],
  }));
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fade(expansion, [0, 1], [COLLAPSED_SCALE, 1]) }],
  }));
  const dotsStyle = useAnimatedStyle(() => ({
    opacity: fade(expansion, [0, 0.42, 0.85], [1, 1, 0]),
  }));
  const dotScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 / fade(expansion, [0, 1], [COLLAPSED_SCALE, 1]) }],
  }));
  const piecesStyle = useAnimatedStyle(() => ({
    opacity: fade(expansion, [0.55, 0.82, 1], [0, 0.9, 1]),
  }));
  const cellsStyle = useAnimatedStyle(() => ({
    opacity: fade(expansion, [0.1, 0.4, 0.85], [0, 0.7, 1]),
  }));
  const dotStyles = useMemo(() => [dotsStyle, dotScaleStyle], [dotScaleStyle, dotsStyle]);

  return (
    <AnimatedView style={[{ alignSelf: 'center', height: size.height, width: size.width }, translationStyle]}>
      <PressableScale
        accessibilityLabel={`${foe === 'w' ? 'top' : 'bottom'} captured pieces`}
        hitSlop={32}
        onPress={() => onToggle(side)}
        style={{ height: size.height, width: size.width }}
      >
        <AnimatedView
          pointerEvents="none"
          style={[
            { borderRadius: RADIUS, height: size.height, overflow: 'hidden', width: size.width },
            scaleStyle,
          ]}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', height: size.height, width: size.width }}>
            {Array.from({ length: ROWS * COLUMNS }, (_, index) => (
              <MiniSquare
                key={`${foe}-capture-square-${index}`}
                boardColors={boardColors}
                cellSize={cellSize}
                cellsStyle={cellsStyle}
                dotColor={foe === 'b' ? colors.pieceBlack : colors.pieceWhite}
                dotStyles={dotStyles}
                emptyDotColor={colors.captureEmptyDot}
                foe={foe}
                height={size.height / ROWS}
                index={index}
                piece={pieces[index]}
                pieceImages={pieceImages}
                piecesStyle={piecesStyle}
              />
            ))}
          </View>
        </AnimatedView>
      </PressableScale>
    </AnimatedView>
  );
});
