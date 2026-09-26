import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { AnimationSettingsProvider } from '../motion/motion-scope';
import { useToastRootAnimation } from '../motion/use-toast-motion';
import * as AccessibleToast from '../base/accessible-toast';
import { useToastConfig } from '../runtime/toast-settings';
import { cn } from '../shared';
import {
  toastClassNames,
  toastStyleSheet,
} from '../presentation';
import type { ToastComponentProps, ToastRootProps, ViewRef } from '../contracts';
import { DISPLAY_NAME } from './display-names';
import { resolveToastRootConfig, useToastVisualContext } from './resolve-toast-view';
import { ToastSurfaceProvider } from './toast-context';
import { useVerticalPlaceholderStyles } from './use-placeholder-fill';

const AnimatedAccessibleToast = Animated.createAnimatedComponent(
  AccessibleToast.Root
);

export const ToastFrame = forwardRef<ViewRef, ToastRootProps>((props, ref) => {
  const {
    children,
    variant: localVariant,
    placement: localPlacement,
    index,
    total,
    heights,
    maxVisibleToasts,
    className,
    style,
    animation: localAnimation,
    isSwipeable: localIsSwipeable,
    isAnimatedStyleActive = true,
    hide,
    ...rootProps
  } = props;

  const globalConfig = useToastConfig();
  const { variant, placement, animation, isSwipeable } = resolveToastRootConfig(
    globalConfig,
    {
      variant: localVariant,
      placement: localPlacement,
      animation: localAnimation,
      isSwipeable: localIsSwipeable,
    }
  );
  const { toastOptions, variantOptions, themeStyles } =
    useToastVisualContext(variant);
  const { id } = props as ToastRootProps & Pick<ToastComponentProps, 'id'>;

  const motion = useToastRootAnimation({
    animation,
    index,
    total,
    heights,
    placement,
    hide,
    id,
    isSwipeable,
    maxVisibleToasts,
  });

  const shellStyle = isAnimatedStyleActive
    ? [
        toastStyleSheet.root,
        themeStyles.root,
        motion.rContainerStyle,
        toastOptions?.styles?.toast,
        variantOptions?.styles?.toast,
        style,
      ]
    : [
        toastStyleSheet.root,
        themeStyles.root,
        toastOptions?.styles?.toast,
        variantOptions?.styles?.toast,
        style,
      ];

  const { topStyle, bottomStyle } = useVerticalPlaceholderStyles({
    style: shellStyle,
  });

  const motionScope = useMemo(
    () => ({ isAllAnimationsDisabled: motion.isAllAnimationsDisabled }),
    [motion.isAllAnimationsDisabled]
  );

  const surfaceContext = useMemo(
    () => ({ variant, hide, id }),
    [variant, hide, id]
  );

  return (
    <AnimationSettingsProvider value={motionScope}>
      <ToastSurfaceProvider value={surfaceContext}>
        <GestureDetector gesture={motion.panGesture}>
          <Animated.View
            style={
              placement === 'top'
                ? toastStyleSheet.placementTop
                : toastStyleSheet.placementBottom
            }
            entering={motion.entering}
            exiting={motion.exiting}
          >
            <AnimatedAccessibleToast
              ref={ref}
              className={cn(
                toastClassNames.root({ className }),
                toastOptions?.classNames?.toast,
                variantOptions?.classNames?.toast
              )}
              style={shellStyle}
              {...rootProps}
            >
              {children}
              <View style={[toastStyleSheet.placeholderTop, topStyle]} />
              <View style={[toastStyleSheet.placeholderBottom, bottomStyle]} />
              {themeStyles.outline ? (
                <View
                  pointerEvents="none"
                  style={[
                    toastStyleSheet.outline,
                    themeStyles.outline,
                    toastOptions?.styles?.outline,
                    variantOptions?.styles?.outline,
                  ]}
                />
              ) : null}
            </AnimatedAccessibleToast>

            <AnimatedAccessibleToast
              pointerEvents="none"
              style={[
                toastStyleSheet.root,
                toastStyleSheet.hiddenMeasure,
                style,
              ]}
              onLayout={(event) => {
                const measuredHeight = event.nativeEvent.layout.height;
                heights.modify((value) => {
                  'worklet';
                  return { ...value, [id]: measuredHeight };
                });
              }}
              {...rootProps}
            >
              {children}
            </AnimatedAccessibleToast>
          </Animated.View>
        </GestureDetector>
      </ToastSurfaceProvider>
    </AnimationSettingsProvider>
  );
});

ToastFrame.displayName = DISPLAY_NAME.TOAST_ROOT;
