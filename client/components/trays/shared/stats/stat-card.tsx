import { memo } from 'react';
import { Text, View } from 'react-native';

import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

export type StatCellData = {
  fallback: SymbolFallback;
  icon: SymbolName;
  label: string;
  value: string;
};

export type StatPage = {
  cells: [StatCellData, StatCellData, StatCellData, StatCellData];
  fallback: SymbolFallback;
  icon: SymbolName;
  key: string;
  title: string;
};

function StatCell({ cell }: { cell: StatCellData }) {
  const { colors } = useSheetColors();

  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 4, paddingHorizontal: 6 }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
        <SfSymbol fallback={cell.fallback} name={cell.icon} size={13} tintColor={colors.mutedText} />
        <Text
          className="font-semibold"
          numberOfLines={1}
          style={[trayText.Subheadline, { color: colors.mutedText }]}
        >
          {cell.label}
        </Text>
      </View>
      <Text
        className="font-semibold"
        numberOfLines={1}
        style={[trayText.Title1, { color: colors.text, fontVariant: ['tabular-nums'] }]}
      >
        {cell.value}
      </Text>
    </View>
  );
}

function useDividerColor() {
  return useSheetColors().colors.cardDivider;
}

function StatPair({ cells }: { cells: [StatCellData, StatCellData] }) {
  const divider = useDividerColor();

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
      <StatCell cell={cells[0]} />
      <View style={{ backgroundColor: divider, height: 28, width: 1 }} />
      <StatCell cell={cells[1]} />
    </View>
  );
}

// a grey card with a two by two grid and its title in the step header
export const StatCard = memo(function StatCard({ page }: { page: StatPage }) {
  const { colors } = useSheetColors();
  const divider = useDividerColor();

  return (
    <View
      style={{
        backgroundColor: colors.controlBackground,
        borderCurve: 'continuous',
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 22,
      }}
    >
      <View style={{ gap: 14 }}>
        <StatPair cells={[page.cells[0], page.cells[1]]} />
        <View style={{ alignSelf: 'center', backgroundColor: divider, height: 1, width: '84%' }} />
        <StatPair cells={[page.cells[2], page.cells[3]]} />
      </View>
    </View>
  );
});
