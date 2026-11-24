import { Tray } from 'react-native-morpheus';

import { OptionCard, OptionNumbers } from '@/components/trays/shared/option-ui';

import { AGENT_LABELS, AGENT_OPTIONS } from '../constants';
import type { GameplaySettings } from '../types';

export type GameplayOptionsProps = GameplaySettings & {
  onChange: (changes: Partial<GameplaySettings>) => void;
};

const MIN_DEPTH = 1;
const MAX_DEPTH = 5;

export function GameplayOptions({ depths, onChange }: GameplayOptionsProps) {
  const setDepth = (agent: keyof typeof depths, value: number) => {
    onChange({ depths: { ...depths, [agent]: value } });
  };

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 12 }}>
        {AGENT_OPTIONS.map(option => (
          <OptionCard
            key={option.value}
            fallback={option.fallback}
            icon={option.icon}
            title={AGENT_LABELS[option.value]}
          >
            <OptionNumbers
              label={`${AGENT_LABELS[option.value]} depth`}
              max={MAX_DEPTH}
              min={MIN_DEPTH}
              onChange={value => setDepth(option.value, value)}
              value={depths[option.value]}
            />
          </OptionCard>
        ))}
      </Tray.Section>
    </Tray.Body>
  );
}
