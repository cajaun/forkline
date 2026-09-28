import { Text, View } from 'react-native';

import { SHEET_COLORS } from '@/constants/sheet';
import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';

import { STEPPER_BUTTON_STYLE, STEPPER_SHELL_STYLE } from '../styles';

type SymbolName = Parameters<typeof SfSymbol>[0]['name'];
type SymbolFallback = Parameters<typeof SfSymbol>[0]['fallback'];

export function StepperRow({
  icon,
  fallback,
  label,
  value,
  min,
  max,
  onChange,
}: {
  icon: SymbolName;
  fallback: SymbolFallback;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3 px-4">
        <SfSymbol
          fallback={fallback}
          name={icon}
          size={24}
          tintColor={SHEET_COLORS.icon}
        />
        <Text className="font-semibold text-black" style={trayText.Headline}>
          {label}
        </Text>
      </View>
      <View style={STEPPER_SHELL_STYLE}>
        <PressableScale
          accessibilityLabel={`Decrease ${label}`}
          onPress={() => onChange(Math.max(min, value - 1))}
          style={STEPPER_BUTTON_STYLE}>
          <SfSymbol
            fallback="remove"
            name="minus"
            size={22}
            tintColor={SHEET_COLORS.icon}
            weight="bold"
          />
        </PressableScale>
        <Text className="font-semibold text-[#666666]" style={trayText.Title1}>
          {value}
        </Text>
        <PressableScale
          accessibilityLabel={`Increase ${label}`}
          onPress={() => onChange(Math.min(max, value + 1))}
          style={STEPPER_BUTTON_STYLE}>
          <SfSymbol
            fallback="add"
            name="plus"
            size={22}
            tintColor={SHEET_COLORS.icon}
            weight="bold"
          />
        </PressableScale>
      </View>
    </View>
  );
}
