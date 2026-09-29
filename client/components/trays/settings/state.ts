import { useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import type { SettingsState } from './types';

export const INITIAL_SETTINGS: SettingsState = {
  appearance: {
    themeMode: 'light',
  },
  game: {
    agent: 'material-mobility',
    gameMode: 'human-vs-agent',
    humanColor: 'white',
  },
  gameplay: {
    depths: {
      'king-safety-position': 2,
      'material-mobility': 2,
    },
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
