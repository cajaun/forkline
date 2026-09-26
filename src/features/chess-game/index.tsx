import { Text, View, useWindowDimensions } from 'react-native';

import React, { useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'jotai';
import { PressableScale } from 'pressto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { START_FEN } from './constants';
import { CheckmateAuraProvider } from './checkmate-aura';
import { Board } from './components/board';
import { PlayPauseButton } from './components/play-pause-button';
import { PlayerCard } from './components/player-card';
import { StatusCaption } from './components/status-caption';
import { HistorySync } from './history-sync';
import { MoveHistory } from './move-history';
import { theme } from './theme';
import { useChessGame } from './use-chess-game';

import type { Side } from './types';

const gutter = 16;
const showChrome = false;

function GameScreen({ initialFen }: { initialFen: string }) {
  const [flipped] = useState(false);
  const { width } = useWindowDimensions();
  const { top: safeTop } = useSafeAreaInsets();
  const boardSize = width;
  const pieceSize = boardSize / 8;
  const { boardRef, boardBoxRef, onMove, togglePlay, confirmNewGame } = useChessGame({
    flipped,
    initialFen,
    pieceSize,
  });
  const topSide: Side = flipped ? 'w' : 'b';
  const bottomSide: Side = flipped ? 'b' : 'w';

  return (
    <View className="flex-1 bg-[#0d0e12]">
      {showChrome ? (
        <View
          className="flex-row items-end px-4 pb-2"
          style={{ paddingTop: safeTop + 6 }}>
          <View className="flex-1 items-center">
            <Text
              className="text-[17px] tracking-[-0.3px] text-[#f0f2f5]"
              style={{ fontFamily: 'SF-Pro-Rounded-Bold' }}>
              Chessboard
            </Text>
            <StatusCaption />
          </View>
          <PressableScale
            hitSlop={16}
            onPress={() => {}}
            style={{ bottom: 8, padding: 4, position: 'absolute', right: gutter }}>
            <Ionicons name="swap-vertical" size={23} color={theme.text} />
          </PressableScale>
        </View>
      ) : null}

      <HistorySync boardRef={boardRef} initialFen={initialFen} />

      <View className="flex-1 pb-7 pt-3">
        <View className="flex-1 justify-center">
          <View className="items-center gap-2.5">
            <View className="w-full px-4">
              <PlayerCard key={topSide} side={topSide} />
            </View>
            <View className="items-center justify-center">
              <Board
                boardSize={boardSize}
                boxRef={boardBoxRef}
                chessRef={boardRef}
                flipped={flipped}
                fen={initialFen}
                onMove={onMove}
              />
            </View>
            <View className="w-full px-4">
              <PlayerCard key={bottomSide} side={bottomSide} />
            </View>
          </View>
        </View>

        {showChrome ? (
          <View className="gap-2.5">
            <View className="w-full px-4">
              <MoveHistory />
            </View>
            <View className="w-full flex-row gap-2.5 px-4">
              <PressableScale
                onPress={confirmNewGame}
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderRadius: 18,
                  borderWidth: 0.5,
                  flex: 1,
                  flexDirection: 'row',
                  gap: 9,
                  height: 52,
                  justifyContent: 'center',
                }}>
                <Ionicons name="refresh" size={20} color={theme.text} />
                <Text
                  className="text-base tracking-[0.1px] text-[#f0f2f5]"
                  style={{ fontFamily: 'SF-Pro-Rounded-Bold' }}>
                  New Game
                </Text>
              </PressableScale>
              <PlayPauseButton onPress={togglePlay} />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export const ChessboardGame = ({ initialFen = START_FEN }: { initialFen?: string }) => (
  <Provider>
    <CheckmateAuraProvider>
      <GameScreen initialFen={initialFen} />
    </CheckmateAuraProvider>
  </Provider>
);
