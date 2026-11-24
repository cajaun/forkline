import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useSetAtom } from 'jotai';
import { Uniwind } from 'uniwind';

import { settingsAtom } from '@/components/trays/settings/state';
import { SHEET_COLORS_BY_THEME } from '@/constants/sheet';
import { setHapticsEnabled } from '@/services/haptics';
import { loadHapticsOn, loadThemeMode } from '@/services/preferences';
import { gameActions } from '@/stores/games';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 250, fade: true });

// applies the saved theme and haptics and loads the games before the splash fades out
export function useAppReady() {
  const setSettings = useSetAtom(settingsAtom);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const theme = loadThemeMode().then(mode => {
      if (cancelled) return;
      const scheme =
        mode && mode !== 'system' ? mode : Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
      void SystemUI.setBackgroundColorAsync(SHEET_COLORS_BY_THEME[scheme].appBackground);
      if (!mode) return;
      Uniwind.setTheme(mode);
      setSettings(current => ({ ...current, appearance: { ...current.appearance, themeMode: mode } }));
    });
    const haptics = loadHapticsOn().then(on => {
      if (cancelled) return;
      setHapticsEnabled(on);
      setSettings(current => ({ ...current, haptics: { on } }));
    });
    // the library loads behind the splash so the first frame already shows the saved game
    void Promise.allSettled([theme, haptics, gameActions.hydrate()]).then(() => {
      if (cancelled) return;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [setSettings]);

  // the splash lifts after the coloured root has rendered beneath it
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  return ready;
}
