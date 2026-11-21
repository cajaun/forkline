import { Tray, useTrayNavigation } from 'react-native-morpheus';

import { gameActions } from '@/stores/games';

import type { SettingsScope } from './types';

import { CategoryRow } from './components/category-row';
import { CATEGORY_OPTIONS, CATEGORY_STEP_INDEX } from './constants';

export function SettingsHomeBody({
  onNewGame,
  scope,
}: {
  onNewGame: () => void;
  scope: SettingsScope;
}) {
  const { close, next } = useTrayNavigation();
  const { resetLibrary, seedSampleHistory } = gameActions;
  const openCategory = (category: keyof typeof CATEGORY_STEP_INDEX) => {
    const targetStep = CATEGORY_STEP_INDEX[category];

    for (let step = 0; step < targetStep; step += 1) {
      next();
    }
  };

  return (
    <Tray.Body>
      <Tray.Section>
        {CATEGORY_OPTIONS.map((option) => (
          <CategoryRow
            key={option.key}
            fallback={option.fallback}
            icon={option.icon}
            title={option.title}
            subtitle={
              scope === 'defaults' &&
              (option.key === 'game' || option.key === 'gameplay')
                ? 'Default for new games'
                : undefined
            }
            onPress={() => openCategory(option.key)}
          />
        ))}
        {scope === 'game' ? (
          <CategoryRow
            fallback="add-circle-outline"
            icon="plus.circle"
            title="New game"
            subtitle="Same settings, fresh board"
            onPress={() => {
              onNewGame();
              close();
            }}
          />
        ) : null}
        {/* development tools for testing the history strip */}
        {__DEV__ && scope === 'defaults' ? (
          <>
            <CategoryRow
              fallback="time-outline"
              icon="clock.arrow.circlepath"
              title="Add sample history"
              subtitle="Dev · games on the past six days"
              onPress={() => {
                seedSampleHistory();
                close();
              }}
            />
            <CategoryRow
              fallback="refresh-outline"
              icon="arrow.counterclockwise"
              title="Reset app"
              subtitle="Dev · delete all games, show onboarding"
              onPress={() => {
                close();
                void resetLibrary();
              }}
            />
          </>
        ) : null}
      </Tray.Section>
    </Tray.Body>
  );
}
