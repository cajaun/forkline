import { useCallback, useEffect, useRef, useState } from 'react';

import type { Square } from 'chess.js';
import * as Haptics from 'expo-haptics';
import type { ChessboardRef } from 'react-native-chessboard';

import { moveFromUci } from '@/services/chess-api';

const HINT_VISIBLE_MS = 3000;

// marks the suggested move squares for a few seconds
export function useBoardHint(
  boardRef: React.RefObject<ChessboardRef | null>,
  color: string,
  gameId: string | null,
) {
  const [thinking, setThinking] = useState(false);
  const squaresRef = useRef<Square[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    // the board ref can set a colour and cannot clear one so transparent stands in
    for (const square of squaresRef.current) boardRef.current?.highlight({ color: 'transparent', square });
    squaresRef.current = [];
  }, [boardRef]);

  const show = useCallback(
    async (ask: () => Promise<string | null>) => {
      setThinking(true);
      const uci = await ask();
      setThinking(false);
      if (!uci) return false;
      clear();
      const { from, to } = moveFromUci(uci);
      squaresRef.current = [from, to];
      const tint = `${color}55`;
      boardRef.current?.highlight({ color: tint, square: from });
      boardRef.current?.highlight({ color: tint, square: to });
      void Haptics.selectionAsync();
      timerRef.current = setTimeout(clear, HINT_VISIBLE_MS);
      return true;
    },
    [boardRef, clear, color],
  );

  useEffect(() => clear, [clear, gameId]);

  return { clear, show, thinking };
}
