import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChessboardRef } from 'react-native-chessboard';

import type { RemoteMove, SyncRequest } from '@/hooks/use-backend-game';

import type { FastReset } from '../board/use-fast-reset';

// holds an open tap until the sprite atlas can draw the first frame
export function useOpenGate(onOpen: () => void) {
  const [ready, setReady] = useState(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!ready || !pendingRef.current) return;
    pendingRef.current = false;
    onOpen();
  }, [onOpen, ready]);

  const requestOpen = useCallback(() => {
    if (ready) onOpen();
    else pendingRef.current = true;
  }, [onOpen, ready]);

  return { onReady: setReady, ready, requestOpen };
}

// applies each sync once and waits for an idle moment while the sheet is closed
export function useSyncRequests({
  boardRef,
  onSynced,
  open,
  syncRequest,
}: {
  boardRef: React.RefObject<ChessboardRef | null>;
  onSynced: (fen: string) => void;
  open: boolean;
  syncRequest?: SyncRequest | null;
}) {
  const appliedIdRef = useRef<number | null>(null);
  const fastResetRef = useRef<FastReset | null>(null);

  useEffect(() => {
    if (!syncRequest || appliedIdRef.current === syncRequest.id) return;
    const apply = () => {
      appliedIdRef.current = syncRequest.id;
      if (fastResetRef.current) fastResetRef.current(syncRequest.fen);
      else boardRef.current?.resetBoard(syncRequest.fen);
      onSynced(syncRequest.fen);
    };
    if (open) {
      apply();
      return;
    }
    const handle = requestIdleCallback(apply, { timeout: 1000 });
    return () => cancelIdleCallback(handle);
  }, [boardRef, onSynced, open, syncRequest]);

  return fastResetRef;
}

// plays each server move once and flags it so the board does not report it as the player
export function useRemoteMoves({
  boardRef,
  boardReady,
  onApplied,
  remoteMove,
}: {
  boardRef: React.RefObject<ChessboardRef | null>;
  boardReady: boolean;
  onApplied?: (id: string) => void;
  remoteMove?: RemoteMove | null;
}) {
  const appliedIdRef = useRef<string | null>(null);
  const inProgressRef = useRef(false);

  useEffect(() => {
    if (!remoteMove || !boardReady || remoteMove.id === appliedIdRef.current) return;
    const board = boardRef.current;
    if (!board) return;

    appliedIdRef.current = remoteMove.id;
    inProgressRef.current = true;
    void board.move(remoteMove.move).finally(() => {
      inProgressRef.current = false;
      onApplied?.(remoteMove.id);
    });
  }, [boardReady, boardRef, onApplied, remoteMove]);

  return inProgressRef;
}
