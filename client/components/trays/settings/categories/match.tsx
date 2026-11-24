import { Tray } from 'react-native-morpheus';

import { OptionCard, OptionStepper, OptionSwitch } from '@/components/trays/shared/option-ui';

import type { MatchSettings } from '../types';

export type MatchOptionsProps = MatchSettings & {
  onChange: (changes: Partial<MatchSettings>) => void;
};

export function MatchOptions({ alternateColors, games, onChange }: MatchOptionsProps) {
  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 12 }}>
        <OptionCard fallback="game-controller-outline" icon="number.square" title="Games per match">
          <OptionStepper label="games" max={20} min={5} onChange={value => onChange({ games: value })} value={games} />
        </OptionCard>
        <OptionSwitch
          fallback="swap-horizontal"
          icon="arrow.left.arrow.right"
          on={alternateColors}
          onChange={value => onChange({ alternateColors: value })}
          title="Alternate colours"
          value="The AIs swap White each game"
        />
      </Tray.Section>
    </Tray.Body>
  );
}
