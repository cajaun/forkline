import { Text, View } from 'react-native';

import { AnimatedCheckmark } from '@/components/shared/animated-checkmark';
import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { CATEGORY_ROW_STYLE, CHOICE_ROW_STYLE } from '../styles';


export function ChoiceRow({
  fallback,
  icon,
  label,
  selected,
  onPress,
  surface = false,
}: {
  fallback?: SymbolFallback;
  icon?: SymbolName;
  label: string;
  selected: boolean;
  onPress: () => void;
  surface?: boolean;
}) {
  const { colors } = useSheetColors();

  return (
    <PressableScale
      onPress={onPress}
      style={
        surface
          ? [CHOICE_SURFACE_STYLE, { backgroundColor: colors.controlBackground }]
          : CHOICE_ROW_STYLE
      }
    >
      {icon && fallback ? (
        // fixed-width slot so every label starts at the same x
        <View style={{ alignItems: 'center', marginRight: 14, width: 28 }}>
          <SfSymbol fallback={fallback} name={icon} size={24} tintColor={colors.icon} />
        </View>
      ) : null}
      <View className="flex-1 pr-3">
        <Text
          className="font-semibold"
          style={[
            surface ? trayText.Title3 : trayText.Headline,
            { color: colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
      <AnimatedCheckmark color={colors.icon} selected={selected} />
    </PressableScale>
  );
}

const CHOICE_SURFACE_STYLE = {
  ...CATEGORY_ROW_STYLE,
  justifyContent: 'space-between' as const,
};
