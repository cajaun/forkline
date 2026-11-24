import { useCallback } from 'react';
import { View } from 'react-native';

import { Tray } from 'react-native-morpheus';
import { Uniwind, useUniwind } from 'uniwind';

import { coverThemeChange } from '@/modules/theme-fade';
import { saveThemeMode } from '@/services/preferences';

import { ThemeCard } from '../components/theme-card';
import { THEME_OPTIONS } from '../constants';
import type { AppearanceSettings, ThemeMode } from '../types';

export type AppearanceOptionsProps = AppearanceSettings & {
  onChange: (changes: Partial<AppearanceSettings>) => void;
};

export function AppearanceOptions({ onChange }: AppearanceOptionsProps) {
  const { hasAdaptiveThemes, theme } = useUniwind();
  const activeTheme: ThemeMode = hasAdaptiveThemes ? 'system' : theme;

  const chooseTheme = useCallback(
    async (value: ThemeMode) => {
      await coverThemeChange();
      Uniwind.setTheme(value);
      onChange({ themeMode: value });
      void saveThemeMode(value);
    },
    [onChange],
  );

  return (
    <Tray.Body>
      <Tray.Section>
        <View className="flex-row gap-3">
          {THEME_OPTIONS.map(option => (
            <ThemeCard
              key={option.value}
              fallback={option.fallback}
              icon={option.icon}
              label={option.label}
              selected={activeTheme === option.value}
              onPress={() => void chooseTheme(option.value)}
            />
          ))}
        </View>
      </Tray.Section>
    </Tray.Body>
  );
}
