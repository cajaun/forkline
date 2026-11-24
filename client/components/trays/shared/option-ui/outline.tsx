import { type ReactNode } from 'react';
import { type ImageSourcePropType, Text, View } from 'react-native';

import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

// the outlined surface fills in grey once chosen
export function useOutline(selected = false) {
  const { colors } = useSheetColors();
  return {
    backgroundColor: selected ? colors.controlBackground : colors.background,
    borderColor: colors.controlBackground,
    borderCurve: 'continuous' as const,
    borderRadius: 24,
    borderWidth: 2,
  };
}

export type Visual = { fallback: SymbolFallback; icon: SymbolName } | { image: ImageSourcePropType };

export function OutlinedRowShell({
  children,
  fallback,
  icon,
  title,
  value,
}: {
  children?: ReactNode;
  fallback: SymbolFallback;
  icon: SymbolName;
  title: string;
  value?: string;
}) {
  const { colors } = useSheetColors();

  return (
    <>
      <View style={{ alignItems: 'center', width: 28 }}>
        <SfSymbol fallback={fallback} name={icon} size={22} tintColor={colors.icon} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text className="font-semibold" numberOfLines={1} style={[trayText.Title2, { color: colors.text }]}>
          {title}
        </Text>
        {value ? (
          <Text className="font-medium" numberOfLines={1} style={[trayText.Body, { color: colors.mutedText }]}>
            {value}
          </Text>
        ) : null}
      </View>
      {children}
    </>
  );
}

export const ROW_LAYOUT = {
  alignItems: 'center' as const,
  flexDirection: 'row' as const,
  gap: 14,
  minHeight: 76,
  paddingHorizontal: 18,
  paddingVertical: 10,
};
