import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { useOutline } from './outline';

export function OptionCard({
  children,
  fallback,
  icon,
  title,
}: {
  children: ReactNode;
  fallback: SymbolFallback;
  icon: SymbolName;
  title: string;
}) {
  const { colors } = useSheetColors();
  const outline = useOutline();

  return (
    <View style={[outline, { gap: 14, padding: 14, paddingTop: 16 }]}>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 4 }}>
        <SfSymbol fallback={fallback} name={icon} size={18} tintColor={colors.icon} />
        <Text className="font-semibold" numberOfLines={1} style={[trayText.Title3, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}
