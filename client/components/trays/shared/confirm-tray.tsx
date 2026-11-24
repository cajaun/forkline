import { memo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { SymbolView } from 'expo-symbols';
import { Tray, useTrayNavigation } from 'react-native-morpheus';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { TrayButton } from '@/components/trays/shared/tray-button';
import { TrayTriggerButton } from '@/components/trays/shared/tray-ui';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';

type ConfirmProps = {
  body: string;
  cancelLabel: string;
  confirmColor?: string;
  confirmLabel: string;
  confirmTextColor?: string;
  disabled?: boolean;
  fallback: SymbolFallback;
  icon: SymbolName;
  onConfirm: () => void;
  title: string;
};

// a large muted symbol and a close button over the title and its explanation
export function ConfirmBody({
  body,
  fallback,
  icon,
  title,
}: Pick<ConfirmProps, 'body' | 'fallback' | 'icon' | 'title'>) {
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
          <SfSymbol fallback={fallback} name={icon} size={58} tintColor={colors.mutedText} weight="regular" />
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
          <SymbolView name="xmark" size={18} tintColor={colors.trayIcon} type="palette" weight="bold" />
        </PressableScale>
      </View>

      <Tray.Section style={{ gap: 12, paddingHorizontal: 28 }}>
        <Text className="font-semibold" style={[trayText.LargeTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text className="font-medium" style={[trayText.Title3, { color: colors.mutedText }]}>
          {body}
        </Text>
      </Tray.Section>
    </Tray.Body>
  );
}

function ConfirmButtons({
  cancelLabel,
  confirmColor,
  confirmLabel,
  confirmTextColor,
  disabled,
  onConfirm,
}: Pick<
  ConfirmProps,
  'cancelLabel' | 'confirmColor' | 'confirmLabel' | 'confirmTextColor' | 'disabled' | 'onConfirm'
>) {
  const { close } = useTrayNavigation();

  return (
    <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
      <TrayButton label={cancelLabel} onPress={close} style={{ flex: 1 }} />
      <TrayButton
        color={confirmColor}
        disabled={disabled}
        label={confirmLabel}
        onPress={() => {
          onConfirm();
          close();
        }}
        style={{ flex: 1 }}
        textColor={confirmTextColor}
        tone="primary"
      />
    </View>
  );
}

// opens from a round trigger or from a presenter that opens it in code
export const ConfirmTray = memo(function ConfirmTray({
  presenter,
  size = 56,
  triggerLabel,
  ...props
}: ConfirmProps & { presenter?: ReactNode; size?: number; triggerLabel?: string }) {
  const {
    body,
    cancelLabel,
    confirmColor,
    confirmLabel,
    confirmTextColor,
    disabled,
    fallback,
    icon,
    onConfirm,
    title,
  } = props;

  return (
    <Tray.Root stepOptions={TRAY_STEP_OPTIONS}>
      {presenter ?? (
        <TrayTriggerButton fallback={fallback} icon={icon} label={triggerLabel ?? title} size={size} />
      )}
      <Tray.Step key="confirm">
        <ConfirmBody body={body} fallback={fallback} icon={icon} title={title} />
        <Tray.Footer style={{ width: '100%' }}>
          <ConfirmButtons
            cancelLabel={cancelLabel}
            confirmColor={confirmColor}
            confirmLabel={confirmLabel}
            confirmTextColor={confirmTextColor}
            disabled={disabled}
            onConfirm={onConfirm}
          />
        </Tray.Footer>
      </Tray.Step>
    </Tray.Root>
  );
});
