import { useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import type { SettingsState } from './types';

const INITIAL_SETTINGS: SettingsState = {
  appearance: {
    themeMode: 'light',
  },
  match: {
    alternateColors: true,
    games: 5,
  },
};

export const settingsAtom = atom<SettingsState>(INITIAL_SETTINGS);

export function useSettingsState() {
  const [settings, setSettings] = useAtom(settingsAtom);

  const update = useCallback(
    <Section extends keyof SettingsState>(
      section: Section,
      changes: Partial<SettingsState[Section]>,
    ) => {
      setSettings((current) => ({
        ...current,
        [section]: {
          ...current[section],
          ...changes,
        },
      }));
    },
    [setSettings],
  );

  return { settings, update };
}
