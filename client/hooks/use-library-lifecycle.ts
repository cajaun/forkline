import { useEffect } from 'react';

import { gameActions } from '@/stores/games';

// loads the saved library and selects the newest game
export function useLibraryLifecycle(onboarded: boolean) {
  useEffect(() => {
    void gameActions.hydrate();
  }, []);

  useEffect(() => {
    if (onboarded) gameActions.ensureSelection();
  }, [onboarded]);
}
