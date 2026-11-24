import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
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
        <NumberTile key={number} label={`${label} ${number}`} onPress={() => onChange(number)} selected={number === value}>
          <Text className="font-semibold" style={[trayText.Title2, { color: colors.text, fontVariant: ['tabular-nums'] }]}>
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
      style={[outline, { alignItems: 'center', borderRadius: 18, flex: 1, height: 52, justifyContent: 'center' }]}>
      {children}
    </PressableScale>
  );
}

export function OptionStepper({
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

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
      <NumberTile label={`Fewer ${label}`} onPress={() => onChange(Math.max(min, value - 1))} selected={false}>
        <SfSymbol fallback="remove" name="minus" size={18} tintColor={colors.icon} weight="bold" />
      </NumberTile>
      <Text
        className="font-semibold"
        style={[trayText.Title1, { color: colors.text, flex: 1.4, fontVariant: ['tabular-nums'], textAlign: 'center' }]}>
        {value}
      </Text>
      <NumberTile label={`More ${label}`} onPress={() => onChange(Math.min(max, value + 1))} selected={false}>
        <SfSymbol fallback="add" name="plus" size={18} tintColor={colors.icon} weight="bold" />
      </NumberTile>
    </View>
  );
}
