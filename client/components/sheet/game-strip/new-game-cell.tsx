import { memo } from 'react';
import { View } from 'react-native';

import * as Haptics from '@/services/haptics';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { gameActions } from '@/stores/games';

import { PILL_WIDTH_RATIO } from './game-cell';

// the last column starts a game with the default settings
export const NewGameCell = memo(function NewGameCell({ width }: { width: number }) {
  const { colors } = useSheetColors();

  return (
    <View
      style={{
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        width,
      }}
    >
      <PressableScale
        accessibilityLabel="New game"
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          gameActions.createGame();
        }}
        style={{
          alignItems: 'center',
          backgroundColor: colors.selectedDateBackground,
          borderCurve: 'continuous',
          borderRadius: 23,
          height: '100%',
          justifyContent: 'center',
          width: width * PILL_WIDTH_RATIO,
        }}
      >
        <SfSymbol fallback="add" name="plus" size={26} tintColor={colors.text} weight="bold" />
      </PressableScale>
    </View>
  );
});
