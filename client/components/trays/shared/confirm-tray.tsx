import { memo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Tray, useTrayNavigation } from 'react-native-morpheus';
import { TRAY_HEADER_CONTENT_HEIGHT } from 'react-native-morpheus/constants';

import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { SettingsCloseAction } from '@/components/trays/settings/components/settings-header';
import { TrayButton } from '@/components/trays/shared/tray-button';
import { TrayTriggerButton } from '@/components/trays/shared/tray-ui';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';

type ConfirmProps = {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  disabled?: boolean;
  fallback: SymbolFallback;
  icon: SymbolName;
  onConfirm: () => void;
  title: string;
};

// the close button lives in a real header so it morphs in place from the step before
export function ConfirmHeader() {
  return (
    <Tray.Header>
      <Tray.HeaderRow right={<SettingsCloseAction />}>
        <View />
      </Tray.HeaderRow>
    </Tray.Header>
  );
}

// a large muted symbol level with the header close button over the title and its explanation
export function ConfirmBody({
  body,
  fallback,
  icon,
  title,
}: Pick<ConfirmProps, 'body' | 'fallback' | 'icon' | 'title'>) {
  const { colors } = useSheetColors();

  return (
    <Tray.Body style={{ paddingHorizontal: 0 }}>
      <View
        style={{
          alignItems: 'flex-start',
          height: 68,
          justifyContent: 'center',
          marginTop: -TRAY_HEADER_CONTENT_HEIGHT,
          paddingHorizontal: 28,
          width: 68 + 28,
        }}
      >
        <SfSymbol fallback={fallback} name={icon} size={58} tintColor={colors.mutedText} weight="regular" />
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
  confirmLabel,
  disabled,
  onConfirm,
}: Pick<ConfirmProps, 'cancelLabel' | 'confirmLabel' | 'disabled' | 'onConfirm'>) {
  const { close } = useTrayNavigation();

  return (
    <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
      <TrayButton label={cancelLabel} onPress={close} style={{ flex: 1 }} />
      <TrayButton
        disabled={disabled}
        label={confirmLabel}
        onPress={() => {
          onConfirm();
          close();
        }}
        style={{ flex: 1 }}
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
  const { body, cancelLabel, confirmLabel, disabled, fallback, icon, onConfirm, title } = props;

  return (
    <Tray.Root stepOptions={TRAY_STEP_OPTIONS}>
      {presenter ?? (
        <TrayTriggerButton fallback={fallback} icon={icon} label={triggerLabel ?? title} size={size} />
      )}
      <Tray.Step key="confirm">
        <ConfirmHeader />
        <ConfirmBody body={body} fallback={fallback} icon={icon} title={title} />
        <Tray.Footer style={{ width: '100%' }}>
          <ConfirmButtons
            cancelLabel={cancelLabel}
            confirmLabel={confirmLabel}
            disabled={disabled}
            onConfirm={onConfirm}
          />
        </Tray.Footer>
      </Tray.Step>
    </Tray.Root>
  );
});
