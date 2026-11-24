import { Tray, useTrayNavigation, useTrayNavigationState } from 'react-native-morpheus';

import { useKingImages } from '@/components/trays/shared/king-images';
import { OptionGrid, OptionLink, OptionTile } from '@/components/trays/shared/option-ui';

import {
  AGENT_OPTIONS,
  GAME_MODE_OPTIONS,
  HUMAN_COLOR_OPTIONS,
  SETTINGS_STEP_INDEX,
} from '../constants';
import type { GameSettings } from '../types';

export type GameOptionsProps = GameSettings & {
  modeLocked?: boolean;
  onChange: (changes: Partial<GameSettings>) => void;
};

const labelOf = <T extends { label: string; value: string }>(options: readonly T[], value: string) =>
  options.find(option => option.value === value)?.label;

export function GameOptions({ agent, gameMode, humanColor }: GameOptionsProps) {
  const { next } = useTrayNavigation();
  const index = useTrayNavigationState(state => state.index);
  const openStep = (targetStep: number) => {
    for (let step = index; step < targetStep; step += 1) next();
  };

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 10 }}>
        <OptionLink
          fallback="game-controller-outline"
          icon="gamecontroller"
          onPress={() => openStep(SETTINGS_STEP_INDEX.gameMode)}
          title="Game mode"
          value={labelOf(GAME_MODE_OPTIONS, gameMode)}
        />
        {gameMode === 'human-vs-agent' ? (
          <OptionLink
            fallback="person-outline"
            icon="person"
            onPress={() => openStep(SETTINGS_STEP_INDEX.playAs)}
            title="Play as"
            value={labelOf(HUMAN_COLOR_OPTIONS, humanColor)}
          />
        ) : null}
        <OptionLink
          fallback="sparkles-outline"
          icon="sparkles"
          onPress={() => openStep(SETTINGS_STEP_INDEX.aiStrategy)}
          title="AI strategy"
          value={labelOf(AGENT_OPTIONS, agent)}
        />
      </Tray.Section>
    </Tray.Body>
  );
}

export function GameModeOptions({ gameMode, onChange }: GameOptionsProps) {
  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 14 }}>
        <OptionGrid>
          {GAME_MODE_OPTIONS.map(option => (
            <OptionTile
              key={option.value}
              label={option.label}
              onPress={() => onChange({ gameMode: option.value })}
              selected={gameMode === option.value}
              visual={{ fallback: option.fallback, icon: option.icon }}
            />
          ))}
        </OptionGrid>
      </Tray.Section>
    </Tray.Body>
  );
}

export function HumanColorOptions({ humanColor, onChange }: GameOptionsProps) {
  const kings = useKingImages();

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 14 }}>
        <OptionGrid>
          {HUMAN_COLOR_OPTIONS.map(option => (
            <OptionTile
              key={option.value}
              label={option.label}
              onPress={() => onChange({ humanColor: option.value })}
              selected={humanColor === option.value}
              visual={{ image: kings[option.value] }}
            />
          ))}
        </OptionGrid>
      </Tray.Section>
    </Tray.Body>
  );
}

export function AgentOptions({ agent, onChange }: GameOptionsProps) {
  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 14 }}>
        <OptionGrid>
          {AGENT_OPTIONS.map(option => (
            <OptionTile
              key={option.value}
              label={option.label}
              onPress={() => onChange({ agent: option.value })}
              selected={agent === option.value}
              visual={{ fallback: option.fallback, icon: option.icon }}
            />
          ))}
        </OptionGrid>
      </Tray.Section>
    </Tray.Body>
  );
}
