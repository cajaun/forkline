import { useLayoutEffect, useRef, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';

import { useTrayMorphProgress } from 'react-native-morpheus';
import { TRAY_PRIMARY_BUTTON_HEIGHT } from 'react-native-morpheus/constants';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/shared/pressable-scale';
import { trayText } from '@/components/shared/tokens';
import { TrayButton } from '@/components/trays/shared/tray-button';
import { useSheetColors } from '@/hooks/use-sheet-colors';

const { width: windowWidth } = Dimensions.get('window');

// sizes from the Morpheus AnimatedOnboardingButton
const BUTTON_WIDTH = windowWidth * 0.82;
const MIN_BUTTON_WIDTH = windowWidth * 0.4;
const GAP = 10;
const ACTION_WIDTH = BUTTON_WIDTH - MIN_BUTTON_WIDTH - GAP;
const HEIGHT = TRAY_PRIMARY_BUTTON_HEIGHT;

export type SplitAction = {
  backgroundColor?: string;
  label: string;
  onPress: () => void;
  textColor?: string;
};

// a full width Cancel that shrinks left to uncover the action beneath it
export function SplitButton({
  action,
  cancelLabel = 'Cancel',
  onCancel,
  step,
}: {
  action: SplitAction | null;
  cancelLabel?: string;
  onCancel: () => void;
  step: number;
}) {
  const { colors } = useSheetColors();
  const [shown, setShown] = useState<SplitAction | null>(action);
  if (action && action.label !== shown?.label) setShown(action);

  const split = action !== null;
  const morphProgress = useTrayMorphProgress();
  const initial = split ? 1 : 0;
  const from = useSharedValue(initial);
  const to = useSharedValue(initial);
  const previousRef = useRef({ step, target: initial });

  // a step change sets where the split starts and ends and the tray morph carries it
  useLayoutEffect(() => {
    const target = split ? 1 : 0;
    const previous = previousRef.current;
    if (previous.step === step && previous.target === target) return;
    from.set(previous.target);
    to.set(target);
    previousRef.current = { step, target };
  }, [from, split, step, to]);

  const progress = useDerivedValue(() => interpolate(morphProgress.get(), [0, 1], [from.get(), to.get()]));

  // Cancel moves with transforms since an animated width trips the React Native layout asserts
  const cancelWidth = useDerivedValue(() =>
    interpolate(progress.get(), [0, 1], [BUTTON_WIDTH, MIN_BUTTON_WIDTH]),
  );
  const middleStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.max(0, cancelWidth.get() - HEIGHT) / (BUTTON_WIDTH - HEIGHT) }],
  }));
  const rightCapStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cancelWidth.get() - BUTTON_WIDTH }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (cancelWidth.get() - BUTTON_WIDTH) / 2 }],
  }));
  const actionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.get(), [0, 1], [0.96, 1]) }],
  }));

  const cap = {
    borderRadius: HEIGHT / 2,
    height: HEIGHT,
    position: 'absolute' as const,
    width: HEIGHT,
  };

  return (
    <View style={{ height: HEIGHT, justifyContent: 'center', width: BUTTON_WIDTH }}>
      <Animated.View
        pointerEvents={split ? 'auto' : 'none'}
        style={[{ height: HEIGHT, position: 'absolute', right: 0, width: ACTION_WIDTH }, actionStyle]}>
        <TrayButton
          color={shown?.backgroundColor}
          label={shown?.label ?? ''}
          onPress={action?.onPress}
          style={{ width: '100%' }}
          textColor={shown?.textColor}
          tone="primary"
        />
      </Animated.View>

      <PressableScale
        accessibilityLabel={cancelLabel}
        onPress={onCancel}
        style={{
          height: HEIGHT,
          left: 0,
          overflow: 'visible',
          position: 'absolute',
          // the tap area changes once per step to free the action half
          width: split ? MIN_BUTTON_WIDTH : BUTTON_WIDTH,
        }}>
        <View
          pointerEvents="none"
          style={{ height: HEIGHT, left: 0, position: 'absolute', width: BUTTON_WIDTH }}>
          <View style={[cap, { backgroundColor: colors.controlBackground, left: 0 }]} />
          <Animated.View
            style={[
              {
                backgroundColor: colors.controlBackground,
                height: HEIGHT,
                left: HEIGHT / 2,
                position: 'absolute',
                transformOrigin: 'left',
                width: BUTTON_WIDTH - HEIGHT,
              },
              middleStyle,
            ]}
          />
          <Animated.View
            style={[
              cap,
              { backgroundColor: colors.controlBackground, left: BUTTON_WIDTH - HEIGHT },
              rightCapStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                alignItems: 'center',
                height: HEIGHT,
                justifyContent: 'center',
                position: 'absolute',
                width: BUTTON_WIDTH,
              },
              labelStyle,
            ]}>
            <Text className="font-semibold" style={[trayText.Button, { color: colors.text }]}>
              {cancelLabel}
            </Text>
          </Animated.View>
        </View>
      </PressableScale>
    </View>
  );
}
