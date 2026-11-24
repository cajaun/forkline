import { memo, useCallback, useEffect, useRef } from 'react';

import * as Haptics from '@/services/haptics';
import { atom, useAtomValue, useSetAtom, useStore } from 'jotai';
import { useTrayNavigation } from 'react-native-morpheus';

import { ConfirmTray } from '@/components/trays/shared/confirm-tray';
import { gameActions } from '@/stores/games';

type DeleteRequest = { gameId: string; label: string; nonce: number };

// a long press sets a new nonce so the same game can ask twice
export const deleteGameRequestAtom = atom<DeleteRequest | null>(null);

// the strip fades this game out before the library drops it
export const removingGameIdAtom = atom<string | null>(null);
export const REMOVE_FADE_MS = 220;

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
  const store = useStore();
  const setRemoving = useSetAtom(removingGameIdAtom);

  // reads the request when tapped since the step footer can hold an older render of this callback
  const confirm = useCallback(() => {
    const gameId = store.get(deleteGameRequestAtom)?.gameId;
    if (!gameId) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setRemoving(gameId);
    setTimeout(() => {
      gameActions.deleteGame(gameId);
      setRemoving(null);
    }, REMOVE_FADE_MS);
  }, [setRemoving, store]);

  return (
    <ConfirmTray
      body={`The game from ${request?.label ?? 'this day'} and all its moves are removed for good, and your stats leave it out`}
      cancelLabel="Cancel"
      confirmLabel="Delete game"
      fallback="trash-outline"
      icon="exclamationmark.triangle"
      onConfirm={confirm}
      presenter={<DeletePresenter nonce={request?.nonce ?? null} />}
      title="Delete game?"
    />
  );
});
