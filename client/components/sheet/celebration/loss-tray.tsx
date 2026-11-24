import { memo, useEffect, useRef } from 'react';
import { View } from 'react-native';

import { Tray, useTrayNavigation } from 'react-native-morpheus';

import { ConfirmBody } from '@/components/trays/shared/confirm-tray';
import { TrayButton } from '@/components/trays/shared/tray-button';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';
import * as Haptics from '@/services/haptics';
import { gameActions } from '@/stores/games';
import type { GameSummary } from '@/types/games';
import { humanOutcome } from '@/utils/game-ending';

// opens once when the selected game turns into a loss in front of the player
function LossPresenter({ game }: { game: GameSummary | null }) {
  const { open } = useTrayNavigation();
  const seenRef = useRef<{ id: string | null; status: string | null }>({ id: null, status: null });
  const id = game?.id ?? null;
  const status = game?.status ?? null;
  // a resignation is the player's own call so only a mate or the clock opens the tray
  const lost = humanOutcome(game) === 'loss' && game?.termination !== 'resignation';

  useEffect(() => {
    const seen = seenRef.current;
    seenRef.current = { id, status };
    if (lost && seen.id === id && seen.status === 'active') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      open();
    }
  }, [id, lost, open, status]);

  return null;
}

function LossFooter({ timedOut }: { timedOut: boolean }) {
  const { close } = useTrayNavigation();

  return (
    <Tray.Footer style={{ width: '100%' }}>
      <View style={{ gap: 10, width: '100%' }}>
        {/* the clock cannot come back so a timeout only offers a fresh start */}
        {timedOut ? null : (
          <TrayButton
            label="Undo last move"
            onPress={() => {
              gameActions.undoSelectedTurn();
              close();
            }}
            style={{ width: '100%' }}
            tone="primary"
          />
        )}
        <TrayButton
          label="Start over"
          onPress={() => {
            gameActions.restartSelectedGame();
            close();
          }}
          style={{ width: '100%' }}
          tone={timedOut ? 'primary' : 'muted'}
        />
      </View>
    </Tray.Footer>
  );
}

// a lost game offers a take back or a fresh start instead of the result screen
export const LossTray = memo(function LossTray({ game }: { game: GameSummary | null }) {
  const timedOut = game?.termination === 'timeout';

  // the footer sits on the root since Morpheus only reads a step footer placed straight inside the step
  return (
    <Tray.Root footer={<LossFooter timedOut={timedOut} />} stepOptions={TRAY_STEP_OPTIONS}>
      <LossPresenter game={game} />
      <Tray.Step key="loss">
        <ConfirmBody
          body={
            timedOut ? 'Your fifteen minutes ran out. Try again?' : 'The AI checkmated your king. Try again?'
          }
          fallback="skull-outline"
          icon="xmark.octagon"
          title="Game over"
        />
      </Tray.Step>
    </Tray.Root>
  );
});
