import { Text, View } from 'react-native';

import { SymbolView } from 'expo-symbols';
import { Tray, useTrayNavigation } from 'react-native-morpheus';
import { TRAY_HEADER_CLOSE_ICON_SIZE } from 'react-native-morpheus/constants';

import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { SETTINGS_INFO, type SettingsInfoKey } from '../info-content';

export function SettingsInfoAction() {
  const { next } = useTrayNavigation();
  const { colors } = useSheetColors();

  return (
    <Tray.HeaderButton
      accessibilityLabel="About these settings"
      onPress={next}
      style={{ backgroundColor: colors.controlBackground }}
    >
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

export function SettingsInfoBody({ info }: { info: SettingsInfoKey }) {
  const { colors } = useSheetColors();
  const content = SETTINGS_INFO[info];

  return (
    <Tray.Body>
      <Tray.Section>
        <View
          style={{
            backgroundColor: colors.controlBackground,
            borderCurve: 'continuous',
            borderRadius: 28,
            gap: 22,
            paddingHorizontal: 22,
            paddingVertical: 24,
          }}
        >
          {content.items.map(item => (
            <View key={item.title} style={{ gap: 6 }}>
              <Text className="font-semibold" style={[trayText.Title2, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text className="font-medium" style={[trayText.Title3, { color: colors.mutedText }]}>
                {item.body}
              </Text>
            </View>
          ))}
        </View>
      </Tray.Section>
    </Tray.Body>
  );
}
