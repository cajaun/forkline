import { useCallback, useEffect, useRef, useState } from 'react';

import type { Square } from 'chess.js';
import * as Haptics from '@/services/haptics';
import type { ChessboardRef } from 'react-native-chessboard';

import { moveFromUci } from '@/services/chess-api';

const HINT_VISIBLE_MS = 3000;
const HINT_FADE_MS = 200;

function rgba(hex: string, alpha: number) {
  const value = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

// marks the suggested move squares for a few seconds
export function useBoardHint(
  boardRef: React.RefObject<ChessboardRef | null>,
  color: string,
  gameId: string | null,
) {
  const [thinking, setThinking] = useState(false);
  const squaresRef = useRef<Square[]>([]);
  const alphaRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paint = useCallback(
    (squares: Square[], alpha: number) => {
      // the board ref sets a colour and cannot clear one so a see through rgba stands in
      for (const square of squares) boardRef.current?.highlight({ color: rgba(color, alpha), square });
    },
    [boardRef, color],
  );

  // the board swaps colours instantly so the alpha is stepped per frame for a fade
  const fadeTo = useCallback(
    (squares: Square[], target: number) => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      const start = alphaRef.current;
      const began = Date.now();
      const step = () => {
        const t = Math.min(1, (Date.now() - began) / HINT_FADE_MS);
        alphaRef.current = start + (target - start) * t;
        paint(squares, alphaRef.current);
        frameRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      step();
    },
    [paint],
  );

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    if (squaresRef.current.length) fadeTo(squaresRef.current, 0);
    squaresRef.current = [];
  }, [fadeTo]);

  const show = useCallback(
    async (ask: () => Promise<string | null>) => {
      setThinking(true);
      const uci = await ask();
      setThinking(false);
      if (!uci) return false;
      // an older hint is wiped at once so only the new pair fades in
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      paint(squaresRef.current, 0);
      alphaRef.current = 0;
      const { from, to } = moveFromUci(uci);
      squaresRef.current = [from, to];
      fadeTo([from, to], 1);
      void Haptics.selectionAsync();
      timerRef.current = setTimeout(clear, HINT_VISIBLE_MS);
      return true;
    },
    [clear, fadeTo, paint],
  );

  useEffect(() => clear, [clear, gameId]);
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return { clear, show, thinking };
}
