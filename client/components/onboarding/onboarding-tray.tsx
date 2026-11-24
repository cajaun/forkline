import { memo } from 'react';

import { Tray } from 'react-native-morpheus';

import { AgentOptions } from '@/components/trays/settings/categories/game';
import { GameplayOptions } from '@/components/trays/settings/categories/gameplay';
import { SettingsHeader } from '@/components/trays/settings/components/settings-header';
import { SettingsInfoBody } from '@/components/trays/settings/components/settings-info';
import { SETTINGS_INFO } from '@/components/trays/settings/info-content';
import { gameActions, useOnboardingState } from '@/stores/games';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';

import { ContinueButton, OpenOnFirstLaunch, PlayStep, WelcomeStep } from './steps';

// a welcome page then the defaults for new games with an info page after each choice
// the setup pages carry their own Continue footer and the info pages go without one
export const OnboardingTray = memo(function OnboardingTray() {
  const { defaults, hydrated, onboardingComplete } = useOnboardingState();
  const { completeOnboarding, setDefaults } = gameActions;
  const footer = (
    <Tray.Footer style={{ width: '100%' }}  exit="withContent">
      <ContinueButton onFinish={completeOnboarding} />
    </Tray.Footer>
  );

  return (
    <Tray.Root dismissible={false} stepOptions={TRAY_STEP_OPTIONS}>
      <OpenOnFirstLaunch when={hydrated && !onboardingComplete} />

      <Tray.Step key="welcome">
        <WelcomeStep />
        {footer}
      </Tray.Step>

      <Tray.Step key="play">
        <SettingsHeader backSteps={1} info="game-mode" title="Game mode" />
        <PlayStep config={defaults} onChange={setDefaults} />
        {footer}
      </Tray.Step>
      
      <Tray.Step key="play-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['game-mode'].title} />
        <SettingsInfoBody info="game-mode" />
      </Tray.Step>

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
        {footer}
      </Tray.Step>
      <Tray.Step key="strategy-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['strategy'].title} />
        <SettingsInfoBody info="strategy" />
      </Tray.Step>

      <Tray.Step key="difficulty">
        <SettingsHeader backSteps={2} info="difficulty" title="Difficulty" />
        <GameplayOptions depths={defaults.depths} onChange={setDefaults} />
        {footer}
      </Tray.Step>
      <Tray.Step key="difficulty-info">
        <SettingsHeader backSteps={1} title={SETTINGS_INFO['difficulty'].title} />
        <SettingsInfoBody info="difficulty" />
      </Tray.Step>
    </Tray.Root>
  );
});
