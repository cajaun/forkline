import { Switch, Text, View } from 'react-native';

import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { CATEGORY_ROW_STYLE } from '../styles';

const SWITCH_SLOT_STYLE = {
  alignItems: 'center' as const,
  height: 64,
  justifyContent: 'center' as const,
};

export function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { colors } = useSheetColors();

  return (
    <View
      style={[
        CATEGORY_ROW_STYLE,
        {
          alignSelf: 'stretch',
          backgroundColor: colors.controlBackground,
          justifyContent: 'space-between',
        },
      ]}>
      <Text
        className="font-semibold"
        style={[trayText.Title2, { color: colors.text }]}
      >
        {label}
      </Text>
      <View style={SWITCH_SLOT_STYLE}>
        <Switch
          accessibilityLabel={label}
          ios_backgroundColor={value ? colors.icon : '#D7D7D7'}
          onValueChange={onValueChange}
          thumbColor="#FFFFFF"
          trackColor={{ false: '#D7D7D7', true: colors.icon }}
          value={value}
        />
      </View>
    </View>
  );
}
