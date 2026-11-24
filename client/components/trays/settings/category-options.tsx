import { AppearanceOptions, type AppearanceOptionsProps } from './categories/appearance';
import { GameOptions, type GameOptionsProps } from './categories/game';
import { HapticsOptions, type HapticsOptionsProps } from './categories/haptics';
import { GameplayOptions, type GameplayOptionsProps } from './categories/gameplay';
import type { Category } from './types';

export function CategoryOptions({
  category,
  game,
  gameplay,
  appearance,
  haptics,
}: {
  category: Category;
  game: GameOptionsProps;
  gameplay: GameplayOptionsProps;
  appearance: AppearanceOptionsProps;
  haptics: HapticsOptionsProps;
}) {
  if (category === 'game') {
    return <GameOptions {...game} />;
  }

  if (category === 'gameplay') {
    return <GameplayOptions {...gameplay} />;
  }

  if (category === 'appearance') {
    return <AppearanceOptions {...appearance} />;
  }

  if (category === 'haptics') {
    return <HapticsOptions {...haptics} />;
  }
}
