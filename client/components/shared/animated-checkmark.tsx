import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// These values mirror the reference recording: the circle arrives quickly,
// while the check stroke finishes drawing a little after the scale settles.
const CIRCLE_ENTER_DURATION = 100;
const CIRCLE_EXIT_DURATION = 100;
const CHECK_DRAW_DURATION = 180;
const CHECK_PATH_LENGTH = 18.6;

export function AnimatedCheckmark({
  selected,
  size = 22,
  color = '#262626',
}: {
  selected: boolean;
  size?: number;
  color?: string;
}) {
  const circleScale = useSharedValue(selected ? 1 : 0);
  const checkProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    circleScale.value = withTiming(selected ? 1 : 0, {
      duration: selected ? CIRCLE_ENTER_DURATION : CIRCLE_EXIT_DURATION,
      easing: selected ? Easing.linear : Easing.in(Easing.quad),
    });
    checkProgress.value = withTiming(selected ? 1 : 0, {
      duration: selected ? CHECK_DRAW_DURATION : CIRCLE_EXIT_DURATION,
      easing: selected ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
    });
  }, [checkProgress, circleScale, selected]);

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleScale.value,
    transform: [{ scale: circleScale.value }],
  }));

  const checkmarkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_PATH_LENGTH * (1 - checkProgress.value),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          alignItems: 'center',
          backgroundColor: color,
          borderRadius: size / 2,
          height: size,
          justifyContent: 'center',
          width: size,
        },
        circleStyle,
      ]}>
      <Svg height={size} viewBox="0 0 28 28" width={size}>
        <AnimatedPath
          animatedProps={checkmarkProps}
          d="M7 14.5 11.5 19 20.5 10.75"
          fill="none"
          stroke="#FFFFFF"
          strokeDasharray={CHECK_PATH_LENGTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
      </Svg>
    </Animated.View>
  );
}
