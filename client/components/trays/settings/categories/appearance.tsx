import { useCallback } from 'react';
import { View } from 'react-native';

import { Tray } from 'react-native-morpheus';
import { Uniwind } from 'uniwind';

import { ThemeCard } from '../components/theme-card';
import { THEME_OPTIONS } from '../constants';
import type { AppearanceSettings, ThemeMode } from '../types';

export type AppearanceOptionsProps = AppearanceSettings & {
  onChange: (changes: Partial<AppearanceSettings>) => void;
};

export function AppearanceOptions({
  themeMode,
  onChange,
}: AppearanceOptionsProps) {
  const chooseTheme = useCallback(
    (value: ThemeMode) => {
      onChange({ themeMode: value });
      Uniwind.setTheme(value);
    },
    [onChange],
  );

  return (
    <Tray.Body>
      <Tray.Section>
        <View className="flex-row gap-3">
          {THEME_OPTIONS.map((option) => (
            <ThemeCard
              key={option.value}
              fallback={option.fallback}
              icon={option.icon}
              label={option.label}
              selected={themeMode === option.value}
              onPress={() => chooseTheme(option.value)}
            />
          ))}
        </View>
      </Tray.Section>
    </Tray.Body>
  );
}
