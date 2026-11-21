import { memo } from 'react';

import { Tray } from 'react-native-morpheus';

import { AgentOptions } from '@/components/trays/settings/categories/game';
import { GameplayOptions } from '@/components/trays/settings/categories/gameplay';
import { SettingsHeader } from '@/components/trays/settings/components/settings-header';
import { SettingsInfoBody } from '@/components/trays/settings/components/settings-info';
import { SETTINGS_INFO } from '@/components/trays/settings/info-content';
import { gameActions, useOnboardingState } from '@/stores/games';

import { OnboardingFooter, OpenOnFirstLaunch, PlayStep, WelcomeStep } from './steps';

const STEP_OPTIONS = {
  className: 'bg-[#FEFFFF] dark:bg-[#262626]',
  footerClassName: 'bg-[#FEFFFF] dark:bg-[#262626]',
};

// a welcome, then the defaults for new games, with steps kept as direct children so headers reach their slot
export const OnboardingTray = memo(function OnboardingTray() {
  const { defaults, hydrated, onboardingComplete } = useOnboardingState();
  const { completeOnboarding, setDefaults } = gameActions;

  return (
    <Tray.Root
      dismissible={false}
      footer={<OnboardingFooter onFinish={completeOnboarding} />}
      stepOptions={STEP_OPTIONS}>
      <OpenOnFirstLaunch when={hydrated && !onboardingComplete} />

      <Tray.Step key="welcome">
        <WelcomeStep />
      </Tray.Step>

      <Tray.Step key="play">
        <SettingsHeader backSteps={1} info="game-mode" title="Game mode" />
        <PlayStep config={defaults} onChange={setDefaults} />
      </Tray.Step>
      <Tray.Step key="play-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['game-mode'].title} />
        <SettingsInfoBody info="game-mode" />
      </Tray.Step>

      {/* back skips the previous step's info page */}
      <Tray.Step key="strategy">
        <SettingsHeader
          backSteps={2}
          info="strategy"
          title={defaults.gameMode === 'agent-vs-agent' ? "White's strategy" : 'Your opponent'}
        />
        <AgentOptions
          agent={defaults.agent}
          gameMode={defaults.gameMode}
          humanColor={defaults.humanColor}
          onChange={setDefaults}
        />
      </Tray.Step>
      <Tray.Step key="strategy-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['strategy'].title} />
        <SettingsInfoBody info="strategy" />
      </Tray.Step>

      <Tray.Step key="difficulty">
        <SettingsHeader backSteps={2} info="difficulty" title="Difficulty" />
        <GameplayOptions depths={defaults.depths} onChange={setDefaults} />
      </Tray.Step>
      <Tray.Step key="difficulty-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['difficulty'].title} />
        <SettingsInfoBody info="difficulty" />
      </Tray.Step>
    </Tray.Root>
  );
});
