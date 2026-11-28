import { Text } from 'react-native';

import { SymbolView } from 'expo-symbols';
import { Tray, useTrayNavigation } from 'react-native-morpheus';
import { TRAY_HEADER_CLOSE_ICON_SIZE } from 'react-native-morpheus/constants';

import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import type { SettingsInfoKey } from '../info-content';
import { SettingsInfoAction } from './settings-info';

const HEADER_SEPARATOR_GAP = 21;

// sub steps sit flat after their parent so going back can take several steps
function SettingsBackAction({ steps }: { steps: number }) {
  const { back } = useTrayNavigation();
  const { colors } = useSheetColors();

  return (
    <Tray.HeaderButton
      accessibilityLabel="Back"
      onPress={() => {
        for (let step = 0; step < steps; step += 1) {
          back();
        }
      }}
      style={{ backgroundColor: colors.controlBackground }}
    >
      <SymbolView
        name="chevron.left"
        type="palette"
        tintColor={colors.trayIcon}
        size={TRAY_HEADER_CLOSE_ICON_SIZE}
        weight="semibold"
      />
    </Tray.HeaderButton>
  );
}

export function SettingsCloseAction() {
  const { close } = useTrayNavigation();
  const { colors } = useSheetColors();

  return (
    <Tray.HeaderButton
      accessibilityLabel="Close"
      onPress={close}
      style={{ backgroundColor: colors.controlBackground }}
    >
      <SymbolView
        name="xmark"
        type="palette"
        tintColor={colors.trayIcon}
        size={TRAY_HEADER_CLOSE_ICON_SIZE}
        weight="bold"
      />
    </Tray.HeaderButton>
  );
}

export function SettingsHeader({
  title,
  backSteps = 0,
  info,
}: {
  title: string;
  backSteps?: number;
  // a key names a Settings explainer while true marks a step whose explainer another tray supplies
  info?: SettingsInfoKey | true;
}) {
  const { colors } = useSheetColors();
  const isSubStep = backSteps > 0;

  return (
    <Tray.Header style={{ gap: HEADER_SEPARATOR_GAP }}>
      <Tray.HeaderRow
        left={isSubStep ? <SettingsBackAction steps={backSteps} /> : undefined}
        right={isSubStep ? info ? <SettingsInfoAction /> : undefined : <SettingsCloseAction />}
      >
        <Text className="font-semibold" style={[trayText.Title1, { color: colors.text }]}>
          {title}
        </Text>
      </Tray.HeaderRow>
      <Tray.Separator style={{ backgroundColor: colors.traySeparator }} />
    </Tray.Header>
  );
}
