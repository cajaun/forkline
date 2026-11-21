import { useEffect, useEffectEvent } from 'react';
import { AppState } from 'react-native';

import { gameActions } from '@/stores/games';

// reads the saved library once and keeps a game ready for today, even across midnight with the app open
export function useLibraryLifecycle(onboarded: boolean) {
  useEffect(() => {
    void gameActions.hydrate();
  }, []);

  const ensureToday = useEffectEvent(() => gameActions.ensureTodayGame());

  useEffect(() => {
    if (onboarded) ensureToday();
  }, [onboarded]);

  // returning to the app on a new day creates that day's game
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') ensureToday();
    });
    return () => subscription.remove();
  }, []);
}
