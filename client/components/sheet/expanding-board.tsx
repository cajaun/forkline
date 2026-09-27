import { useCallback, useEffect, useRef, useState } from 'react';

import { Text, useWindowDimensions } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';

import { SHEET_LAYOUT } from '@/constants/sheet';
import { capturedFromFen } from '@/utils/sheet';
import { PressableScale } from '@/components/shared/pressable-scale';
import { AnimatedView } from '@/components/shared/uniwind';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { BoardCaptures } from './board-captures';
import { BoardMeta } from './board-meta';
import { SheetBoard } from './sheet-board';

export function ExpandingBoard({
  boardFen,
  boardSize,
  closedCenterY,
  onOpen,
  open,
  openCenterY,
  previewSize,
  progress,
}: {
  boardFen: string;
  boardSize: number;
  closedCenterY: number;
  onOpen: () => void;
  open: boolean;
  openCenterY: number;
  previewSize: number;
  progress: SharedValue<number>;
}) {
  const { height, width } = useWindowDimensions();
  const closedLeft = width / 2 - SHEET_LAYOUT.sheetGutter - boardSize / 2;
  const openLeft = (width - boardSize) / 2;
  const closedTop = closedCenterY - height * SHEET_LAYOUT.closedTop - boardSize / 2;
  const openTop = openCenterY - boardSize / 2;
  const previewScale = previewSize / boardSize;
  const [captured, setCaptured] = useState(() => capturedFromFen(boardFen));
  const [markerFen, setMarkerFen] = useState(boardFen);
  const [spriteReady, setSpriteReady] = useState(false);
  const pendingOpenRef = useRef(false);
  const handleSpriteReady = useCallback((ready: boolean) => {
    setSpriteReady(ready);
  }, []);
  useEffect(() => {
    // wait for the sprite atlas before starting a pending transition
    if (!spriteReady || !pendingOpenRef.current) return;

    pendingOpenRef.current = false;
    onOpen();
  }, [onOpen, spriteReady]);
  const handleOpen = useCallback(() => {
    if (spriteReady) {
      onOpen();
      return;
    }

    // hold the tap until the board can render its first frame
    pendingOpenRef.current = true;
  }, [onOpen, spriteReady]);
  const handleMove = useCallback((result: MoveResult) => {
    setMarkerFen(result.state.fen);

    const piece = result.move.captured;
    if (!piece) return;

    // store captures under the side that made the move
    const side = result.move.color === 'w' ? 'w' : 'b';
    setCaptured(previous => ({
      ...previous,
      [side]: [...previous[side], piece],
    }));
  }, []);
  const borderWidth = 2;
  const borderRadius = 12;

  const boardStyle = useAnimatedStyle(() => ({
    left: interpolate(progress.value, [0, 1], [closedLeft, openLeft]),
    top: interpolate(progress.value, [0, 1], [closedTop, openTop]),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [previewScale, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const boardClipStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(
      progress.value,
      [0, 1],
      [borderRadius / previewScale, borderRadius],
      Extrapolation.CLAMP,
    ),
  }));
  const playStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 0.45], [0, -25], Extrapolation.CLAMP),
      },
    ],
  }));
  const playOverlayStyle = useAnimatedStyle(() => ({
    // keep the play control outside the scaled board layer
    left: interpolate(
      progress.value,
      [0, 1],
      [closedLeft + (boardSize - previewSize) / 2, openLeft],
    ),
    top: interpolate(
      progress.value,
      [0, 1],
      [closedTop + (boardSize - previewSize) / 2, openTop],
    ),
    height: interpolate(progress.value, [0, 1], [previewSize, boardSize]),
    width: interpolate(progress.value, [0, 1], [previewSize, boardSize]),
  }));
  const borderStyle = useAnimatedStyle(() => ({
    left: interpolate(
      progress.value,
      [0, 1],
      [
        closedLeft + (boardSize - previewSize) / 2 - borderWidth,
        openLeft,
      ],
    ),
    top: interpolate(
      progress.value,
      [0, 1],
      [
        closedTop + (boardSize - previewSize) / 2 - borderWidth,
        openTop,
      ],
    ),
    height: interpolate(
      progress.value,
      [0, 1],
      [previewSize + borderWidth * 2, boardSize],
    ),
    borderWidth,
    borderRadius: interpolate(
      progress.value,
      [0, 1],
      [borderRadius, borderRadius],
    ),
    width: interpolate(
      progress.value,
      [0, 1],
      [previewSize + borderWidth * 2, boardSize],
    ),
  }));

  return (
    <>
      <BoardMeta
        boardSize={boardSize}
        closedLeft={closedLeft}
        closedTop={closedTop}
        openLeft={openLeft}
        openTop={openTop}
        previewSize={previewSize}
        progress={progress}
      />
      <BoardCaptures
        boardSize={boardSize}
        captured={captured}
        closedLeft={closedLeft}
        closedTop={closedTop}
        openLeft={openLeft}
        openTop={openTop}
        previewSize={previewSize}
        progress={progress}
      />
      <AnimatedView
        className="absolute z-2 overflow-hidden rounded-xl"
        pointerEvents="box-none"
        style={[{ height: boardSize, width: boardSize }, boardStyle, boardClipStyle]}>
        <SheetBoard
          boardSize={boardSize}
          fen={boardFen}
          markerFen={markerFen}
          onReady={handleSpriteReady}
          onMove={handleMove}
          open={open}
          progress={progress}
        />
      </AnimatedView>
      <AnimatedView
        className="absolute z-3 items-center justify-center"
        pointerEvents={open ? 'none' : 'box-none'}
        style={playOverlayStyle}>
        <AnimatedView style={playStyle}>
          <PressableScale
            accessibilityLabel="Open chessboard"
            onPress={handleOpen}
            style={{
              alignItems: 'center',
              backgroundColor: '#262626',
              borderRadius: 28,
              flexDirection: 'row',
              gap: 4,
              height: 56,
              justifyContent: 'center',
              width: 110,
            }}>
            <SfSymbol
              fallback="play"
              name="play.fill"
              size={22}
              tintColor="#FEFFFF"
              weight="medium"
            />
            <Text
              className="text-[#FEFFFF]"
              style={{ fontSize: 24, fontWeight: '700' }}>
              Play
            </Text>
          </PressableScale>
        </AnimatedView>
      </AnimatedView>
      <AnimatedView
        className="absolute z-3 rounded-xl"
        pointerEvents="none"
        style={[
          {
            borderColor: '#262626',
            borderCurve: 'continuous',
            height: previewSize + borderWidth * 2,
            width: previewSize + borderWidth * 2,
          },
          borderStyle,
        ]}
      />
    </>
  );
}
