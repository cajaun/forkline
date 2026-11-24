import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from './uniwind';

export type PressableScaleProps = {
  accessibilityLabel?: string;
  children: React.ReactNode;
  hitSlop?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  layout?: React.ComponentProps<typeof Animated.View>['layout'];
};

const ANIMATION_DURATION = 250;
const TAP_MAX_DISTANCE = 8;
const SCALE_ACTIVATION_DELAY_MS = 80;
const LONG_PRESS_MS = 450;

export const PressableScale: React.FC<PressableScaleProps> = ({
  accessibilityLabel,
  children,
  hitSlop,
  onLongPress,
  onPress,
  style,
  className,
  layout,
}) => {
  const active = useSharedValue(false);

  const gesture = Gesture.Tap()
    .maxDuration(4000)
    .maxDistance(TAP_MAX_DISTANCE)
    .onBegin(() => {
      active.value = true;
    })
    .onEnd((_event, success) => {
      active.value = false;

      if (success && onPress) {
        runOnJS(onPress)();
      }
    })
    .onFinalize(() => {
      active.value = false;
    });

  if (hitSlop !== undefined) {
    gesture.hitSlop(hitSlop);
  }

  // a hold wins over the tap so a cell can offer a second action
  const longPress = onLongPress
    ? Gesture.LongPress()
        .minDuration(LONG_PRESS_MS)
        .maxDistance(TAP_MAX_DISTANCE)
        .onStart(() => {
          active.value = false;
          runOnJS(onLongPress)();
        })
    : null;
  const composed = longPress ? Gesture.Exclusive(longPress, gesture) : gesture;

  // the shrink waits a moment so a quick tap does not flicker
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: active.value
          ? withDelay(
              SCALE_ACTIVATION_DELAY_MS,
              withTiming(0.95, {
                duration: ANIMATION_DURATION,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
              }),
            )
          : withTiming(1, {
              duration: ANIMATION_DURATION,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
      },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <AnimatedView
        accessibilityLabel={accessibilityLabel}
        className={className}
        layout={layout}
        style={[style, animatedStyle]}>
        {children}
      </AnimatedView>
    </GestureDetector>
  );
};
