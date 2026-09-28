import type { ReactNode } from 'react';

import { Tray, useTrayFlow } from 'react-native-morpheus';

import { CategoryRow } from '../components/category-row';
import { ChoiceRow } from '../components/choice-row';
import {
  AGENT_OPTIONS,
  GAME_MODE_OPTIONS,
  HUMAN_COLOR_OPTIONS,
  SETTINGS_STEP_INDEX,
} from '../constants';
import type { GameSettings } from '../types';

export type GameOptionsProps = GameSettings & {
  onChange: (changes: Partial<GameSettings>) => void;
};

export function GameOptions({
  gameMode,
  humanColor,
  agent,
  onChange,
}: GameOptionsProps) {
  const { index, next } = useTrayFlow();
  const openStep = (targetStep: number) => {
    for (let step = index; step < targetStep; step += 1) {
      next();
    }
  };

  return (
    <Tray.Body>
      <Tray.Section>
        <CategoryRow
          fallback="game-controller-outline"
          icon="gamecontroller"
          onPress={() => openStep(SETTINGS_STEP_INDEX.gameMode)}
          subtitle={GAME_MODE_OPTIONS.find((option) => option.value === gameMode)?.label}
          title="Game mode"
        />
        {gameMode === 'human-vs-agent' ? (
          <CategoryRow
            fallback="person-outline"
            icon="person"
            onPress={() => openStep(SETTINGS_STEP_INDEX.playAs)}
            subtitle={HUMAN_COLOR_OPTIONS.find((option) => option.value === humanColor)?.label}
            title="Play as"
          />
        ) : null}
        <CategoryRow
          fallback="sparkles-outline"
          icon="sparkles"
          onPress={() => openStep(SETTINGS_STEP_INDEX.aiStrategy)}
          subtitle={AGENT_OPTIONS.find((option) => option.value === agent)?.label}
          title="AI strategy"
        />
      </Tray.Section>
    </Tray.Body>
  );
}

export function GameModeOptions({
  gameMode,
  onChange,
}: GameOptionsProps) {
  return (
    <ChoiceOptions>
      {GAME_MODE_OPTIONS.map((option) => (
        <ChoiceRow
          key={option.value}
          label={option.label}
          selected={gameMode === option.value}
          onPress={() => onChange({ gameMode: option.value })}
          surface
        />
      ))}
    </ChoiceOptions>
  );
}

export function HumanColorOptions({
  humanColor,
  onChange,
}: GameOptionsProps) {
  return (
    <ChoiceOptions>
      {HUMAN_COLOR_OPTIONS.map((option) => (
        <ChoiceRow
          key={option.value}
          label={option.label}
          selected={humanColor === option.value}
          onPress={() => onChange({ humanColor: option.value })}
          surface
        />
      ))}
    </ChoiceOptions>
  );
}

export function AgentOptions({ agent, onChange }: GameOptionsProps) {
  return (
    <ChoiceOptions>
      {AGENT_OPTIONS.map((option) => (
        <ChoiceRow
          key={option.value}
          label={option.label}
          selected={agent === option.value}
          onPress={() => onChange({ agent: option.value })}
          surface
        />
      ))}
    </ChoiceOptions>
  );
}

function ChoiceOptions({ children }: { children: ReactNode }) {
  return (
    <Tray.Body>
      <Tray.Section>{children}</Tray.Section>
    </Tray.Body>
  );
}
