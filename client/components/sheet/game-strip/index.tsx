import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import type { ListRenderItem } from 'react-native';

import * as Haptics from 'expo-haptics';
import { useSetAtom } from 'jotai';
import { FlatList } from 'react-native-gesture-handler';

import type { GameSummary } from '@/types/games';

import { deleteGameRequestAtom } from '../delete-game-tray';
import { GameCell } from './game-cell';
import { NewGameCell } from './new-game-cell';
import { NEW_GAME_ENTRY, type StripEntry, stripGames } from './strip-items';

const VISIBLE_COLUMNS = 4;

const EDGE_INSET_RATIO = 0.04;

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
  const listRef = useRef<FlatList<StripEntry>>(null);
  const games = useMemo(() => stripGames(days, gamesByDay), [days, gamesByDay]);
  const items = useMemo<StripEntry[]>(() => [...games, NEW_GAME_ENTRY], [games]);
  const selectedIndex = games.findIndex(entry => entry.game.id === selectedGameId);

  // keeps the selected game near the middle where the list allows it
  const offsetFor = useCallback(
    (index: number) => {
      const contentWidth = items.length * cellWidth + edgeInset * 2;
      const maxOffset = Math.max(0, contentWidth - width);
      const centered = edgeInset + index * cellWidth - (width - cellWidth) / 2;
      return Math.min(Math.max(centered, 0), maxOffset);
    },
    [cellWidth, edgeInset, items.length, width],
  );
  const scrolledOnce = useRef(false);

  useEffect(() => {
    if (selectedIndex < 0) return;
    listRef.current?.scrollToOffset({
      animated: scrolledOnce.current,
      offset: offsetFor(selectedIndex),
    });
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

  const renderItem = useCallback<ListRenderItem<StripEntry>>(
    ({ item }) =>
      !('game' in item) ? (
        <NewGameCell width={cellWidth} />
      ) : (
        <GameCell
          entry={item}
          onLongPress={handleLongPress}
          onPress={handleSelect}
          selected={item.game.id === selectedGameId}
          width={cellWidth}
        />
      ),
    [cellWidth, handleLongPress, handleSelect, selectedGameId],
  );

  return (
    <FlatList
      ref={listRef}
      data={items}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: edgeInset,
      }}
      getItemLayout={(_, index) => ({
        index,
        length: cellWidth,
        offset: edgeInset + cellWidth * index,
      })}
      horizontal
      initialNumToRender={VISIBLE_COLUMNS + 2}
      keyExtractor={item => ('game' in item ? item.game.id : 'new-game')}
      onLayout={() => {
        if (selectedIndex >= 0) {
          listRef.current?.scrollToOffset({
            animated: false,
            offset: offsetFor(selectedIndex),
          });
        }
      }}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, height: '100%' }}
    />
  );
});
