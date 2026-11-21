import { memo, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';

import { Host, Text as SwiftUIText } from '@expo/ui/swift-ui';
import {
  Animation,
  animation,
  contentTransition,
  font,
  foregroundStyle,
  kerning,
  monospacedDigit,
} from '@expo/ui/swift-ui/modifiers';

import { RollingText } from './rolling-text';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';

// iOS rolls the characters with SwiftUI's numericText transition, counting down for a smaller value, and other platforms use RollingText
export const TransitionText = memo(function TransitionText({
  color,
  letterSpacing,
  lineHeight,
  monospacedDigits = false,
  onWidth,
  size,
  text,
  value,
  weight,
}: {
  color: string;
  letterSpacing?: number;
  // the row height the text is centred in, matching the old RN line height
  lineHeight: number;
  // equal-width digits, so a ticking clock doesn't change width every second
  monospacedDigits?: boolean;
  onWidth?: (width: number) => void;
  size: number;
  text: string;
  // drives the transition: it animates when this number changes
  value: number;
  weight: Weight;
}) {
  // the direction the value last moved, derived during render
  const [direction, setDirection] = useState({ countsDown: false, value });
  if (direction.value !== value) {
    setDirection({ countsDown: value < direction.value, value });
  }

  const modifiers = useMemo(
    () => [
      font({ size, weight }),
      ...(letterSpacing !== undefined ? [kerning(letterSpacing)] : []),
      ...(monospacedDigits ? [monospacedDigit()] : []),
      foregroundStyle(color),
      contentTransition('numericText', { countsDown: direction.countsDown }),
      animation(Animation.default, value),
    ],
    [color, direction.countsDown, letterSpacing, monospacedDigits, size, value, weight],
  );

  if (Platform.OS !== 'ios') {
    return (
      <RollingText
        lineHeight={lineHeight}
        onLayout={event => onWidth?.(event.nativeEvent.layout.width)}
        style={{
          color,
          fontSize: size,
          fontVariant: monospacedDigits ? ['tabular-nums'] : undefined,
          fontWeight: RN_WEIGHTS[weight],
          letterSpacing,
          lineHeight,
        }}
        text={text}
      />
    );
  }

  return (
    <View style={{ alignItems: 'center', height: lineHeight, justifyContent: 'center' }}>
      <Host
        matchContents
        onLayoutContent={event => onWidth?.(event.nativeEvent.width)}>
        <SwiftUIText modifiers={modifiers}>{text}</SwiftUIText>
      </Host>
    </View>
  );
});

// the game clock: same transition, keyed to whole seconds
export const NumericText = TransitionText;

const RN_WEIGHTS = {
  black: '900',
  bold: '700',
  heavy: '800',
  medium: '500',
  regular: '400',
  semibold: '600',
} as const;
