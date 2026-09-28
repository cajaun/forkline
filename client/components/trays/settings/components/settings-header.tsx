import { Text } from 'react-native';

import { SymbolView } from 'expo-symbols';
import { Tray, useTrayFlow } from 'react-native-morpheus';
import { TRAY_HEADER_CLOSE_ICON_SIZE } from 'react-native-morpheus/constants';

import { trayText } from '@/components/shared/tokens';

export function SettingsHeader({
  title,
  backSteps = 0,
}: {
  title: string;
  backSteps?: number;
}) {
  const { back, close, index } = useTrayFlow();
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
    <Tray.Header withSeparator>
      <Tray.HeaderRow style={{ justifyContent: 'flex-start', gap: 12 }}>
        <Text
          className="flex-1 font-semibold text-left text-black"
          style={trayText.Title1}>
          {title}
        </Text>
        <Tray.HeaderCloseButton onPress={handleClose}>
          <SymbolView
            name="xmark"
            type="palette"
            tintColor="#787878"
            size={TRAY_HEADER_CLOSE_ICON_SIZE}
            weight="bold"
          />
        </Tray.HeaderCloseButton>
      </Tray.HeaderRow>
    </Tray.Header>
  );
}
