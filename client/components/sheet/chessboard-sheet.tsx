import { useCallback, useEffect, useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { ChessboardRef } from 'react-native-chessboard';

import { OnboardingTray } from '@/components/onboarding/onboarding-tray';
import { TrayActivityWatcher } from '@/components/shared/tray-activity';
import { AnimatedView } from '@/components/shared/uniwind';
import { SHEET_BACKDROP_FADE, SHEET_LAYOUT, SHEET_RESULT, SHEET_SHADOWS } from '@/constants/sheet';
import { useBackendGame } from '@/hooks/use-backend-game';
import { useGameSelection } from '@/hooks/use-game-selection';
import { useLibraryLifecycle } from '@/hooks/use-library-lifecycle';
import { useSheetAnimation } from '@/hooks/use-sheet-animation';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { lossSideOf, resultOf } from '@/utils/game-ending';
import { START_FEN, gameActions, useGameLibrary } from '@/stores/games';

import { ExpandingBoard } from './expanding-board';
import { HomeChrome } from './home-chrome';
import { OpenBottomControls } from './open-bottom-controls';
import { OpenControls } from './open-controls';
import { PreviewCard } from './preview-card';
import { PreviewTimer } from './preview-timer';
import { SheetStack } from './sheet-stack';
import { useBoardHint } from '@/hooks/use-board-hint';
import { useWinCelebration } from '@/hooks/use-win-celebration';
import type { ConfettiMethods } from 'react-native-fast-confetti';

import { Confetti } from './celebration/confetti';
import { LossTray } from './celebration/loss-tray';
import { resultBoardRect } from './celebration/result-layout';
import { ResultStats } from './celebration/result-stats';
import { HINTS_PER_GAME } from '@/constants/game-rules';

export function ChessboardSheet() {
  const { height, width } = useWindowDimensions();
  const { colors, isDark } = useSheetColors();
  const boardRef = useRef<ChessboardRef | null>(null);
  const { addElapsed, days, gamesByDay, getMoves, library, recordState, selectGame, selectedGame } =
    useGameLibrary();
  const { closeSheet, open, openSheet, progress, sheetStyle } = useSheetAnimation(height);
  const [trayOpen, setTrayOpen] = useState(false);
  const backendGame = useBackendGame({
    // the AI waits while a tray is up so a settings change lands before the next move
    active: open && !trayOpen && selectedGame?.status === 'active',
    game: selectedGame,
    getMoves,
    recordState,
  });
  const selection = useGameSelection({ library, onOpen: openSheet, selectGame, selectedGame });
  const { pendingGame, shownGame } = selection;

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

  const confettiRef = useRef<ConfettiMethods | null>(null);
  const celebrate = useCallback(() => confettiRef.current?.restart(), []);
  const result = useWinCelebration(selectedGame, celebrate);
  const resultRect = resultBoardRect(width, height, expandedSize);
  const resultTop = resultRect.top;

  const resignedSide = lossSideOf(selectedGame);
  const shownResignedSide = lossSideOf(shownGame);

  const hint = useBoardHint(boardRef, colors.hint, selectedGame?.id ?? null);
  const { requestHint } = backendGame;
  const showHint = hint.show;
  const gameId = selectedGame?.id ?? null;
  const hintsLeft = Math.max(0, HINTS_PER_GAME - (selectedGame?.hintsUsed ?? 0));
  const askHint = useCallback(async () => {
    if (gameId && (await showHint(requestHint))) gameActions.spendHint(gameId);
  }, [gameId, requestHint, showHint]);
  // the hint stays live on the AI turn and waits for the reply before it asks
  const humanGameLive =
    !backendGame.error &&
    selectedGame?.status === 'active' &&
    selectedGame.config.gameMode === 'human-vs-agent';
  const [hintQueued, setHintQueued] = useState(false);
  const handleHint = useCallback(() => {
    if (backendGame.busy) setHintQueued(true);
    else void askHint();
  }, [askHint, backendGame.busy]);
  useEffect(() => {
    if (!hintQueued || backendGame.busy) return;
    void askHint().finally(() => setHintQueued(false));
  }, [askHint, backendGame.busy, hintQueued]);
  if (hintQueued && !humanGameLive) setHintQueued(false);
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
        style={[{ backgroundColor: colors.background, boxShadow: SHEET_SHADOWS.sheet }, sheetStyle]}
      >
        <PreviewCard
          dayKey={selection.shownDayKey}
          onClose={closeSheet}
          onOpen={selection.openShownGame}
          open={open}
          progress={progress}
        />
        <OpenControls onClose={closeSheet} open={open} progress={progress} />
        <OpenBottomControls
          hintEnabled={humanGameLive && hintsLeft > 0}
          hintsLeft={hintsLeft}
          hintThinking={hint.thinking || hintQueued}
          onHint={handleHint}
          open={open}
          progress={progress}
        />
      </AnimatedView>

      <ExpandingBoard
        boardFen={backendGame.boardFen || selectedGame?.fen || START_FEN}
        // the closed card draws the shown game from the library so a switch never shows the last board
        previewFen={open ? (pendingGame?.fen ?? null) : (shownGame?.fen ?? null)}
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
        result={result}
        resultGame={resultOf(shownGame) ? shownGame : null}
        resultTop={resultTop}
        surfaceResignedSide={shownResignedSide}
        surfaceRevealed={resultOf(shownGame) !== null}
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

      <ResultStats
        game={resultOf(selectedGame) ? selectedGame : null}
        progress={progress}
        result={result}
        top={height * SHEET_RESULT.statsTop}
      />
      <Confetti ref={confettiRef} />
      <LossTray game={selectedGame} />

      <TrayActivityWatcher onChange={setTrayOpen} />
      {library ? <OnboardingTray /> : null}
    </View>
  );
}
