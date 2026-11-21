import { Text, View } from 'react-native';

import { SymbolView } from 'expo-symbols';
import { Tray, useTrayNavigation } from 'react-native-morpheus';
import { TRAY_HEADER_CLOSE_ICON_SIZE } from 'react-native-morpheus/constants';

import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { SETTINGS_INFO, type SettingsInfoKey } from '../info-content';

// the header's ? moves one step forward, onto the info step that follows every settings step
export function SettingsInfoAction() {
  const { next } = useTrayNavigation();
  const { colors } = useSheetColors();

  return (
    <Tray.HeaderButton
      accessibilityLabel="About these settings"
      onPress={next}
      style={{ backgroundColor: colors.controlBackground }}>
      <SymbolView
        name="questionmark"
        size={TRAY_HEADER_CLOSE_ICON_SIZE}
        tintColor={colors.trayIcon}
        type="palette"
        weight="bold"
      />
    </Tray.HeaderButton>
  );
}

// body of an info step: what the settings on the previous step do
export function SettingsInfoBody({ info }: { info: SettingsInfoKey }) {
  const { colors } = useSheetColors();
  const content = SETTINGS_INFO[info];

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 20 }}>
        <Text className="font-medium" style={[trayText.Title3, { color: colors.weekdayText }]}>
          {content.subtitle}
        </Text>
        {content.items.map(item => (
          <View key={item.title} style={{ gap: 4 }}>
            <Text className="font-semibold" style={[trayText.Title2, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text className="font-medium" style={[trayText.Title3, { color: colors.weekdayText }]}>
              {item.body}
            </Text>
          </View>
        ))}
      </Tray.Section>
    </Tray.Body>
  );
}
