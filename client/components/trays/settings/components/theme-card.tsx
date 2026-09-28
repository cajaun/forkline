import { Text } from 'react-native';

import type { SymbolWeight } from 'expo-symbols';

import { SHEET_COLORS } from '@/constants/sheet';
import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';

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
  const iconWeight: SymbolWeight = icon === 'iphone' ? 'light' : 'regular';

  return (
    <PressableScale
      accessibilityLabel={`${label} theme`}
      onPress={onPress}
      style={[
        THEME_CARD_STYLE,
        selected
          ? { backgroundColor: '#F7F7F7', borderColor: SHEET_COLORS.icon }
          : null,
      ]}>
      <SfSymbol
        fallback={fallback}
        name={icon}
        size={48}
        tintColor={SHEET_COLORS.icon}
        weight={iconWeight}
      />
      <Text className="font-semibold text-black" style={trayText.Title3}>
        {label}
      </Text>
    </PressableScale>
  );
}
