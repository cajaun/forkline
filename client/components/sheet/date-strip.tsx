import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import type { ListRenderItem } from 'react-native';

import * as Haptics from 'expo-haptics';
// gesture-handler's list lets each cell's tap fire without waiting on the scroll view
import { FlatList } from 'react-native-gesture-handler';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { GameSummary } from '@/types/games';
import { dayLabels, hoursUntilNextDay } from '@/utils/days';

type DayState = 'empty' | 'active' | 'finished';

type StripItem =
  | { dayKey: string; kind: 'day'; state: DayState }
  | { kind: 'next' };

// four columns across the screen, the last one for the countdown
const VISIBLE_COLUMNS = 4;
const EDGE_INSET_RATIO = 0.04;
// the selected day's pill is a little narrower than its column
const PILL_WIDTH_RATIO = 0.84;

function dayState(games: GameSummary[] | undefined): DayState {
  if (!games?.length) return 'empty';
  return games.every(game => game.status === 'finished') ? 'finished' : 'active';
}

const DayCell = memo(function DayCell({
  dayKey,
  onPress,
  selected,
  state,
  width,
}: {
  dayKey: string;
  onPress: (dayKey: string) => void;
  selected: boolean;
  state: DayState;
  width: number;
}) {
  const { colors } = useSheetColors();
  const labels = dayLabels(dayKey);
  const muted = state === 'empty';
  const textColor = muted
    ? colors.weekdayText
    : selected
      ? colors.selectedDateText
      : colors.text;
  const ringColor = selected ? colors.selectedDateText : colors.weekdayText;

  return (
    <View style={{ alignItems: 'center', height: '100%', justifyContent: 'center', width }}>
      <PressableScale
        accessibilityLabel={`${labels.weekday} ${labels.monthDay}${muted ? ', no games' : ''}`}
        // days without games have nothing to open
        onPress={muted ? undefined : () => onPress(dayKey)}
        style={{
          alignItems: 'center',
          backgroundColor: selected ? colors.selectedDateBackground : 'transparent',
          borderRadius: 23,
          gap: 5,
          height: '100%',
          justifyContent: 'center',
          paddingVertical: 15,
          width: width * PILL_WIDTH_RATIO,
        }}>
        <Text style={{ color: textColor, fontSize: 14, fontWeight: '800' }}>
          {labels.shortWeekday}
        </Text>
        <Text numberOfLines={1} style={{ color: textColor, fontSize: 28, fontWeight: '900' }}>
          {labels.date}
        </Text>
        {/* dotted: games in progress · solid: every game finished · faint: none */}
        <View
          style={{
            borderColor: ringColor,
            borderRadius: 9,
            borderStyle: state === 'finished' ? 'solid' : 'dotted',
            borderWidth: 2,
            height: 17,
            marginTop: 3,
            opacity: muted ? 0.65 : 1,
            width: 17,
          }}
        />
      </PressableScale>
    </View>
  );
});

const NextDayCell = memo(function NextDayCell({ width }: { width: number }) {
  const { colors } = useSheetColors();
  const [hours, setHours] = useState(() => hoursUntilNextDay());

  useEffect(() => {
    // refresh once a minute; the label only shows whole hours
    const timer = setInterval(() => setHours(hoursUntilNextDay()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={{
        alignItems: 'center',
        gap: 7,
        height: '100%',
        justifyContent: 'center',
        paddingVertical: 15,
        width,
      }}>
      <Text style={{ color: colors.weekdayText, fontSize: 14, fontWeight: '800' }}>
        Next in
      </Text>
      <Text style={{ color: colors.weekdayText, fontSize: 25, fontWeight: '900' }}>
        {hours} {hours === 1 ? 'hr' : 'hrs'}
      </Text>
      <SfSymbol fallback="time-outline" name="clock" size={20} tintColor={colors.controlIcon} />
    </View>
  );
});

// one column per day from the first game to today, then a countdown to tomorrow
export function DateStrip({
  days,
  gamesByDay,
  onSelectDay,
  selectedDayKey,
}: {
  days: string[];
  gamesByDay: Record<string, GameSummary[]>;
  onSelectDay: (dayKey: string) => void;
  selectedDayKey: string | null;
}) {
  const { width } = useWindowDimensions();
  const edgeInset = width * EDGE_INSET_RATIO;
  const cellWidth = (width - edgeInset * 2) / VISIBLE_COLUMNS;
  const listRef = useRef<FlatList<StripItem>>(null);
  const items = useMemo<StripItem[]>(
    () => [
      ...days.map(dayKey => ({
        dayKey,
        kind: 'day' as const,
        state: dayState(gamesByDay[dayKey]),
      })),
      { kind: 'next' as const },
    ],
    [days, gamesByDay],
  );
  const selectedIndex = selectedDayKey ? days.indexOf(selectedDayKey) : -1;

  // keep the selected day in the middle column where the list allows it
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
      // jump on first layout, slide on every later selection
      animated: scrolledOnce.current,
      offset: offsetFor(selectedIndex),
    });
    scrolledOnce.current = true;
  }, [offsetFor, selectedIndex]);

  // stable, so a switch re-renders only the two cells whose highlight changes
  const handleSelect = useCallback(
    (dayKey: string) => {
      void Haptics.selectionAsync();
      onSelectDay(dayKey);
    },
    [onSelectDay],
  );

  const renderItem = useCallback<ListRenderItem<StripItem>>(
    ({ item }) =>
      item.kind === 'next' ? (
        <NextDayCell width={cellWidth} />
      ) : (
        <DayCell
          dayKey={item.dayKey}
          onPress={handleSelect}
          selected={item.dayKey === selectedDayKey}
          state={item.state}
          width={cellWidth}
        />
      ),
    [cellWidth, handleSelect, selectedDayKey],
  );

  return (
    <FlatList
      ref={listRef}
      data={items}
      // a short history hugs the right edge so the countdown keeps the last column
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: edgeInset,
      }}
      getItemLayout={(_, index) => ({
        index,
        length: cellWidth,
        offset: edgeInset + cellWidth * index,
      })}
      horizontal
      initialNumToRender={VISIBLE_COLUMNS + 2}
      keyExtractor={item => (item.kind === 'next' ? 'next' : item.dayKey)}
      onLayout={() => {
        if (selectedIndex >= 0) {
          listRef.current?.scrollToOffset({ animated: false, offset: offsetFor(selectedIndex) });
        }
      }}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, height: '100%' }}
    />
  );
}
