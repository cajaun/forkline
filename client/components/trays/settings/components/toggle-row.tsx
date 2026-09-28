import { Switch, Text, View } from 'react-native';

import { SHEET_COLORS } from '@/constants/sheet';
import { trayText } from '@/components/shared/tokens';

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
  return (
    <View
      style={[
        CATEGORY_ROW_STYLE,
        {
          alignSelf: 'stretch',
          justifyContent: 'space-between',
        },
      ]}>
      <Text className="font-semibold text-black" style={trayText.Title2}>
        {label}
      </Text>
      <View style={SWITCH_SLOT_STYLE}>
        <Switch
          accessibilityLabel={label}
          ios_backgroundColor={value ? SHEET_COLORS.icon : '#D7D7D7'}
          onValueChange={onValueChange}
          thumbColor="#FFFFFF"
          trackColor={{ false: '#D7D7D7', true: SHEET_COLORS.icon }}
          value={value}
        />
      </View>
    </View>
  );
}
