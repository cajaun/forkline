import { memo } from 'react';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { roundButtonStyle } from '@/components/trays/shared/tray-style';
import { useSheetColors } from '@/hooks/use-sheet-colors';

const BADGE_RATIO = 0.46;
const BADGE_RING = 3;

// asks the AI for a move on the human turn and dims while the server searches
export const HintButton = memo(function HintButton({
  enabled,
  hintsLeft,
  onPress,
  size = 56,
  thinking,
}: {
  enabled: boolean;
  hintsLeft: number;
  onPress: () => void;
  size?: number;
  thinking: boolean;
}) {
  const { colors } = useSheetColors();
  const active = enabled && !thinking;
  const badge = Math.round(size * BADGE_RATIO);

  return (
    <View style={{ height: size, width: size }}>
      <PressableScale
        accessibilityLabel={`Hint, ${hintsLeft} left`}
        onPress={active ? onPress : undefined}
        // a hint on its way ignores taps without dimming the button
        style={[roundButtonStyle(size, colors.controlBackground), { opacity: enabled ? 1 : 0.4 }]}
      >
        <SfSymbol
          fallback="bulb-outline"
          name="lightbulb.fill"
          size={Math.round(size * 0.5)}
          tintColor={colors.icon}
        />
      </PressableScale>
      {/* the badge counts the hints left and its ring in the sheet colour cuts it out of the button */}
      <View
        pointerEvents="none"
        style={[
          roundButtonStyle(badge + BADGE_RING * 2, colors.background),
          { position: 'absolute', right: -badge * 0.32, top: -badge * 0.32 },
        ]}
      >
        <View style={roundButtonStyle(badge, colors.controlBackground)}>
          <Text
            style={{
              color: colors.text,
              fontSize: badge * 0.58,
              fontVariant: ['tabular-nums'],
              fontWeight: '800',
            }}
          >
            {hintsLeft}
          </Text>
        </View>
      </View>
    </View>
  );
});
