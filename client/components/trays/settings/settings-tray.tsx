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
import { SettingsHomeBody } from './home';
import { useSettingsState } from './state';

export function SettingsTray({ size = 56 }: { size?: number }) {
  const { settings, update } = useSettingsState();
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
      ...settings.game,
      onChange: (changes: Partial<typeof settings.game>) =>
        update('game', changes),
    },
    gameplay: {
      ...settings.gameplay,
      onChange: (changes: Partial<typeof settings.gameplay>) =>
        update('gameplay', changes),
    },
    match: {
      ...settings.match,
      onChange: (changes: Partial<typeof settings.match>) =>
        update('match', changes),
    },
  };

  return (
    <Tray.Root
      stepOptions={{

        className: 'bg-[#FEFFFF] dark:bg-[#262626]',
        footerClassName: 'bg-[#FEFFFF] dark:bg-[#262626]',
      }}>
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
        <SettingsHomeBody />
      </Tray.Step>

      <Tray.Step key="game">
        <SettingsHeader backSteps={SETTINGS_STEP_INDEX.game} title={CATEGORY_TITLES.game} />
        <CategoryOptions {...categoryOptions} category="game" />
      </Tray.Step>

      <Tray.Step key="game-mode">
        <SettingsHeader backSteps={1} title="Game mode" />
        <GameModeOptions {...categoryOptions.game} />
      </Tray.Step>

      <Tray.Step key="play-as">
        <SettingsHeader backSteps={2} title="Play as" />
        <HumanColorOptions {...categoryOptions.game} />
      </Tray.Step>

      <Tray.Step key="ai-strategy">
        <SettingsHeader backSteps={3} title="AI strategy" />
        <AgentOptions {...categoryOptions.game} />
      </Tray.Step>

      <Tray.Step key="gameplay">
        <SettingsHeader backSteps={SETTINGS_STEP_INDEX.gameplay} title={CATEGORY_TITLES.gameplay} />
        <CategoryOptions {...categoryOptions} category="gameplay" />
      </Tray.Step>

      <Tray.Step key="match">
        <SettingsHeader backSteps={SETTINGS_STEP_INDEX.match} title={CATEGORY_TITLES.match} />
        <CategoryOptions {...categoryOptions} category="match" />
      </Tray.Step>

      <Tray.Step key="appearance">
        <SettingsHeader backSteps={SETTINGS_STEP_INDEX.appearance} title={CATEGORY_TITLES.appearance} />
        <CategoryOptions {...categoryOptions} category="appearance" />
      </Tray.Step>
    </Tray.Root>
  );
}

export default SettingsTray;
