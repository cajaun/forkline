import { Text } from 'react-native';

import type { SymbolWeight } from 'expo-symbols';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { THEME_CARD_STYLE } from '../styles';

type SymbolName = Parameters<typeof SfSymbol>[0]['name'];
type SymbolFallback = Parameters<typeof SfSymbol>[0]['fallback'];

export function ThemeCard({
  icon,
  fallback,
  label,
  selected,
  onPress,
}: {
  icon: SymbolName;
  fallback: SymbolFallback;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useSheetColors();
  const iconWeight: SymbolWeight = icon === 'iphone' ? 'light' : 'regular';

  return (
    <PressableScale
      accessibilityLabel={`${label} theme`}
      onPress={onPress}
      style={[
        THEME_CARD_STYLE,
        {
          backgroundColor: colors.background,
          borderColor: colors.controlBackground,
        },
        selected
          ? {
              backgroundColor: colors.controlBackground,
              borderColor: colors.controlBackground,
            }
          : null,
      ]}>
      <SfSymbol
        fallback={fallback}
        name={icon}
        size={48}
        tintColor={colors.icon}
        weight={iconWeight}
      />
      <Text
        className="font-semibold"
        style={[trayText.Title3, { color: colors.text }]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
