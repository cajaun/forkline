import { memo, useDeferredValue, useMemo } from 'react';

import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/components/shared/uniwind';
import { DARK_PIECE_IMG, PIECE_IMG } from '@/constants/chess-pieces';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { Side } from '@/types/chess';

import { CaptureMiniBoard, type CaptureSide } from './captures/mini-board';

export type { CaptureSide } from './captures/mini-board';
export type CaptureExpansion = CaptureSide | 'both' | null;

export const CAPTURE_AUTO_COLLAPSE_DELAY = 3000;
const EXPANDED_GAP_RATIO = 1 / 16;

// one tray, sliding from the preview's edge to its slot beside the open board
function CaptureTray({
  closedY,
  expanded,
  foe,
  left,
  miniBoardSize,
  onToggle,
  open,
  openY,
  pieces,
  progress,
  side,
  width,
}: {
  closedY: number;
  expanded: boolean;
  foe: Side;
  left: number;
  miniBoardSize: { height: number; width: number };
  onToggle: (side: CaptureSide) => void;
  open: boolean;
  openY: number;
  pieces: string[];
  progress: SharedValue<number>;
  side: CaptureSide;
  width: number;
}) {
  const { boardColors, isDark } = useSheetColors();
  // transform-only, so the tray stays locked to the transform-driven board
  const trayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY:
          interpolate(progress.value, [0, 1], [closedY, openY], Extrapolation.CLAMP) - openY,
      },
    ],
  }));

  return (
    <AnimatedView
      className="absolute z-1"
      pointerEvents={open ? 'box-none' : 'none'}
      style={[{ height: miniBoardSize.height, left, top: openY, width }, trayStyle]}>
      <CaptureMiniBoard
        boardColors={boardColors}
        expanded={expanded}
        foe={foe}
        onToggle={onToggle}
        pieceImages={isDark ? DARK_PIECE_IMG : PIECE_IMG}
        pieces={pieces}
        side={side}
        size={miniBoardSize}
      />
    </AnimatedView>
  );
}

// the captured-piece trays above and below the board, re-rendering only when captures or expansion change
export const BoardCaptures = memo(function BoardCaptures({
  boardSize,
  captured,
  closedTop,
  expandedSide,
  left,
  onToggleSide,
  open,
  openTop,
  previewSize,
  progress,
}: {
  boardSize: number;
  captured: Record<'b' | 'w', string[]>;
  closedTop: number;
  expandedSide: CaptureExpansion;
  left: number;
  onToggleSide: (side: CaptureSide) => void;
  open: boolean;
  openTop: number;
  previewSize: number;
  progress: SharedValue<number>;
}) {
  // the trays are hidden during a game switch, so new captures can render in the background
  const shownCaptured = useDeferredValue(captured);
  // a stable size object keeps the memoised mini boards from re-rendering
  const miniBoardSize = useMemo(
    () => ({ height: boardSize / 8, width: boardSize / 2 }),
    [boardSize],
  );
  const expandedGap = boardSize * EXPANDED_GAP_RATIO;
  // the preview is centred in the board's closed rect, so its visible top sits lower
  const previewTop = closedTop + (boardSize - previewSize) / 2;
  const halfTray = miniBoardSize.height / 2;
  const shared = { left, miniBoardSize, onToggle: onToggleSide, open, progress, width: boardSize };

  return (
    <>
      <CaptureTray
        {...shared}
        closedY={previewTop - halfTray}
        expanded={expandedSide === 'top' || expandedSide === 'both'}
        foe="w"
        openY={openTop - miniBoardSize.height - expandedGap}
        pieces={shownCaptured.b}
        side="top"
      />
      <CaptureTray
        {...shared}
        closedY={previewTop + previewSize - halfTray}
        expanded={expandedSide === 'bottom' || expandedSide === 'both'}
        foe="b"
        openY={openTop + boardSize + expandedGap}
        pieces={shownCaptured.w}
        side="bottom"
      />
    </>
  );
});
