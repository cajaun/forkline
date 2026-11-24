import { View } from 'react-native';

import { useSetAtom } from 'jotai';
import { Tray, useTrayNavigation } from 'react-native-morpheus';

import { promotionPreviewAtom } from '@/components/sheet/board/promotion-tray';
import { OptionGrid, OptionLink, OptionTile } from '@/components/trays/shared/option-ui';
import { gameActions } from '@/stores/games';

import { CATEGORY_OPTIONS, CATEGORY_STEP_INDEX } from './constants';
import type { SettingsScope } from './types';

// waits for Settings to slide away so the promotion tray opens on a clear screen
const PREVIEW_DELAY_MS = 400;

export function SettingsHomeBody({ scope }: { scope: SettingsScope }) {
  const { close, next } = useTrayNavigation();
  const { resetLibrary, seedSampleHistory } = gameActions;
  const previewPromotion = useSetAtom(promotionPreviewAtom);
  const openCategory = (category: keyof typeof CATEGORY_STEP_INDEX) => {
    for (let step = 0; step < CATEGORY_STEP_INDEX[category]; step += 1) next();
  };

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 14 }}>
        <OptionGrid>
          {CATEGORY_OPTIONS.map(option => (
            <OptionTile
              key={option.key}
              label={option.title}
              onPress={() => openCategory(option.key)}
              visual={{ fallback: option.fallback, icon: option.icon }}
            />
          ))}
        </OptionGrid>
        {__DEV__ && scope === 'defaults' ? (
          <View style={{ gap: 10 }}>
            <OptionLink
              fallback="time-outline"
              icon="clock.arrow.circlepath"
              onPress={() => {
                seedSampleHistory();
                close();
              }}
              title="Add sample history"
              value="Dev · games on the past six days"
            />
            <OptionLink
              fallback="arrow-up-circle-outline"
              icon="arrow.up.circle"
              onPress={() => {
                close();
                setTimeout(() => previewPromotion('w'), PREVIEW_DELAY_MS);
              }}
              title="Show promotion tray"
              value="Dev · the piece picker for a pawn's last square"
            />
            <OptionLink
              fallback="refresh-outline"
              icon="arrow.counterclockwise"
              onPress={() => {
                close();
                void resetLibrary();
              }}
              title="Reset app"
              value="Dev · delete all games and show onboarding"
            />
          </View>
        ) : null}
      </Tray.Section>
    </Tray.Body>
  );
}
