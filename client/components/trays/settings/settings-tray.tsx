import { memo } from 'react';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { Tray } from 'react-native-morpheus';

import { CategoryOptions } from './category-options';
import {
  AgentOptions,
  GameModeOptions,
  HumanColorOptions,
} from './categories/game';
import { CATEGORY_TITLES, SETTINGS_STEP_INDEX } from './constants';
import { SettingsHeader } from './components/settings-header';
import { SettingsInfoBody } from './components/settings-info';
import { SETTINGS_INFO } from './info-content';
import { SettingsHomeBody } from './home';
import { useSettingsState } from './state';
import type { SettingsScope } from './types';
import { useScopedConfig } from './use-scoped-config';

const STEP_OPTIONS = {
  className: 'bg-[#FEFFFF] dark:bg-[#262626]',
  footerClassName: 'bg-[#FEFFFF] dark:bg-[#262626]',
};

// memo matters here because every render re-registers the tray's steps
export const SettingsTray = memo(function SettingsTray({
  scope = 'defaults',
  size = 56,
}: {
  scope?: SettingsScope;
  size?: number;
}) {
  const { settings, update } = useSettingsState();
  const scoped = useScopedConfig(scope);
  const { config } = scoped;
  const { colors } = useSheetColors();
  const triggerStyle = {
    alignItems: 'center' as const,
    backgroundColor: colors.controlBackground,
    borderRadius: size / 2,
    height: size,
    justifyContent: 'center' as const,
    width: size,
  };
  const categoryOptions = {
    appearance: {
      ...settings.appearance,
      onChange: (changes: Partial<typeof settings.appearance>) =>
        update('appearance', changes),
    },
    game: {
      agent: config.agent,
      gameMode: config.gameMode,
      humanColor: config.humanColor,
      modeLocked: scoped.modeLocked,
      onChange: scoped.change,
    },
    gameplay: {
      depths: config.depths,
      onChange: scoped.change,
    },
    match: {
      ...settings.match,
      onChange: (changes: Partial<typeof settings.match>) =>
        update('match', changes),
    },
  };

  return (
    <Tray.Root stepOptions={STEP_OPTIONS}>
      <Tray.Trigger
        accessibilityLabel="Settings"
        haptics="selection"
        style={triggerStyle}>
        <SfSymbol
          fallback="settings-sharp"
          name="gearshape.fill"
          size={size * 0.48}
          tintColor={colors.icon}
        />
      </Tray.Trigger>

      <Tray.Step key="settings">
        <SettingsHeader title="Settings" />
        <SettingsHomeBody
          onNewGame={scoped.startNewGame}
          scope={scoped.scope}
        />
      </Tray.Step>

      {/* each settings step is followed by the info step its ? opens */}
      <Tray.Step key="game">
        <SettingsHeader
          backSteps={SETTINGS_STEP_INDEX.game - SETTINGS_STEP_INDEX.settings}
          info="game"
          title={CATEGORY_TITLES.game}
        />
        <CategoryOptions {...categoryOptions} category="game" />
      </Tray.Step>
      <Tray.Step key="game-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['game'].title} />
        <SettingsInfoBody info="game" />
      </Tray.Step>

      <Tray.Step key="game-mode">
        <SettingsHeader
          backSteps={SETTINGS_STEP_INDEX.gameMode - SETTINGS_STEP_INDEX.game}
          info="game-mode"
          title="Game mode"
        />
        <GameModeOptions {...categoryOptions.game} />
      </Tray.Step>
      <Tray.Step key="game-mode-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['game-mode'].title} />
        <SettingsInfoBody info="game-mode" />
      </Tray.Step>

      <Tray.Step key="play-as">
        <SettingsHeader
          backSteps={SETTINGS_STEP_INDEX.playAs - SETTINGS_STEP_INDEX.game}
          info="play-as"
          title="Play as"
        />
        <HumanColorOptions {...categoryOptions.game} />
      </Tray.Step>
      <Tray.Step key="play-as-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['play-as'].title} />
        <SettingsInfoBody info="play-as" />
      </Tray.Step>

      <Tray.Step key="ai-strategy">
        <SettingsHeader
          backSteps={SETTINGS_STEP_INDEX.aiStrategy - SETTINGS_STEP_INDEX.game}
          info="strategy"
          title="AI strategy"
        />
        <AgentOptions {...categoryOptions.game} />
      </Tray.Step>
      <Tray.Step key="ai-strategy-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['strategy'].title} />
        <SettingsInfoBody info="strategy" />
      </Tray.Step>

      <Tray.Step key="gameplay">
        <SettingsHeader
          backSteps={SETTINGS_STEP_INDEX.gameplay - SETTINGS_STEP_INDEX.settings}
          info="difficulty"
          title={CATEGORY_TITLES.gameplay}
        />
        <CategoryOptions {...categoryOptions} category="gameplay" />
      </Tray.Step>
      <Tray.Step key="gameplay-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['difficulty'].title} />
        <SettingsInfoBody info="difficulty" />
      </Tray.Step>

      <Tray.Step key="match">
        <SettingsHeader
          backSteps={SETTINGS_STEP_INDEX.match - SETTINGS_STEP_INDEX.settings}
          info="match"
          title={CATEGORY_TITLES.match}
        />
        <CategoryOptions {...categoryOptions} category="match" />
      </Tray.Step>
      <Tray.Step key="match-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['match'].title} />
        <SettingsInfoBody info="match" />
      </Tray.Step>

      <Tray.Step key="appearance">
        <SettingsHeader
          backSteps={SETTINGS_STEP_INDEX.appearance - SETTINGS_STEP_INDEX.settings}
          info="appearance"
          title={CATEGORY_TITLES.appearance}
        />
        <CategoryOptions {...categoryOptions} category="appearance" />
      </Tray.Step>
      <Tray.Step key="appearance-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['appearance'].title} />
        <SettingsInfoBody info="appearance" />
      </Tray.Step>
    </Tray.Root>
  );
});

export default SettingsTray;
