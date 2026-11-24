import { type ReactNode, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useSetAtom } from 'jotai';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { GameSummary } from '@/types/games';

import { deleteGameRequestAtom } from '../delete-game-tray';
import { GameCell } from './game-cell';
import { NewGameCell } from './new-game-cell';
import { stripGames } from './strip-items';

const VISIBLE_COLUMNS = 4;
const EDGE_INSET_RATIO = 0.04;
const SLIDE = { duration: 260, easing: Easing.out(Easing.cubic) };

// each cell owns its x so a game joining or leaving slides the rest with a transform and no relayout
function PlacedCell({ children, x }: { children: ReactNode; x: number }) {
  const left = useSharedValue(x);
  useEffect(() => {
    left.set(withTiming(x, SLIDE));
  }, [left, x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: left.get() }] }));

  return (
    <Animated.View style={[{ height: '100%', left: 0, position: 'absolute', top: 0 }, style]}>
      {children}
    </Animated.View>
  );
}

// the row centres when it fits and scrolls from the edges once it outgrows the screen
export const GameStrip = memo(function GameStrip({
  days,
  gamesByDay,
  onSelectGame,
  selectedGameId,
}: {
  days: string[];
  gamesByDay: Record<string, GameSummary[]>;
  onSelectGame: (gameId: string) => void;
  selectedGameId: string | null;
}) {
  const { width } = useWindowDimensions();
  const edgeInset = width * EDGE_INSET_RATIO;
  const cellWidth = (width - edgeInset * 2) / VISIBLE_COLUMNS;
  const scrollRef = useRef<ScrollView>(null);
  const games = useMemo(() => stripGames(days, gamesByDay), [days, gamesByDay]);
  const selectedIndex = games.findIndex(entry => entry.game.id === selectedGameId);
  const cellCount = games.length + 1;
  const contentWidth = Math.max(width, cellCount * cellWidth + edgeInset * 2);
  const start = (contentWidth - cellCount * cellWidth) / 2;

  // keeps the selected game near the middle where the row allows it
  const offsetFor = useCallback(
    (index: number) => {
      const centered = start + index * cellWidth - (width - cellWidth) / 2;
      return Math.min(Math.max(centered, 0), contentWidth - width);
    },
    [cellWidth, contentWidth, start, width],
  );
  const scrolledOnce = useRef(false);

  useEffect(() => {
    if (selectedIndex < 0) return;
    scrollRef.current?.scrollTo({ animated: scrolledOnce.current, x: offsetFor(selectedIndex) });
    scrolledOnce.current = true;
  }, [offsetFor, selectedIndex]);

  const handleSelect = useCallback(
    (gameId: string) => {
      if (gameId === selectedGameId) return;
      void Haptics.selectionAsync();
      onSelectGame(gameId);
    },
    [onSelectGame, selectedGameId],
  );

  const requestDelete = useSetAtom(deleteGameRequestAtom);
  // holding a game asks to delete it
  const handleLongPress = useCallback(
    (gameId: string, label: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      requestDelete({ gameId, label, nonce: Date.now() });
    },
    [requestDelete],
  );

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={{ height: '100%', width: contentWidth }}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, height: '100%' }}>
      {games.map((entry, index) => (
        <PlacedCell key={entry.game.id} x={start + index * cellWidth}>
          <GameCell
            entry={entry}
            onLongPress={handleLongPress}
            onPress={handleSelect}
            selected={entry.game.id === selectedGameId}
            width={cellWidth}
          />
        </PlacedCell>
      ))}
      <PlacedCell x={start + games.length * cellWidth}>
        <NewGameCell width={cellWidth} />
      </PlacedCell>
    </ScrollView>
  );
});
