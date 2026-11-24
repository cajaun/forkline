import { useCallback } from 'react';

import { Tray } from 'react-native-morpheus';

import { OptionSwitch } from '@/components/trays/shared/option-ui';
import { selectionAsync, setHapticsEnabled } from '@/services/haptics';
import { saveHapticsOn } from '@/services/preferences';

import type { HapticsSettings } from '../types';

export type HapticsOptionsProps = HapticsSettings & {
  onChange: (changes: Partial<HapticsSettings>) => void;
};

export function HapticsOptions({ on, onChange }: HapticsOptionsProps) {
  const toggle = useCallback(
    (next: boolean) => {
      setHapticsEnabled(next);
      onChange({ on: next });
      void saveHapticsOn(next);
      // switching them on answers with a tap so the change is felt at once
      void selectionAsync();
    },
    [onChange],
  );

  return (
    <Tray.Body>
      <Tray.Section>
        <OptionSwitch
          fallback="pulse-outline"
          icon="iphone.radiowaves.left.and.right"
          on={on}
          onChange={toggle}
          title="Haptics"
          value={on ? 'Taps on moves and buttons' : 'Off everywhere'}
        />
      </Tray.Section>
    </Tray.Body>
  );
}
