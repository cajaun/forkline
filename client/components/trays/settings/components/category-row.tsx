import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { CATEGORY_ROW_STYLE } from '../styles';


export function CategoryRow({
  icon,
  fallback,
  title,
  subtitle,
  onPress,
}: {
  icon: SymbolName;
  fallback: SymbolFallback;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const { colors } = useSheetColors();

  return (
    <PressableScale
      accessibilityLabel={`${title} settings`}
      onPress={onPress}
      style={[CATEGORY_ROW_STYLE, { backgroundColor: colors.controlBackground }]}>
      <SfSymbol
        fallback={fallback}
        name={icon}
        size={24}
        tintColor={colors.icon}
      />
      <TextContainer>
        <Text
          className="font-semibold"
          style={[
            subtitle ? trayText.Title3 : trayText.Title2,
            { color: colors.text },
          ]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="font-semibold"
            style={[trayText.Footnote, { color: colors.text, opacity: 0.65 }]}>
            {subtitle}
          </Text>
        ) : null}
      </TextContainer>
    </PressableScale>
  );
}

function TextContainer({ children }: { children: ReactNode }) {
  return <View className="ml-3 flex-1">{children}</View>;
}
