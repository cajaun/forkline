import { useEffect, useRef } from 'react';
import { Image, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { PIECE_IMG } from '@/constants/chess-pieces';
import { SHEET_BOARD_COLORS } from '@/constants/sheet';
import type { Side } from '@/types/chess';
import { AnimatedView } from '@/components/shared/uniwind';
import { PressableScale } from '@/components/shared/pressable-scale';

const MINI_BOARD_COLUMNS = 8;
const MINI_BOARD_ROWS = 2;
const MINI_BOARD_COLLAPSED_SCALE = 0.14;
const MINI_BOARD_EXPANSION_DURATION = 200;
const MINI_BOARD_RADIUS = 8;
const MINI_BOARD_EXPANDED_GAP_RATIO = 1 / 16;
const MINI_BOARD_COLLAPSED_GAP_RATIO = 1 / 3;
const MINI_BOARD_DOT_COLOR = '#D9D9D9';
const MINI_BOARD_PIECE_DOT_COLORS: Record<Side, string> = {
  b: '#070707',
  w: '#BABABA',
};
const MINI_BOARD_DOT_SIZE_RATIO = 0.1;
export const CAPTURE_AUTO_COLLAPSE_DELAY = 3000;

export type CaptureSide = 'top' | 'bottom';
export type CaptureExpansion = CaptureSide | 'both' | null;

function CaptureMiniBoard({
  expanded,
  foe,
  onPress,
  pieces,
  side,
  size,
}: {
  expanded: boolean;
  foe: Side;
  onPress: () => void;
  pieces: string[];
  side: CaptureSide;
  size: { height: number; width: number };
}) {
  const expansion = useSharedValue(expanded ? 1 : 0);
  const previousExpanded = useRef(expanded);
  const cellSize = size.width / MINI_BOARD_COLUMNS;
  const expandedGap = size.height / 2;
  const collapsedGap = size.height * MINI_BOARD_COLLAPSED_GAP_RATIO;
  const collapsedTravel =
    expandedGap +
    size.height / 2 -
    (collapsedGap + (size.height * MINI_BOARD_COLLAPSED_SCALE) / 2);

  useEffect(() => {
    expansion.value = withTiming(expanded ? 1 : 0, {
      duration: MINI_BOARD_EXPANSION_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    if (expanded !== previousExpanded.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }

    previousExpanded.current = expanded;
  }, [expanded, expansion]);

  const translationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          expansion.value,
          [0, 1],
          [side === 'top' ? collapsedTravel : -collapsedTravel, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          expansion.value,
          [0, 1],
          [MINI_BOARD_COLLAPSED_SCALE, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const dotsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      expansion.value,
      [0, 0.42, 0.85],
      [1, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));
  const dotScaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale:
          1 /
          interpolate(
            expansion.value,
            [0, 1],
            [MINI_BOARD_COLLAPSED_SCALE, 1],
            Extrapolation.CLAMP,
          ),
      },
    ],
  }));
  const piecesStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      expansion.value,
      [0.55, 0.82, 1],
      [0, 0.9, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const cellsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      expansion.value,
      [0.1, 0.4, 0.85],
      [0, 0.7, 1],
      Extrapolation.CLAMP,
    ),
  }));
  return (
    <AnimatedView
      style={[
        {
          alignSelf: 'center',
          height: size.height,
          width: size.width,
        },
        translationStyle,
      ]}>
      <PressableScale
        accessibilityLabel={`${foe === 'w' ? 'top' : 'bottom'} captured pieces`}
        hitSlop={32}
        onPress={onPress}
        style={{
          height: size.height,
          width: size.width,
        }}>
        <AnimatedView
          pointerEvents="none"
          style={[
            {
              borderRadius: MINI_BOARD_RADIUS,
              height: size.height,
              overflow: 'hidden',
              width: size.width,
            },
            scaleStyle,
          ]}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              height: size.height,
              width: size.width,
            }}>
            {Array.from({ length: MINI_BOARD_ROWS * MINI_BOARD_COLUMNS }).map(
              (_, squareIndex) => {
                const piece = pieces[squareIndex];
                const row = Math.floor(squareIndex / MINI_BOARD_COLUMNS);
                const column = squareIndex % MINI_BOARD_COLUMNS;

                return (
                  <View
                    key={`${foe}-capture-square-${squareIndex}`}
                    style={{
                      alignItems: 'center',
                      height: size.height / MINI_BOARD_ROWS,
                      justifyContent: 'center',
                      position: 'relative',
                      width: cellSize,
                    }}>
                    <AnimatedView
                      pointerEvents="none"
                      style={[
                        {
                          backgroundColor:
                            (row + column) % 2 === 0
                              ? SHEET_BOARD_COLORS.white
                              : SHEET_BOARD_COLORS.black,
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
                          backgroundColor: piece
                            ? MINI_BOARD_PIECE_DOT_COLORS[foe]
                            : MINI_BOARD_DOT_COLOR,
                          borderRadius: cellSize * MINI_BOARD_DOT_SIZE_RATIO,
                          height: cellSize * MINI_BOARD_DOT_SIZE_RATIO,
                          position: 'absolute',
                          width: cellSize * MINI_BOARD_DOT_SIZE_RATIO,
                        },
                        dotsStyle,
                        dotScaleStyle,
                      ]}
                    />
                    {piece ? (
                      <AnimatedView pointerEvents="none" style={piecesStyle}>
                        <Image
                          source={PIECE_IMG[foe][piece]}
                          style={{ height: cellSize, width: cellSize }}
                        />
                      </AnimatedView>
                    ) : null}
                  </View>
                );
              },
            )}
          </View>
        </AnimatedView>
      </PressableScale>
    </AnimatedView>
  );
}

export function BoardCaptures({
  boardSize,
  captured,
  closedLeft,
  closedTop,
  expandedSide,
  openLeft,
  openTop,
  onToggleSide,
  open,
  previewSize,
  progress,
}: {
  boardSize: number;
  captured: Record<'b' | 'w', string[]>;
  closedLeft: number;
  closedTop: number;
  expandedSide: CaptureExpansion;
  openLeft: number;
  openTop: number;
  onToggleSide: (side: CaptureSide) => void;
  open: boolean;
  previewSize: number;
  progress: SharedValue<number>;
}) {
  const miniBoardSize = {
    height: boardSize / 8,
    width: boardSize / 2,
  };
  const expandedGap = boardSize * MINI_BOARD_EXPANDED_GAP_RATIO;
  const closedVisualTop = closedTop + (boardSize - previewSize) / 2;

  const topStyle = useAnimatedStyle(() => ({
    left: interpolate(
      progress.value,
      [0, 1],
      [closedLeft, openLeft],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    top: interpolate(
      progress.value,
      [0, 1],
      [
        closedVisualTop - miniBoardSize.height / 2,
        openTop - miniBoardSize.height - expandedGap,
      ],
      Extrapolation.CLAMP,
    ),
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    left: interpolate(
      progress.value,
      [0, 1],
      [closedLeft, openLeft],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    top: interpolate(
      progress.value,
      [0, 1],
      [
        closedVisualTop + previewSize - miniBoardSize.height / 2,
        openTop + boardSize + expandedGap,
      ],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <>
      <AnimatedView
        className="absolute z-1"
        pointerEvents={open ? 'box-none' : 'none'}
        style={[{ height: miniBoardSize.height, width: boardSize }, topStyle]}>
        <CaptureMiniBoard
          expanded={expandedSide === 'top' || expandedSide === 'both'}
          foe="w"
          onPress={() => onToggleSide('top')}
          pieces={captured.b}
          side="top"
          size={miniBoardSize}
        />
      </AnimatedView>
      <AnimatedView
        className="absolute z-1"
        pointerEvents={open ? 'box-none' : 'none'}
        style={[{ height: miniBoardSize.height, width: boardSize }, bottomStyle]}>
        <CaptureMiniBoard
          expanded={expandedSide === 'bottom' || expandedSide === 'both'}
          foe="b"
          onPress={() => onToggleSide('bottom')}
          pieces={captured.w}
          side="bottom"
          size={miniBoardSize}
        />
      </AnimatedView>
    </>
  );
}
