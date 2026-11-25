import { memo, useState } from 'react';

import * as Haptics from '@/services/haptics';
import { Tray, useTrayNavigation, useTrayNavigationState } from 'react-native-morpheus';

import { CLOSE_SETTLE_MS } from '@/components/shared/tray-activity';
import { SettingsHeader } from '@/components/trays/settings/components/settings-header';
import { ConfirmBody, ConfirmHeader } from '@/components/trays/shared/confirm-tray';
import { OptionLink } from '@/components/trays/shared/option-ui';
import { SplitButton } from '@/components/trays/shared/split-button';
import { TrayTriggerButton } from '@/components/trays/shared/tray-ui';
import { gameActions, useSelectedGameStanding } from '@/stores/games';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';

type Final = 'restart' | 'resign';

// Start over and Resign each confirm on a step of their own
function finalCopy(final: Final, watching: boolean) {
  if (final === 'restart') {
    return {
      body: 'You lose every move in this game and the clock goes back to fifteen minutes, while the game keeps its settings',
      confirmLabel: 'Start over',
      fallback: 'arrow-undo-outline' as const,
      icon: 'arrow.trianglehead.counterclockwise' as const,
      title: 'Start over?',
    };
  }
  return watching
    ? {
        body: 'The two AIs stop here and the game is saved to your history with no winner',
        confirmLabel: 'End game',
        fallback: 'stop-circle-outline' as const,
        icon: 'stop.circle.fill' as const,
        title: 'End this game?',
      }
    : {
        body: 'The AI wins this game and it is saved to your history as a loss',
        confirmLabel: 'Resign',
        fallback: 'log-out-outline' as const,
        icon: 'rectangle.portrait.and.arrow.right' as const,
        title: 'Resign?',
      };
}

// the list walks forward to a confirmation and Cancel walks back like the Settings categories
const RESTART_STEP = 1;
const RESIGN_STEP = 2;

function ActionsBody() {
  const { close, next } = useTrayNavigation();
  const standing = useSelectedGameStanding();
  const watching = standing?.gameMode === 'agent-vs-agent';
  const playing = standing?.status === 'active';

  const openStep = (step: number) => {
    for (let at = 0; at < step; at += 1) next();
  };

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 10 }}>
        {/* a watched game and a won game have no move of the player's to take back */}
        {watching || standing?.won ? null : (
          <OptionLink
            disabled={!standing?.canUndo}
            fallback="arrow-undo-outline"
            icon="arrow.uturn.backward"
            onPress={() => {
              if (gameActions.undoSelectedTurn()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              close();
            }}
            title="Undo move"
          />
        )}
        <OptionLink
          fallback="arrow-undo-outline"
          icon="arrow.trianglehead.counterclockwise"
          onPress={() => openStep(RESTART_STEP)}
          title="Start over"
        />
        <OptionLink
          disabled={!playing}
          fallback={watching ? 'stop-circle-outline' : 'log-out-outline'}
          icon={watching ? 'stop.circle' : 'rectangle.portrait.and.arrow.right'}
          onPress={() => openStep(RESIGN_STEP)}
          title={watching ? 'End game' : 'Resign'}
        />
      </Tray.Section>
    </Tray.Body>
  );
}

function FinalBody({ final }: { final: Final }) {
  const standing = useSelectedGameStanding();
  const copy = finalCopy(final, standing?.gameMode === 'agent-vs-agent');

  return <ConfirmBody body={copy.body} fallback={copy.fallback} icon={copy.icon} title={copy.title} />;
}

// one footer for the tray that splits into Cancel and the action on a confirmation
function ActionsFooter() {
  // the tray reports step zero once it starts closing so the last open step holds the split until it is gone
  const live = useTrayNavigationState(state => (state.isActive ? state.index : -1));
  const [index, setIndex] = useState(0);
  if (live >= 0 && live !== index) setIndex(live);
  const { back, close } = useTrayNavigation();
  const standing = useSelectedGameStanding();
  const final: Final | null = index === RESTART_STEP ? 'restart' : index === RESIGN_STEP ? 'resign' : null;
  const copy = final ? finalCopy(final, standing?.gameMode === 'agent-vs-agent') : null;
  const resigning = final === 'resign';

  const confirm = () => {
    if (resigning) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      gameActions.resignSelectedGame(CLOSE_SETTLE_MS);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      gameActions.restartSelectedGame();
    }
    close();
  };

  return (
    <Tray.Footer style={{ width: '100%' }}>
      <SplitButton
        step={index}
        action={copy ? { label: copy.confirmLabel, onPress: confirm } : null}
        onCancel={() => {
          if (index === 0) {
            close();
            return;
          }
          for (let at = 0; at < index; at += 1) back();
        }}
      />
    </Tray.Footer>
  );
}

const FOOTER = <ActionsFooter />;

// the bottom left button offers undo and start over and resign
export const GameActionsTray = memo(function GameActionsTray({ size = 56 }: { size?: number }) {
  return (
    <Tray.Root footer={FOOTER} stepOptions={TRAY_STEP_OPTIONS}>
      <TrayTriggerButton
        fallback="arrow-undo-outline"
        icon="arrow.uturn.backward"
        label="Feeling stuck"
        size={size}
      />

      <Tray.Step key="actions">
        <SettingsHeader title="Feeling stuck?" />
        <ActionsBody />
      </Tray.Step>

      <Tray.Step key="restart">
        <ConfirmHeader />
        <FinalBody final="restart" />
      </Tray.Step>

      <Tray.Step key="resign">
        <ConfirmHeader />
        <FinalBody final="resign" />
      </Tray.Step>
    </Tray.Root>
  );
});
