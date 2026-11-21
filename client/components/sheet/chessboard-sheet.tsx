import { useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { GestureDetector } from 'react-native-gesture-handler';
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
import { START_FEN, useGameLibrary } from '@/stores/games';

import { ExpandingBoard } from './expanding-board';
import { GameDots } from './game-dots';
import { HomeChrome } from './home-chrome';
import { OpenBottomControls } from './open-bottom-controls';
import { OpenControls } from './open-controls';
import { PreviewCard } from './preview-card';
import { PreviewTimer } from './preview-timer';
import { SheetStack } from './sheet-stack';

// the home screen: the day strip behind a card that opens into the game sheet
export function ChessboardSheet() {
  const { height, width } = useWindowDimensions();
  const { colors, isDark } = useSheetColors();
  const boardRef = useRef<ChessboardRef | null>(null);
  const { addElapsed, days, gamesByDay, getMoves, library, recordState, selectGame, selectedGame } =
    useGameLibrary();
  const { closeSheet, open, openSheet, progress, sheetStyle } = useSheetAnimation(height);
  const backendGame = useBackendGame({ active: open, game: selectedGame, getMoves, recordState });
  const selection = useGameSelection({
    gamesByDay,
    library,
    onOpen: openSheet,
    open,
    selectGame,
    selectedGame,
  });
  const { dayGames, pendingGame, shownGame } = selection;
  const [trayOpen, setTrayOpen] = useState(false);

  useLibraryLifecycle(library?.onboardingComplete ?? false);

  const previewSize = Math.round(width * SHEET_LAYOUT.previewBoardRatio);
  const expandedSize = width * SHEET_LAYOUT.openBoardRatio - SHEET_LAYOUT.openBoardGutter * 2;
  // the clock runs only while an unfinished game is open with no tray over it
  const clockRunning = open && !trayOpen && !pendingGame && selectedGame?.status === 'active';
  // only a human-vs-agent game still in play takes board input
  const boardInputEnabled =
    !backendGame.busy &&
    !backendGame.error &&
    selectedGame?.status === 'active' &&
    selectedGame.config.gameMode === 'human-vs-agent';

  // washes the home background out to the sheet colour as the sheet takes over
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
          onSelectDay={selection.selectDay}
          progress={progress}
          selectedDayKey={shownGame ? selection.shownDayKey : null}
        />
      </AnimatedView>

      <AnimatedView
        className="absolute inset-0"
        pointerEvents="none"
        style={[{ backgroundColor: colors.background }, backdropStyle]}
      />

      <SheetStack frameStyle={sheetStyle} />

      <GestureDetector gesture={selection.swipeGesture}>
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
          <OpenBottomControls open={open} progress={progress} />
        </AnimatedView>
      </GestureDetector>

      {dayGames.length > 1 ? (
        <GameDots
          activeIndex={selection.gameIndex}
          games={dayGames}
          progress={progress}
          top={height * (1 - SHEET_LAYOUT.closedBottom) + 26}
        />
      ) : null}

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
        onUserMove={backendGame.onUserMove}
        remoteMove={backendGame.remoteMove}
        syncRequest={backendGame.syncRequest}
      />
      <PreviewTimer
        elapsedMs={shownGame?.elapsedMs ?? 0}
        gameId={selectedGame?.id ?? null}
        height={height}
        onCommitElapsed={addElapsed}
        progress={progress}
        running={clockRunning}
      />

      <TrayActivityWatcher onChange={setTrayOpen} />
      {library ? <OnboardingTray /> : null}
    </View>
  );
}
