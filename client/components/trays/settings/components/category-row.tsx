import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { SHEET_COLORS } from '@/constants/sheet';
import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';

import { CATEGORY_ROW_STYLE } from '../styles';

type SymbolName = Parameters<typeof SfSymbol>[0]['name'];
type SymbolFallback = Parameters<typeof SfSymbol>[0]['fallback'];

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
  return (
    <PressableScale
      accessibilityLabel={`${title} settings`}
      onPress={onPress}
      style={CATEGORY_ROW_STYLE}>
      <SfSymbol
        fallback={fallback}
        name={icon}
        size={24}
        tintColor={SHEET_COLORS.icon}
      />
      <TextContainer>
        <Text
          className="font-semibold text-black"
          style={subtitle ? trayText.Title3 : trayText.Title2}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-semibold text-[#777777]" style={trayText.Footnote}>
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
