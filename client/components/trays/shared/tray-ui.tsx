import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Tray } from 'react-native-morpheus';

import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { roundButtonStyle } from '@/components/trays/shared/tray-style';
import { useSheetColors } from '@/hooks/use-sheet-colors';

export function TrayTriggerButton({
  fallback,
  icon,
  label,
  size,
}: {
  fallback: SymbolFallback;
  icon: SymbolName;
  label: string;
  size: number;
}) {
  const { colors } = useSheetColors();

  return (
    <Tray.Trigger
      accessibilityLabel={label}
      haptics="selection"
      style={roundButtonStyle(size, colors.controlBackground)}>
      <SfSymbol fallback={fallback} name={icon} size={Math.round(size * 0.5)} tintColor={colors.icon} />
    </Tray.Trigger>
  );
}

export function TrayCard({ children }: { children: ReactNode }) {
  const { colors } = useSheetColors();

  return (
    <View
      style={{
        backgroundColor: colors.controlBackground,
        borderCurve: 'continuous',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 6,
      }}>
      {children}
    </View>
  );
}
