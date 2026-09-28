import {
  AppearanceOptions,
  type AppearanceOptionsProps,
} from './categories/appearance';
import { GameOptions, type GameOptionsProps } from './categories/game';
import {
  GameplayOptions,
  type GameplayOptionsProps,
} from './categories/gameplay';
import { MatchOptions, type MatchOptionsProps } from './categories/match';
import type { Category } from './types';

export function CategoryOptions({
  category,
  game,
  gameplay,
  match,
  appearance,
}: {
  category: Category;
  game: GameOptionsProps;
  gameplay: GameplayOptionsProps;
  match: MatchOptionsProps;
  appearance: AppearanceOptionsProps;
}) {
  if (category === 'game') {
    return <GameOptions {...game} />;
  }

  if (category === 'gameplay') {
    return <GameplayOptions {...gameplay} />;
  }

  if (category === 'match') {
    return <MatchOptions {...match} />;
  }

  if (category === 'appearance') {
    return <AppearanceOptions {...appearance} />;
  }

}
