import { memo } from 'react';
import { Text, View } from 'react-native';

import * as Haptics from 'expo-haptics';

import { SymbolView } from 'expo-symbols';
import { Tray, useTrayNavigation } from 'react-native-morpheus';
import { TRAY_PRIMARY_BUTTON_HEIGHT } from 'react-native-morpheus/constants';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { gameActions } from '@/stores/games';

const STEP_OPTIONS = {
  className: 'bg-[#FEFFFF] dark:bg-[#262626]',
  footerClassName: 'bg-[#FEFFFF] dark:bg-[#262626]',
};

function restart() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  gameActions.restartSelectedGame();
}

// the confirmation layout, a large symbol and close button over a title, copy and footer choice
function RestartBody() {
  const { close } = useTrayNavigation();
  const { colors } = useSheetColors();

  return (
    <Tray.Body style={{ paddingHorizontal: 0 }}>
      <View
        style={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 28,
          paddingTop: 24,
        }}>
        <View style={{ alignItems: 'flex-start', height: 68, justifyContent: 'center', width: 68 }}>
          <SfSymbol
            fallback="arrow-undo-outline"
            name="arrow.trianglehead.counterclockwise"
            size={58}
            tintColor={colors.weekdayText}
            weight="thin"
          />
        </View>
        <PressableScale
          accessibilityLabel="Close"
          onPress={close}
          style={{
            alignItems: 'center',
            backgroundColor: colors.controlBackground,
            borderRadius: 999,
            height: 36,
            justifyContent: 'center',
            width: 36,
          }}>
          <SymbolView
            name="xmark"
            size={18}
            tintColor={colors.trayIcon}
            type="palette"
            weight="bold"
          />
        </PressableScale>
      </View>

      <Tray.Section style={{ gap: 12, paddingHorizontal: 28 }}>
        <Text
          className="font-semibold"
          style={{ color: colors.text, fontSize: 28, letterSpacing: 0.1, lineHeight: 31 }}>
          Start over?
        </Text>
        <Text
          className="font-medium"
          style={{ color: colors.weekdayText, fontSize: 20, letterSpacing: 0.1, lineHeight: 28 }}>
          Every move in this game is cleared and its clock goes back to zero.
          Your settings for this game stay the same.
        </Text>
      </Tray.Section>
    </Tray.Body>
  );
}

function RestartFooter() {
  const { close } = useTrayNavigation();
  const { colors } = useSheetColors();
  const button = {
    alignItems: 'center' as const,
    borderRadius: 50,
    flex: 1,
    height: TRAY_PRIMARY_BUTTON_HEIGHT,
    justifyContent: 'center' as const,
  };

  return (
    <Tray.Footer style={{ width: '100%' }}>
      <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
        <PressableScale
          accessibilityLabel="Keep playing"
          onPress={close}
          style={[button, { backgroundColor: colors.controlBackground }]}>
          <Text className="font-bold" style={[trayText.Title3, { color: colors.text }]}>
            Keep playing
          </Text>
        </PressableScale>
        <PressableScale
          accessibilityLabel="Start over"
          onPress={() => {
            restart();
            close();
          }}
          style={[button, { backgroundColor: colors.playButton }]}>
          <Text
            className="font-bold"
            style={[trayText.Title3, { color: colors.playButtonForeground }]}>
            Start over
          </Text>
        </PressableScale>
      </View>
    </Tray.Footer>
  );
}

const FOOTER = <RestartFooter />;

// the undo button in the open game: asks before wiping the game
export const RestartTray = memo(function RestartTray({ size = 56 }: { size?: number }) {
  const { colors } = useSheetColors();

  return (
    <Tray.Root
      footer={FOOTER}
      stepOptions={STEP_OPTIONS}>
      <Tray.Trigger
        accessibilityLabel="Start over"
        haptics="selection"
        style={{
          alignItems: 'center',
          backgroundColor: colors.controlBackground,
          borderRadius: size / 2,
          height: size,
          justifyContent: 'center',
          width: size,
        }}>
        <SfSymbol
          fallback="arrow-undo-outline"
          name="arrow.trianglehead.counterclockwise"
          size={27}
          tintColor={colors.icon}
        />
      </Tray.Trigger>

      <Tray.Step key="restart">
        <RestartBody />
      </Tray.Step>
    </Tray.Root>
  );
});
