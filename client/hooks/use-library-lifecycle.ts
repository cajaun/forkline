import { useEffect } from 'react';

import { gameActions } from '@/stores/games';

// finishing onboarding selects the newest game
export function useLibraryLifecycle(onboarded: boolean) {
  useEffect(() => {
    if (onboarded) gameActions.ensureSelection();
  }, [onboarded]);
}
