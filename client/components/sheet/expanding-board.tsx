import { memo, useCallback, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { ChessboardRef } from 'react-native-chessboard';
import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';

import { AnimatedView } from '@/components/shared/uniwind';
import type { RemoteMove, SyncRequest } from '@/hooks/use-backend-game';

import { BoardCaptures } from './board-captures';
import { BoardOutline } from './expanding/board-outline';
import { PlayButton } from './expanding/play-button';
import { useBoardMotion } from './expanding/use-board-motion';
import { useOpenGate, useRemoteMoves, useSyncRequests } from './expanding/use-board-sync';
import { useCaptureTrays } from './expanding/use-capture-trays';
import { BoardPreviewLayers, SheetBoard, type KingDisplayState } from './sheet-board';

// a check marks the king orange and a checkmate marks it red
function kingStateAfter(result: MoveResult): KingDisplayState {
  if (result.state.isCheckmate) return 'gameOver';
  if (result.state.isCheck) return 'checkmate';
  return null;
}

// lives outside the sheet in screen coordinates, so the sheet's lagging layout frame never offsets it
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
  syncRequest,
}: {
  boardRef: React.RefObject<ChessboardRef | null>;
  boardFen: string;
  // a picked game's saved position, shown before the switch to it finishes rendering
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
  syncRequest?: SyncRequest | null;
}) {
  const { width } = useWindowDimensions();
  const left = (width - boardSize) / 2;
  const closedTop = closedCenterY - boardSize / 2;
  const openTop = openCenterY - boardSize / 2;
  const motion = useBoardMotion({ boardSize, closedTop, openTop, previewSize, progress });
  const captures = useCaptureTrays(boardFen);
  const gate = useOpenGate(onOpen);
  const [kingDisplayState, setKingDisplayState] = useState<KingDisplayState>(null);

  // markers follow the live position and reset in the same render as a new boardFen, never a frame late
  const [markerState, setMarkerState] = useState({ base: boardFen, fen: boardFen });
  if (markerState.base !== boardFen) {
    setMarkerState({ base: boardFen, fen: boardFen });
    setKingDisplayState(null);
  }
  const markerFen = markerState.base === boardFen ? markerState.fen : boardFen;
  const setMarkerFen = useCallback(
    (fen: string) => setMarkerState(current => ({ ...current, fen })),
    [],
  );

  // the closed-state layers are hidden while open, so they hold the opening position and catch up on close
  const liveSurfaceFen = previewFen ?? markerFen;
  const [openedSurfaceFen, setOpenedSurfaceFen] = useState(liveSurfaceFen);
  if (!open && openedSurfaceFen !== liveSurfaceFen) {
    setOpenedSurfaceFen(liveSurfaceFen);
  }
  const surfaceFen = open ? openedSurfaceFen : liveSurfaceFen;

  // the library resets the board whenever its fen prop changes, so it only gets the first position
  const [initialBoardFen] = useState(boardFen);
  const fastResetRef = useSyncRequests({ boardRef, onSynced: setMarkerFen, open, syncRequest });
  const remoteMoveInProgressRef = useRemoteMoves({
    boardReady: gate.ready,
    boardRef,
    onApplied: onRemoteMoveApplied,
    remoteMove,
  });

  const { recordCapture } = captures;
  const handleMove = useCallback(
    (result: MoveResult) => {
      setMarkerFen(result.state.fen);
      setKingDisplayState(kingStateAfter(result));
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
  const openRect = { height: boardSize, left, top: openTop, width: boardSize };

  return (
    <>
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
      <AnimatedView
        className="absolute z-2 overflow-hidden"
        // input is blocked here, since toggling the board's own config rebuilds its whole context
        pointerEvents={open && boardInputEnabled ? 'auto' : 'none'}
        style={[openRect, boardStyle]}>
        <BoardPreviewLayers
          boardSize={boardSize}
          boardTransform={motion.boardTransform}
          fen={surfaceFen}
          kingDisplayState={kingDisplayState}
          progress={progress}
        />
        <SheetBoard
          ref={boardRef}
          boardSize={boardSize}
          fen={initialBoardFen}
          kingDisplayState={kingDisplayState}
          onMove={handleMove}
          onReady={gate.onReady}
          progress={progress}
          resetRef={fastResetRef}
        />
      </AnimatedView>
      <PlayButton
        left={left}
        motion={motion}
        onPress={gate.requestOpen}
        open={open}
        progress={progress}
        size={boardSize}
        top={openTop}
      />
      <BoardOutline left={left} motion={motion} progress={progress} size={boardSize} top={openTop} />
    </>
  );
});
