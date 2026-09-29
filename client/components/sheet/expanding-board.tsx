import { useCallback, useEffect, useRef, useState } from 'react';

import { PixelRatio, Text, useWindowDimensions } from 'react-native';

import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';

import { SHEET_LAYOUT } from '@/constants/sheet';
import { capturedFromFen } from '@/utils/sheet';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { PressableScale } from '@/components/shared/pressable-scale';
import { AnimatedView } from '@/components/shared/uniwind';
import { SfSymbol } from '@/components/shared/sf-symbol';
import {
  BoardCaptures,
  CAPTURE_AUTO_COLLAPSE_DELAY,
  type CaptureExpansion,
  type CaptureSide,
} from './board-captures';
import { SheetBoard, type KingDisplayState } from './sheet-board';

import type { RemoteMove, SyncRequest } from '@/hooks/use-backend-game';
import type { ChessboardRef } from 'react-native-chessboard';

const DEVICE_PIXEL_RATIO = PixelRatio.get();

export function ExpandingBoard({
  boardRef,
  boardFen,
  boardSize,
  closedCenterY,
  onOpen,
  open,
  openCenterY,
  previewSize,
  progress,
  boardInputEnabled = true,
  onRemoteMoveApplied,
  onUserMove,
  remoteMove,
  syncRequest,
}: {
  boardRef: React.RefObject<ChessboardRef | null>;
  boardFen: string;
  boardSize: number;
  closedCenterY: number;
  onOpen: () => void;
  open: boolean;
  openCenterY: number;
  previewSize: number;
  progress: SharedValue<number>;
  boardInputEnabled?: boolean;
  onRemoteMoveApplied?: (id: string) => void;
  onUserMove?: (result: MoveResult) => void;
  remoteMove?: RemoteMove | null;
  syncRequest?: SyncRequest | null;
}) {
  const { height, width } = useWindowDimensions();
  const { colors } = useSheetColors();
  const closedLeft = width / 2 - SHEET_LAYOUT.sheetGutter - boardSize / 2;
  const openLeft = (width - boardSize) / 2;
  const closedTop = closedCenterY - height * SHEET_LAYOUT.closedTop - boardSize / 2;
  const openTop = openCenterY - boardSize / 2;
  const previewScale = previewSize / boardSize;
  const [captured, setCaptured] = useState(() => capturedFromFen(boardFen));
  const [expandedCaptureSide, setExpandedCaptureSide] =
    useState<CaptureExpansion>(null);
  const [kingDisplayState, setKingDisplayState] =
    useState<KingDisplayState>(null);
  const [markerFen, setMarkerFen] = useState(boardFen);
  const [spriteReady, setSpriteReady] = useState(false);
  const pendingOpenRef = useRef(false);
  const appliedRemoteMoveRef = useRef<string | null>(null);
  const remoteMoveInProgressRef = useRef(false);
  const captureCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
  const clearCaptureCollapseTimer = useCallback(() => {
    if (captureCollapseTimerRef.current == null) return;
    clearTimeout(captureCollapseTimerRef.current);
    captureCollapseTimerRef.current = null;
  }, []);
  const expandCaptureAfterMove = useCallback(
    (side: CaptureSide) => {
      clearCaptureCollapseTimer();
      setExpandedCaptureSide(side);
      captureCollapseTimerRef.current = setTimeout(() => {
        captureCollapseTimerRef.current = null;
        setExpandedCaptureSide(null);
      }, CAPTURE_AUTO_COLLAPSE_DELAY);
    },
    [clearCaptureCollapseTimer],
  );
  const handleCaptureTrayToggle = useCallback(
    (side: CaptureSide) => {
      clearCaptureCollapseTimer();
      setExpandedCaptureSide(current => {
        if (current === null) return 'both';
        if (current === 'both') return null;
        return current === side ? null : side;
      });
    },
    [clearCaptureCollapseTimer],
  );
  const handleMove = useCallback(
    (result: MoveResult) => {
      setMarkerFen(result.state.fen);

      if (result.state.isCheckmate) {
        setKingDisplayState('gameOver');
      } else if (result.state.isCheck) {
        setKingDisplayState('checkmate');
      } else {
        setKingDisplayState(null);
      }

      const piece = result.move.captured;
      if (piece) {
        // store captures under the side that made the move
        const side = result.move.color === 'w' ? 'w' : 'b';
        expandCaptureAfterMove(side === 'w' ? 'bottom' : 'top');
        setCaptured(previous => ({
          ...previous,
          [side]: [...previous[side], piece],
        }));
      }

      if (!remoteMoveInProgressRef.current) onUserMove?.(result);
    },
    [expandCaptureAfterMove, onUserMove],
  );

  useEffect(() => {
    if (!syncRequest) return;
    boardRef.current?.resetBoard(syncRequest.fen);
    setMarkerFen(syncRequest.fen);
  }, [boardRef, syncRequest]);

  useEffect(() => {
    if (
      !remoteMove ||
      !spriteReady ||
      remoteMove.id === appliedRemoteMoveRef.current
    ) {
      return;
    }

    const board = boardRef.current;
    if (!board) return;

    appliedRemoteMoveRef.current = remoteMove.id;
    remoteMoveInProgressRef.current = true;
    void board.move(remoteMove.move).finally(() => {
      remoteMoveInProgressRef.current = false;
      onRemoteMoveApplied?.(remoteMove.id);
    });
  }, [boardRef, onRemoteMoveApplied, remoteMove, spriteReady]);

  useEffect(() => {
    setMarkerFen(boardFen);
    setCaptured(capturedFromFen(boardFen));
    setExpandedCaptureSide(null);
    setKingDisplayState(null);
    if (captureCollapseTimerRef.current != null) {
      clearTimeout(captureCollapseTimerRef.current);
      captureCollapseTimerRef.current = null;
    }
  }, [boardFen, clearCaptureCollapseTimer]);
  useEffect(
    () => () => clearCaptureCollapseTimer(),
    [clearCaptureCollapseTimer],
  );
  const borderWidth = 2;
  const borderRadius = 12;
  const boardScale = useDerivedValue(() => {
    const rawScale = interpolate(
      progress.value,
      [0, 1],
      [previewScale, 1],
      Extrapolation.CLAMP,
    );
    const renderedBoardSize =
      Math.round(boardSize * rawScale * DEVICE_PIXEL_RATIO) /
      DEVICE_PIXEL_RATIO;

    return renderedBoardSize / boardSize;
  });

  const boardStyle = useAnimatedStyle(() => {
    const rawLeft = interpolate(
      progress.value,
      [0, 1],
      [closedLeft, openLeft],
    );
    const rawTop = interpolate(
      progress.value,
      [0, 1],
      [closedTop, openTop],
    );
    // Freeze the board transform between visible device-pixel changes. This
    // keeps Skia pieces from re-rasterizing while the board looks stationary.
    return {
      left: Math.round(rawLeft * DEVICE_PIXEL_RATIO) / DEVICE_PIXEL_RATIO,
      top: Math.round(rawTop * DEVICE_PIXEL_RATIO) / DEVICE_PIXEL_RATIO,
      transform: [{ scale: boardScale.value }],
    };
  });
  const boardClipStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(
      progress.value,
      [0, 1],
      [borderRadius / previewScale, borderRadius],
      Extrapolation.CLAMP,
    ),
  }));
  const playStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.45, 0.78, 1],
      [1, 1, 0.35, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.45, 0.78, 1],
          [1, 0.9, 0.35, 0],
          Extrapolation.CLAMP,
        ),
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
      <BoardCaptures
        boardSize={boardSize}
        captured={captured}
        closedLeft={closedLeft}
        closedTop={closedTop}
        expandedSide={expandedCaptureSide}
        openLeft={openLeft}
        openTop={openTop}
        onToggleSide={handleCaptureTrayToggle}
        open={open}
        previewSize={previewSize}
        progress={progress}
      />
      <AnimatedView
        className="absolute z-2 overflow-hidden rounded-xl"
        pointerEvents={open ? 'auto' : 'none'}
        style={[{ height: boardSize, width: boardSize }, boardStyle, boardClipStyle]}>
        <SheetBoard
          ref={boardRef}
          boardSize={boardSize}
          fen={boardFen}
          gestureEnabled={open && boardInputEnabled}
          kingDisplayState={kingDisplayState}
          markerFen={markerFen}
          onReady={handleSpriteReady}
          onMove={handleMove}
          open={open}
          boardScale={boardScale}
          previewScale={previewScale}
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
                backgroundColor: colors.playButton,
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
              tintColor={colors.playButtonForeground}
              weight="medium"
            />
            <Text
              style={{ color: colors.playButtonForeground, fontSize: 24, fontWeight: '700' }}>
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
            borderColor: colors.boardBorder,
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
