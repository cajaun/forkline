import { Tray } from 'react-native-morpheus';

import { StepperRow } from '../components/stepper-row';
import { AGENT_LABELS, AGENT_OPTIONS } from '../constants';
import type { GameplaySettings } from '../types';

export type GameplayOptionsProps = GameplaySettings & {
  onChange: (changes: Partial<GameplaySettings>) => void;
};

export function GameplayOptions({ depths, onChange }: GameplayOptionsProps) {
  const setDepth = (agent: keyof typeof depths, value: number) => {
    onChange({ depths: { ...depths, [agent]: value } });
  };

  return (
    <Tray.Body>
      <Tray.Section>
        {AGENT_OPTIONS.map((option) => (
          <StepperRow
            key={option.value}
            fallback="speedometer-outline"
            icon="gauge.with.dots.needle.67percent"
            label={`${AGENT_LABELS[option.value]} depth`}
            max={5}
            min={1}
            onChange={(value) => setDepth(option.value, value)}
            value={depths[option.value]}
          />
        ))}
      </Tray.Section>
    </Tray.Body>
  );
}
