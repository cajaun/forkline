import { Text, View } from 'react-native';

import { SHEET_COLORS } from '@/constants/sheet';
import { AnimatedCheckmark } from '@/components/shared/animated-checkmark';
import { PressableScale } from '@/components/shared/pressable-scale';
import { trayText } from '@/components/shared/tokens';

import { CATEGORY_ROW_STYLE, CHOICE_ROW_STYLE } from '../styles';

export function ChoiceRow({
  label,
  selected,
  onPress,
  surface = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  surface?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      style={surface ? CHOICE_SURFACE_STYLE : CHOICE_ROW_STYLE}
    >
      <View className="flex-1 pr-3">
        <Text
          className="font-semibold text-black"
          style={surface ? trayText.Title3 : trayText.Headline}
        >
          {label}
        </Text>
      </View>
      <AnimatedCheckmark color={SHEET_COLORS.icon} selected={selected} />
    </PressableScale>
  );
}

const CHOICE_SURFACE_STYLE = {
  ...CATEGORY_ROW_STYLE,
  justifyContent: 'space-between' as const,
};
