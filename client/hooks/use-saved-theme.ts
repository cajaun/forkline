import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useSetAtom } from 'jotai';
import { Uniwind } from 'uniwind';

import { settingsAtom } from '@/components/trays/settings/state';
import { SHEET_COLORS_BY_THEME } from '@/constants/sheet';
import { loadThemeMode } from '@/services/preferences';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 250, fade: true });

// applies the saved theme and fades the splash out
export function useSavedTheme() {
  const setSettings = useSetAtom(settingsAtom);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadThemeMode()
      .then(mode => {
        if (cancelled) return;
        const scheme = mode && mode !== 'system' ? mode : Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
        void SystemUI.setBackgroundColorAsync(SHEET_COLORS_BY_THEME[scheme].appBackground);
        if (!mode) return;
        Uniwind.setTheme(mode);
        setSettings(current => ({ ...current, appearance: { ...current.appearance, themeMode: mode } }));
      })
      .finally(() => {
        if (cancelled) return;
        setReady(true);
        SplashScreen.hideAsync().catch(() => {});
      });
    return () => {
      cancelled = true;
    };
  }, [setSettings]);

  return ready;
}
