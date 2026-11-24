import { Children, type ReactNode } from 'react';
import { Image, Text, View } from 'react-native';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { type Visual, useOutline } from './outline';

export function OptionTile({
  label,
  onPress,
  selected = false,
  visual,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  visual: Visual;
}) {
  const { colors } = useSheetColors();
  const outline = useOutline(selected);

  return (
    <PressableScale
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        outline,
        { alignItems: 'center', flex: 1, gap: 8, justifyContent: 'center', minHeight: 116, padding: 14 },
      ]}
    >
      {'image' in visual ? (
        <Image source={visual.image} style={{ height: 52, width: 52 }} />
      ) : (
        <View style={{ alignItems: 'center', height: 52, justifyContent: 'center' }}>
          <SfSymbol fallback={visual.fallback} name={visual.icon} size={34} tintColor={colors.icon} />
        </View>
      )}
      <Text
        className="font-semibold"
        numberOfLines={2}
        style={[trayText.Title3, { color: colors.text, textAlign: 'center' }]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

// an empty slot keeps a short last row at the same tile width
export function OptionGrid({ children, columns = 2 }: { children: ReactNode; columns?: number }) {
  const tiles = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let start = 0; start < tiles.length; start += columns) rows.push(tiles.slice(start, start + columns));

  return (
    <View style={{ gap: 12 }}>
      {rows.map((row, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: 12 }}>
          {row}
          {Array.from({ length: columns - row.length }, (_, slot) => (
            <View key={`slot-${slot}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}
