import { Tray, useTrayFlow } from 'react-native-morpheus';

import { CategoryRow } from './components/category-row';
import { CATEGORY_OPTIONS, CATEGORY_STEP_INDEX } from './constants';

export function SettingsHomeBody() {
  const { next } = useTrayFlow();
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
            onPress={() => openCategory(option.key)}
          />
        ))}
      </Tray.Section>
    </Tray.Body>
  );
}
