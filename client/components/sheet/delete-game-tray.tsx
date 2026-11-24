import { memo, useCallback, useEffect, useRef } from 'react';

import * as Haptics from 'expo-haptics';
import { atom, useAtomValue } from 'jotai';
import { useTrayNavigation } from 'react-native-morpheus';

import { ConfirmTray } from '@/components/trays/shared/confirm-tray';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { gameActions } from '@/stores/games';

type DeleteRequest = { gameId: string; label: string; nonce: number };

// a long press sets a new nonce so the same game can ask twice
export const deleteGameRequestAtom = atom<DeleteRequest | null>(null);

// opens the tray once for each new request
function DeletePresenter({ nonce }: { nonce: number | null }) {
  const { open } = useTrayNavigation();
  const shownRef = useRef<number | null>(null);

  useEffect(() => {
    if (nonce === null || nonce === shownRef.current) return;
    shownRef.current = nonce;
    open();
  }, [nonce, open]);

  return null;
}

export const DeleteGameTray = memo(function DeleteGameTray() {
  const request = useAtomValue(deleteGameRequestAtom);
  const { kingColors } = useSheetColors();
  const gameId = request?.gameId ?? null;

  const confirm = useCallback(() => {
    if (!gameId) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    gameActions.deleteGame(gameId);
  }, [gameId]);

  return (
    <ConfirmTray
      body={`The game from ${request?.label ?? 'this day'} and all its moves are removed for good, and your stats leave it out`}
      cancelLabel="Cancel"
      confirmColor={kingColors.gameOver.marker}
      confirmLabel="Delete game"
      confirmTextColor="#FFFFFF"
      fallback="trash-outline"
      icon="exclamationmark.triangle"
      onConfirm={confirm}
      presenter={<DeletePresenter nonce={request?.nonce ?? null} />}
      title="Delete game?"
    />
  );
});
