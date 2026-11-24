import { Text, type StyleProp, type ViewStyle } from 'react-native';

import { TRAY_PRIMARY_BUTTON_HEIGHT } from 'react-native-morpheus/constants';

import { PressableScale } from '@/components/shared/pressable-scale';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

// the pill button the tray footers share
export function TrayButton({
  color,
  disabled = false,
  label,
  onPress,
  style,
  textColor,
  tone = 'muted',
}: {
  color?: string;
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  tone?: 'muted' | 'primary';
}) {
  const { colors } = useSheetColors();
  const primary = tone === 'primary';

  return (
    <PressableScale
      accessibilityLabel={label}
      onPress={disabled ? undefined : onPress}
      style={[
        {
          alignItems: 'center',
          backgroundColor: color ?? (primary ? colors.playButton : colors.controlBackground),
          borderRadius: TRAY_PRIMARY_BUTTON_HEIGHT / 2,
          height: TRAY_PRIMARY_BUTTON_HEIGHT,
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Text
        className="font-semibold"
        style={[
          trayText.Button,
          { color: textColor ?? (primary ? colors.playButtonForeground : colors.text) },
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
