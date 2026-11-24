import { Switch, View } from 'react-native';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { OutlinedRowShell, ROW_LAYOUT, useOutline } from './outline';

export function OptionLink({
  disabled = false,
  ...props
}: {
  disabled?: boolean;
  fallback: SymbolFallback;
  icon: SymbolName;
  onPress: () => void;
  title: string;
  value?: string;
}) {
  const { colors } = useSheetColors();
  const outline = useOutline();

  return (
    <PressableScale
      accessibilityLabel={props.title}
      onPress={disabled ? undefined : props.onPress}
      style={[outline, ROW_LAYOUT, disabled ? { opacity: 0.4 } : null]}>
      <OutlinedRowShell {...props}>
        <SfSymbol fallback="chevron-forward" name="chevron.right" size={15} tintColor={colors.trayIcon} />
      </OutlinedRowShell>
    </PressableScale>
  );
}

export function OptionSwitch({
  onChange,
  on,
  ...row
}: {
  fallback: SymbolFallback;
  icon: SymbolName;
  on: boolean;
  onChange: (on: boolean) => void;
  title: string;
  value?: string;
}) {
  const { colors } = useSheetColors();
  const outline = useOutline();

  return (
    <View style={[outline, ROW_LAYOUT]}>
      <OutlinedRowShell {...row}>
        <Switch
          accessibilityLabel={row.title}
          ios_backgroundColor={colors.controlBackground}
          onValueChange={onChange}
          thumbColor="#FFFFFF"
          trackColor={{ false: colors.controlBackground, true: colors.icon }}
          value={on}
        />
      </OutlinedRowShell>
    </View>
  );
}
