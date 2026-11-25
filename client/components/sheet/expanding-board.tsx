import { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { Chess } from 'chess.js';

import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { ChessboardRef } from 'react-native-chessboard';
import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';

import { AnimatedView } from '@/components/shared/uniwind';
import type { RemoteMove, SyncRequest } from '@/hooks/use-backend-game';
import type { GameSummary } from '@/types/games';

import { BoardCaptures } from './board-captures';
import { ResultBadge } from './celebration/result-badge';
import { BoardOutline } from './expanding/board-outline';
import { PlayButton } from './expanding/play-button';
import { useBoardMotion } from './expanding/use-board-motion';
import { useOpenGate, useRemoteMoves, useSyncRequests } from './expanding/use-board-sync';
import { useCaptureTrays } from './expanding/use-capture-trays';
import { BoardPreviewLayers, SheetBoard, type KingDisplayState } from './sheet-board';

// the closed board king colour comes from the position so it survives reloads and switches
function kingStateOf(fen: string): KingDisplayState {
  try {
    const chess = new Chess(fen);
    if (chess.isCheckmate()) return 'gameOver';
    return chess.inCheck() ? 'checkmate' : null;
  } catch {
    return null;
  }
}

// the board lives outside the sheet in screen space so the sheet frame cannot offset it
export const ExpandingBoard = memo(function ExpandingBoard({
  boardRef,
  boardFen,
  previewFen = null,
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
  resignedSide = null,
  result,
  resultGame = null,
  resultTop,
  surfaceRevealed = false,
  surfaceResignedSide = resignedSide,
  syncRequest,
}: {
  boardRef: React.RefObject<ChessboardRef | null>;
  boardFen: string;
  previewFen?: string | null;
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
  resignedSide?: 'w' | 'b' | null;
  result: SharedValue<number>;
  resultGame?: GameSummary | null;
  resultTop: number;
  surfaceRevealed?: boolean;
  surfaceResignedSide?: 'w' | 'b' | null;
  syncRequest?: SyncRequest | null;
}) {
  const { width } = useWindowDimensions();
  const left = (width - boardSize) / 2;
  const closedTop = closedCenterY - boardSize / 2;
  const openTop = openCenterY - boardSize / 2;
  // a game switch swaps the Play button and the win badge in the same frame as the pieces
  const reveal = useSharedValue(surfaceRevealed ? 1 : 0);
  useLayoutEffect(() => {
    reveal.set(surfaceRevealed ? 1 : 0);
  }, [reveal, surfaceRevealed]);
  const motion = useBoardMotion({
    boardSize,
    closedTop,
    openTop,
    previewSize,
    progress,
    result,
    resultTop,
  });
  const captures = useCaptureTrays(boardFen);
  const gate = useOpenGate(onOpen);

  // markers reset in the same render as a new position
  const [markerState, setMarkerState] = useState({ base: boardFen, fen: boardFen });
  if (markerState.base !== boardFen) {
    setMarkerState({ base: boardFen, fen: boardFen });
  }
  const markerFen = markerState.base === boardFen ? markerState.fen : boardFen;
  const setMarkerFen = useCallback((fen: string) => setMarkerState(current => ({ ...current, fen })), []);

  // the closed layers follow each move so opening and closing show the real position
  const surfaceFen = previewFen ?? markerFen;
  const surfaceKingState = useMemo(
    () => (surfaceResignedSide ? 'gameOver' : kingStateOf(surfaceFen)),
    [surfaceResignedSide, surfaceFen],
  );

  // the library resets on a fen prop change so it receives the first position alone
  const [initialBoardFen] = useState(boardFen);
  const { syncCaptures } = captures;
  const handleSynced = useCallback(
    (fen: string) => {
      setMarkerFen(fen);
      syncCaptures(fen);
    },
    [setMarkerFen, syncCaptures],
  );
  const fastResetRef = useSyncRequests({ boardRef, onSynced: handleSynced, open, syncRequest });
  const remoteMoveInProgressRef = useRemoteMoves({
    boardReady: gate.ready,
    boardRef,
    onApplied: onRemoteMoveApplied,
    open,
    remoteMove,
  });

  const { recordCapture } = captures;
  const handleMove = useCallback(
    (result: MoveResult) => {
      setMarkerFen(result.state.fen);
      recordCapture(result);
      if (!remoteMoveInProgressRef.current) onUserMove?.(result);
    },
    [onUserMove, recordCapture, remoteMoveInProgressRef, setMarkerFen],
  );

  const boardStyle = useAnimatedStyle(() => ({
    borderRadius: motion.radius.value,
    transform: [
      { translateX: motion.translate.value.x },
      { translateY: motion.translate.value.y },
      { scale: motion.scale.value },
    ],
  }));
  // the Play button and the win badge fold on the sheet spring whenever the shown game's result changes
  // the badge keeps the last won game while it fades out
  const [lastResultGame, setLastResultGame] = useState(resultGame);
  if (resultGame && resultGame !== lastResultGame) setLastResultGame(resultGame);

  const capturesStyle = useAnimatedStyle(() => ({ opacity: 1 - result.value }));
  // the continuous curve matches the outline so the squares never peek past its corners
  const openRect = {
    borderCurve: 'continuous' as const,
    height: boardSize,
    left,
    top: openTop,
    width: boardSize,
  };

  return (
    <>
      {/* the capture trays step out of the way while a won board shrinks */}
      <AnimatedView pointerEvents="box-none" style={[StyleSheet.absoluteFill, capturesStyle]}>
        <BoardCaptures
          boardSize={boardSize}
          captured={captures.captured}
          closedTop={closedTop}
          expandedSide={captures.expandedSide}
          left={left}
          onToggleSide={captures.toggleSide}
          open={open}
          openTop={openTop}
          previewSize={previewSize}
          progress={progress}
        />
      </AnimatedView>
      <AnimatedView
        className="absolute z-2 overflow-hidden"
        pointerEvents={open && boardInputEnabled ? 'auto' : 'none'}
        style={[openRect, boardStyle]}
      >
        <BoardPreviewLayers
          boardSize={boardSize}
          boardTransform={motion.boardTransform}
          fen={surfaceFen}
          kingDisplayState={surfaceKingState}
          kingSide={surfaceResignedSide}
          progress={progress}
          revealed={surfaceRevealed}
        />
        <SheetBoard
          ref={boardRef}
          boardSize={boardSize}
          fen={initialBoardFen}
          onMove={handleMove}
          onReady={gate.onReady}
          progress={progress}
          resetRef={fastResetRef}
          resignedSide={resignedSide}
        />
      </AnimatedView>
      <PlayButton
        hidden={surfaceRevealed}
        left={left}
        reveal={reveal}
        motion={motion}
        onPress={gate.requestOpen}
        open={open}
        progress={progress}
        size={boardSize}
        top={openTop}
      />
      <BoardOutline left={left} motion={motion} progress={progress} size={boardSize} top={openTop} />
      <ResultBadge
        boardSize={boardSize}
        game={resultGame ?? lastResultGame}
        left={left}
        motion={motion}
        progress={progress}
        result={result}
        reveal={reveal}
        top={openTop}
      />
    </>
  );
});
