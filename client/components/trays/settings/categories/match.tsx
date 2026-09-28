import { Tray } from 'react-native-morpheus';

import { StepperRow } from '../components/stepper-row';
import { ToggleRow } from '../components/toggle-row';
import type { MatchSettings } from '../types';

export type MatchOptionsProps = MatchSettings & {
  onChange: (changes: Partial<MatchSettings>) => void;
};

export function MatchOptions({
  games,
  alternateColors,
  onChange,
}: MatchOptionsProps) {
  return (
    <Tray.Body>
      <Tray.Section>
        <ToggleRow
          label="Alternate colors"
          onValueChange={(value) => onChange({ alternateColors: value })}
          value={alternateColors}
        />
        <StepperRow
          fallback="game-controller-outline"
          icon="number.square"
          label="Games per match"
          max={20}
          min={5}
          onChange={(value) => onChange({ games: value })}
          value={games}
        />
      </Tray.Section>
    </Tray.Body>
  );
}
