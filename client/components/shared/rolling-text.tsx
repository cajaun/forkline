import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { LayoutChangeEvent, StyleProp, TextStyle } from 'react-native';

import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const ROLL_DURATION = 420;
// each changed character starts this share of the roll after the previous one
const STAGGER = 0.14;
const TRAVEL = 0.55;

type Roll = { from: string; id: number; to: string };

function RollingChar({
  char,
  lineHeight,
  order,
  previous,
  progress,
  steps,
  style,
}: {
  char: string;
  lineHeight: number;
  order: number;
  previous: string;
  progress: SharedValue<number>;
  steps: number;
  style: StyleProp<TextStyle>;
}) {
  // squeeze every changed character's roll into the shared clock, staggered
  const span = 1 - STAGGER * Math.max(steps - 1, 0);
  const start = STAGGER * order;
  const local = (value: number) => {
    'worklet';
    return interpolate(value, [start, start + span], [0, 1], Extrapolation.CLAMP);
  };
  const outgoing = useAnimatedStyle(() => {
    const t = local(progress.value);
    return {
      opacity: 1 - t,
      transform: [
        { translateY: -t * lineHeight * TRAVEL },
        { scaleY: 1 - t * 0.25 },
      ],
    };
  });
  const incoming = useAnimatedStyle(() => {
    const t = local(progress.value);
    return {
      opacity: t,
      transform: [
        { translateY: (1 - t) * lineHeight * TRAVEL },
        { scaleY: 0.75 + t * 0.25 },
      ],
    };
  });

  return (
    <View>
      <Animated.Text style={[style, incoming]}>{char}</Animated.Text>
      {previous ? (
        <Animated.Text
          style={[style, outgoing, { left: 0, position: 'absolute', right: 0, textAlign: 'center' }]}>
          {previous}
        </Animated.Text>
      ) : null}
    </View>
  );
}

// rolls only the changed characters in turn, then settles into one Text so kerning matches the UI
export function RollingText({
  lineHeight,
  onLayout,
  style,
  text,
}: {
  lineHeight: number;
  onLayout?: (event: LayoutChangeEvent) => void;
  style: StyleProp<TextStyle>;
  text: string;
}) {
  const [roll, setRoll] = useState<Roll | null>(null);
  const shown = useRef(text);
  const rollId = useRef(0);
  const progress = useSharedValue(1);

  const finishRoll = useCallback((id: number) => {
    // a newer roll may have started in the meantime
    if (id === rollId.current) setRoll(null);
  }, []);

  useEffect(() => {
    if (text === shown.current) return;
    const from = shown.current;
    shown.current = text;
    rollId.current += 1;
    const id = rollId.current;
    setRoll({ from, id, to: text });
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: ROLL_DURATION, easing: Easing.out(Easing.cubic) },
      finished => {
        if (finished) runOnJS(finishRoll)(id);
      },
    );
  }, [finishRoll, progress, text]);

  if (!roll) {
    return (
      <Text onLayout={onLayout} style={style}>
        {text}
      </Text>
    );
  }

  const target = Array.from(roll.to);
  const source = Array.from(roll.from);
  // walk the longer string so characters that disappear still roll out
  const slots = Array.from(
    { length: Math.max(target.length, source.length) },
    (_, index) => target[index] ?? '',
  );
  const changed = slots.map((char, index) => char !== (source[index] ?? ''));
  const steps = changed.filter(Boolean).length;
  let order = 0;

  return (
    <View onLayout={onLayout} style={{ flexDirection: 'row' }}>
      {slots.map((char, index) => {
        if (!changed[index]) {
          return (
            <Text key={`${roll.id}-${index}`} style={style}>
              {char}
            </Text>
          );
        }
        const charOrder = order;
        order += 1;
        return (
          <RollingChar
            key={`${roll.id}-${index}`}
            char={char}
            lineHeight={lineHeight}
            order={charOrder}
            previous={source[index] ?? ''}
            progress={progress}
            steps={steps}
            style={style}
          />
        );
      })}
    </View>
  );
}
