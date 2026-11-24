import { memo, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';

import { Host, Text as SwiftUIText } from '@expo/ui/swift-ui';
import {
  Animation,
  animation,
  contentTransition,
  font,
  foregroundStyle,
  frame,
  kerning,
  monospacedDigit,
  onGeometryChange,
} from '@expo/ui/swift-ui/modifiers';

import { RollingText } from './rolling-text';

// SwiftUI infinity cannot cross the bridge so a width larger than any screen stands in
const FILL_MAX_WIDTH = 10_000;

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';

// iOS rolls characters with the SwiftUI numericText transition and other platforms use RollingText
export const TransitionText = memo(function TransitionText({
  color,
  fillWidth = false,
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
  fillWidth?: boolean;
  letterSpacing?: number;
  lineHeight: number;
  monospacedDigits?: boolean;
  onWidth?: (width: number) => void;
  size: number;
  text: string;
  value: number;
  weight: Weight;
}) {
  const [direction, setDirection] = useState({ countsDown: false, value });
  // the roll counts down for a smaller value
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
      // reads the text width before the frame widens it to the row
      ...(fillWidth && onWidth ? [onGeometryChange(geometry => onWidth(geometry.width))] : []),
      ...(fillWidth ? [frame({ height: lineHeight, maxWidth: FILL_MAX_WIDTH })] : []),
      animation(Animation.default, value),
    ],
    [color, direction.countsDown, fillWidth, letterSpacing, lineHeight, monospacedDigits, onWidth, size, value, weight],
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

  if (fillWidth) {
    return (
      <Host style={{ alignSelf: 'stretch', height: lineHeight }}>
        <SwiftUIText modifiers={modifiers}>{text}</SwiftUIText>
      </Host>
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

export const NumericText = TransitionText;

const RN_WEIGHTS = {
  black: '900',
  bold: '700',
  heavy: '800',
  medium: '500',
  regular: '400',
  semibold: '600',
} as const;
