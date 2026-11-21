import type { ReactNode } from 'react';
import { Text } from 'react-native';

import {
  Tray,
  useTrayNavigation,
  useTrayNavigationState,
} from 'react-native-morpheus';

import { CategoryRow } from '../components/category-row';
import { ChoiceRow } from '../components/choice-row';
import {
  AGENT_OPTIONS,
  GAME_MODE_OPTIONS,
  HUMAN_COLOR_OPTIONS,
  SETTINGS_STEP_INDEX,
} from '../constants';
import { trayText } from '@/components/shared/tokens';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import type { GameSettings } from '../types';

export type GameOptionsProps = GameSettings & {
  // in a game with moves, changing mode or colour starts a new game
  modeLocked?: boolean;
  onChange: (changes: Partial<GameSettings>) => void;
};

const NEW_GAME_NOTE = 'Changing this starts a new game with these settings.';

export function GameOptions({
  gameMode,
  humanColor,
  agent,
  onChange,
}: GameOptionsProps) {
  const { next } = useTrayNavigation();
  const index = useTrayNavigationState((state) => state.index);
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
  modeLocked,
  onChange,
}: GameOptionsProps) {
  return (
    <ChoiceOptions note={modeLocked ? NEW_GAME_NOTE : undefined}>
      {GAME_MODE_OPTIONS.map((option) => (
        <ChoiceRow
          key={option.value}
          fallback={option.fallback}
          icon={option.icon}
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
  modeLocked,
  onChange,
}: GameOptionsProps) {
  return (
    <ChoiceOptions note={modeLocked ? NEW_GAME_NOTE : undefined}>
      {HUMAN_COLOR_OPTIONS.map((option) => (
        <ChoiceRow
          key={option.value}
          fallback={option.fallback}
          icon={option.icon}
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
          fallback={option.fallback}
          icon={option.icon}
          label={option.label}
          selected={agent === option.value}
          onPress={() => onChange({ agent: option.value })}
          surface
        />
      ))}
    </ChoiceOptions>
  );
}

function ChoiceOptions({
  children,
  note,
}: {
  children: ReactNode;
  note?: string;
}) {
  const { colors } = useSheetColors();

  return (
    <Tray.Body>
      <Tray.Section>
        {children}
        {note ? (
          <Text
            style={[
              trayText.Subheadline,
              { color: colors.weekdayText, paddingHorizontal: 4 },
            ]}>
            {note}
          </Text>
        ) : null}
      </Tray.Section>
    </Tray.Body>
  );
}
