import type { ComponentProps } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SFSymbol, type SymbolWeight } from 'expo-symbols';

type FallbackName = ComponentProps<typeof Ionicons>['name'];

export type SymbolName = SFSymbol;
export type SymbolFallback = FallbackName;

// draws the SF Symbol on iOS and the Ionicons fallback elsewhere
export function SfSymbol({
  fallback,
  name,
  size,
  tintColor,
  weight = 'semibold',
}: {
  fallback: FallbackName;
  name: SymbolName;
  size: number;
  tintColor: string;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      fallback={<Ionicons color={tintColor} name={fallback} size={size} />}
      name={name}
      size={size}
      tintColor={tintColor}
      weight={weight}
    />
  );
}
