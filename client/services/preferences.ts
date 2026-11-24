import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemeMode } from '@/components/trays/settings/types';

const THEME_KEY = 'forkline/theme/v1';
const THEMES: readonly ThemeMode[] = ['system', 'light', 'dark'];

export async function loadThemeMode(): Promise<ThemeMode | null> {
  const saved = await AsyncStorage.getItem(THEME_KEY);
  return THEMES.includes(saved as ThemeMode) ? (saved as ThemeMode) : null;
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, mode);
}
