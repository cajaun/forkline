import { Text } from 'react-native';

import { SymbolView } from 'expo-symbols';
import { Tray, useTrayFlow } from 'react-native-morpheus';
import { TRAY_HEADER_CLOSE_ICON_SIZE } from 'react-native-morpheus/constants';

import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

export function SettingsHeader({
  title,
  backSteps = 0,
}: {
  title: string;
  backSteps?: number;
}) {
  const { back, close, index } = useTrayFlow();
  const { colors } = useSheetColors();
  const handleClose =
    backSteps > 0
      ? () => {
          for (let step = 0; step < backSteps; step += 1) {
            back();
          }
        }
      : index > 0
        ? back
        : close;

  return (
    <Tray.Header style={{ gap: 21 }}>
      <Tray.HeaderRow style={{ justifyContent: 'flex-start', gap: 12 }}>
        <Text
          className="flex-1 font-semibold text-left"
          style={[trayText.Title1, { color: colors.text }]}>
          {title}
        </Text>
        <Tray.HeaderCloseButton
          onPress={handleClose}
          style={{ backgroundColor: colors.controlBackground }}>
          <SymbolView
            name="xmark"
            type="palette"
            tintColor={colors.icon}
            size={TRAY_HEADER_CLOSE_ICON_SIZE}
            weight="bold"
          />
        </Tray.HeaderCloseButton>
      </Tray.HeaderRow>
      <Tray.Separator style={{ backgroundColor: colors.controlBackground }} />
    </Tray.Header>
  );
}
