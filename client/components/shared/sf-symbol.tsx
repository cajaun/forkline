import type { ComponentProps } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SFSymbol, type SymbolWeight } from 'expo-symbols';

type ExtendedSymbol = SFSymbol | 'laurel.leading.laurel.trailing';
type FallbackName = ComponentProps<typeof Ionicons>['name'];

export function SfSymbol({
  fallback,
  name,
  size,
  tintColor,
  weight = 'semibold',
}: {
  fallback: FallbackName;
  name: ExtendedSymbol;
  size: number;
  tintColor: string;
  weight?: SymbolWeight;
}) {
  // use native symbols first and Ionicons as the fallback
  return (
    <SymbolView
      fallback={<Ionicons color={tintColor} name={fallback} size={size} />}
      name={name as SFSymbol}
      size={size}
      tintColor={tintColor}
      weight={weight}
    />
  );
}
