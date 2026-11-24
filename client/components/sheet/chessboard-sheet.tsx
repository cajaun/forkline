import { useCallback, useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { ChessboardRef } from 'react-native-chessboard';

import { OnboardingTray } from '@/components/onboarding/onboarding-tray';
import { TrayActivityWatcher } from '@/components/shared/tray-activity';
import { AnimatedView } from '@/components/shared/uniwind';
import { SHEET_BACKDROP_FADE, SHEET_LAYOUT, SHEET_SHADOWS } from '@/constants/sheet';
import { useBackendGame } from '@/hooks/use-backend-game';
import { useGameSelection } from '@/hooks/use-game-selection';
import { useLibraryLifecycle } from '@/hooks/use-library-lifecycle';
import { useSheetAnimation } from '@/hooks/use-sheet-animation';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { lossSideOf } from '@/utils/game-ending';
import { START_FEN, gameActions, useGameLibrary } from '@/stores/games';

import { ExpandingBoard } from './expanding-board';
import { HomeChrome } from './home-chrome';
import { OpenBottomControls } from './open-bottom-controls';
import { OpenControls } from './open-controls';
import { PreviewCard } from './preview-card';
import { PreviewTimer } from './preview-timer';
import { SheetStack } from './sheet-stack';
import { useBoardHint } from '@/hooks/use-board-hint';

export function ChessboardSheet() {
  const { height, width } = useWindowDimensions();
  const { colors, isDark } = useSheetColors();
  const boardRef = useRef<ChessboardRef | null>(null);
  const { addElapsed, days, gamesByDay, getMoves, library, recordState, selectGame, selectedGame } =
    useGameLibrary();
  const { closeSheet, open, openSheet, progress, sheetStyle } = useSheetAnimation(height);
  const backendGame = useBackendGame({
    active: open && selectedGame?.status === 'active',
    game: selectedGame,
    getMoves,
    recordState,
  });
  const selection = useGameSelection({ library, onOpen: openSheet, selectGame, selectedGame });
  const { pendingGame, shownGame } = selection;
  const [trayOpen, setTrayOpen] = useState(false);

  useLibraryLifecycle(library?.onboardingComplete ?? false);

  const previewSize = Math.round(width * SHEET_LAYOUT.previewBoardRatio);
  const expandedSize = width * SHEET_LAYOUT.openBoardRatio - SHEET_LAYOUT.openBoardGutter * 2;
  // the clock runs for an open game in play with no tray over it
  const clockRunning = open && !trayOpen && !pendingGame && selectedGame?.status === 'active';
  // the board takes input in a human game the server is not busy with
  const boardInputEnabled =
    !backendGame.busy &&
    !backendGame.error &&
    selectedGame?.status === 'active' &&
    selectedGame.config.gameMode === 'human-vs-agent';

  const resignedSide = lossSideOf(selectedGame);
  const shownResignedSide = lossSideOf(shownGame);

  const hint = useBoardHint(boardRef, colors.primary, selectedGame?.id ?? null);
  const { requestHint } = backendGame;
  const showHint = hint.show;
  const handleHint = useCallback(() => {
    void showHint(requestHint);
  }, [requestHint, showHint]);
  const { onUserMove } = backendGame;
  const clearHint = hint.clear;
  // a move clears any hint before the server sees it
  const handleUserMove = useCallback(
    (result: Parameters<typeof onUserMove>[0]) => {
      clearHint();
      void onUserMove(result);
    },
    [clearHint, onUserMove],
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      SHEET_BACKDROP_FADE.input,
      SHEET_BACKDROP_FADE.output,
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View className="flex-1" style={{ backgroundColor: colors.appBackground }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <AnimatedView className="absolute inset-0" pointerEvents={open ? 'none' : 'auto'}>
        <HomeChrome
          days={days}
          gamesByDay={gamesByDay}
          onSelectGame={selection.showGame}
          progress={progress}
          selectedGameId={shownGame?.id ?? null}
        />
      </AnimatedView>

      <AnimatedView
        className="absolute inset-0"
        pointerEvents="none"
        style={[{ backgroundColor: colors.background }, backdropStyle]}
      />

      <SheetStack frameStyle={sheetStyle} />

      <AnimatedView
        className="absolute overflow-visible"
        style={[{ backgroundColor: colors.background, boxShadow: SHEET_SHADOWS.sheet }, sheetStyle]}>
        <PreviewCard
          dayKey={selection.shownDayKey}
          onClose={closeSheet}
          onOpen={selection.openShownGame}
          open={open}
          progress={progress}
        />
        <OpenControls onClose={closeSheet} open={open} progress={progress} />
        <OpenBottomControls
          hintEnabled={boardInputEnabled}
          hintThinking={hint.thinking}
          onHint={handleHint}
          open={open}
          progress={progress}
        />
      </AnimatedView>

      <ExpandingBoard
        boardFen={backendGame.boardFen || selectedGame?.fen || START_FEN}
        previewFen={pendingGame?.fen ?? null}
        boardSize={expandedSize}
        boardRef={boardRef}
        boardInputEnabled={boardInputEnabled}
        closedCenterY={height * SHEET_LAYOUT.closedBoardCenter}
        onOpen={selection.openShownGame}
        open={open}
        openCenterY={height * SHEET_LAYOUT.openBoardCenter}
        previewSize={previewSize}
        progress={progress}
        onRemoteMoveApplied={backendGame.acknowledgeRemoteMove}
        onUserMove={handleUserMove}
        remoteMove={backendGame.remoteMove}
        resignedSide={resignedSide}
        surfaceResignedSide={shownResignedSide}
        syncRequest={backendGame.syncRequest}
      />
      <PreviewTimer
        elapsedMs={shownGame?.elapsedMs ?? 0}
        gameId={selectedGame?.id ?? null}
        height={height}
        onCommitElapsed={addElapsed}
        onTimeUp={gameActions.timeOutGame}
        progress={progress}
        running={clockRunning}
      />

      <TrayActivityWatcher onChange={setTrayOpen} />
      {library ? <OnboardingTray /> : null}
    </View>
  );
}
