import { memo } from 'react';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { roundButtonStyle } from '@/components/trays/shared/tray-style';
import { useSheetColors } from '@/hooks/use-sheet-colors';

// asks the AI for a move on the human turn and dims while the server searches
export const HintButton = memo(function HintButton({
  enabled,
  onPress,
  size = 56,
  thinking,
}: {
  enabled: boolean;
  onPress: () => void;
  size?: number;
  thinking: boolean;
}) {
  const { colors } = useSheetColors();

  return (
    <PressableScale
      accessibilityLabel="Hint"
      onPress={enabled && !thinking ? onPress : undefined}
      style={[roundButtonStyle(size, colors.controlBackground), { opacity: enabled && !thinking ? 1 : 0.4 }]}>
      <SfSymbol fallback="bulb-outline" name="lightbulb.fill" size={Math.round(size * 0.5)} tintColor={colors.icon} />
    </PressableScale>
  );
});
