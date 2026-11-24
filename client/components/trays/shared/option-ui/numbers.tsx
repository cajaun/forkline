import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/shared/pressable-scale';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { useOutline } from './outline';

export function OptionNumbers({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  const { colors } = useSheetColors();
  const numbers = Array.from({ length: max - min + 1 }, (_, offset) => min + offset);

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {numbers.map(number => (
        <NumberTile
          key={number}
          label={`${label} ${number}`}
          onPress={() => onChange(number)}
          selected={number === value}
        >
          <Text
            className="font-semibold"
            style={[trayText.Title2, { color: colors.text, fontVariant: ['tabular-nums'] }]}
          >
            {number}
          </Text>
        </NumberTile>
      ))}
    </View>
  );
}

function NumberTile({
  children,
  label,
  onPress,
  selected,
}: {
  children: ReactNode;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const outline = useOutline(selected);

  return (
    <PressableScale
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        outline,
        { alignItems: 'center', borderRadius: 18, flex: 1, height: 52, justifyContent: 'center' },
      ]}
    >
      {children}
    </PressableScale>
  );
}
