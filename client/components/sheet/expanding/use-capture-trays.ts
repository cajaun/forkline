import { useCallback, useEffect, useRef, useState } from 'react';

import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';

import { capturedFromFen } from '@/utils/fen';

import { CAPTURE_AUTO_COLLAPSE_DELAY, type CaptureExpansion, type CaptureSide } from '../board-captures';

type Captured = Record<'b' | 'w', string[]>;

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const sameCaptures = (a: Captured, b: Captured) => sameList(a.b, b.b) && sameList(a.w, b.w);

// tracks captured pieces and opens the tray of the side that captured
export function useCaptureTrays(boardFen: string) {
  const [captured, setCaptured] = useState(() => capturedFromFen(boardFen));
  const [expandedSide, setExpandedSide] = useState<CaptureExpansion>(null);
  const [capturedFen, setCapturedFen] = useState(boardFen);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current == null) return;
    clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = null;
  }, []);

  const recordCapture = useCallback(
    (result: MoveResult) => {
      const piece = result.move.captured;
      if (!piece) return;
      const side = result.move.color;
      clearCollapseTimer();
      setExpandedSide(side === 'w' ? 'bottom' : 'top');
      collapseTimerRef.current = setTimeout(() => {
        collapseTimerRef.current = null;
        setExpandedSide(null);
      }, CAPTURE_AUTO_COLLAPSE_DELAY);
      setCaptured(previous => ({ ...previous, [side]: [...previous[side], piece] }));
    },
    [clearCollapseTimer],
  );

  const toggleSide = useCallback(
    (side: CaptureSide) => {
      clearCollapseTimer();
      setExpandedSide(current => {
        if (current === null) return 'both';
        if (current === 'both') return null;
        return current === side ? null : side;
      });
    },
    [clearCollapseTimer],
  );

  if (capturedFen !== boardFen) {
    const next = capturedFromFen(boardFen);
    setCapturedFen(boardFen);
    setCaptured(current => (sameCaptures(current, next) ? current : next));
    setExpandedSide(null);
  }

  useEffect(() => clearCollapseTimer(), [boardFen, clearCollapseTimer]);

  useEffect(() => clearCollapseTimer, [clearCollapseTimer]);

  // a board sync such as Start over or Undo rebuilds the lists from the new position
  const syncCaptures = useCallback((fen: string) => {
    const next = capturedFromFen(fen);
    setCaptured(current => (sameCaptures(current, next) ? current : next));
  }, []);

  return { captured, expandedSide, recordCapture, syncCaptures, toggleSide };
}
