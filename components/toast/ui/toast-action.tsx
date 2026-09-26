import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import { useThemeColor } from '../presentation';
import { cn } from '../shared';
import { toastClassNames } from '../presentation';
import type { ToastActionProps } from '../contracts';
import { DISPLAY_NAME } from './display-names';
import { Button } from './press-control';
import { useToastSurface } from './toast-context';
import { useToastVisualContext } from './resolve-toast-view';

export const ToastAction = forwardRef<View, ToastActionProps>((props, ref) => {
  const {
    children,
    variant,
    size = 'sm',
    animation,
    className,
    style,
    ...buttonProps
  } = props;

  const { variant: surfaceVariant } = useToastSurface();
  const { toastOptions, variantOptions } =
    useToastVisualContext(surfaceVariant);
  const [
    defaultHover,
    infoHover,
    successHover,
    warningHover,
    dangerHover,
  ] = useThemeColor([
    'default-hover',
    'info-hover',
    'success-hover',
    'warning-hover',
    'danger-hover',
  ]);

  const highlightColor = useMemo(() => {
    switch (surfaceVariant) {
      case 'info':
        return infoHover;
      case 'success':
        return successHover;
      case 'warning':
        return warningHover;
      case 'danger':
        return dangerHover;
      default:
        return defaultHover;
    }
  }, [
    surfaceVariant,
    defaultHover,
    infoHover,
    successHover,
    warningHover,
    dangerHover,
  ]);

  const resolvedVariant = useMemo(() => {
    if (variant) return variant;
    if (surfaceVariant === 'info') return 'primary';
    if (surfaceVariant === 'danger') return 'danger';
    return 'tertiary';
  }, [surfaceVariant, variant]);

  const resolvedAnimation =
    typeof animation === 'object' && animation !== null ? animation : undefined;

  const mergedAnimation = useMemo<ToastActionProps['animation']>(() => {
    if (
      animation === false ||
      animation === 'disabled' ||
      animation === 'disable-all'
    ) {
      return animation;
    }

    return {
      scale: false,
      ...resolvedAnimation,
      highlight: resolvedAnimation?.highlight ?? {
        backgroundColor: { value: highlightColor },
        opacity: { value: [0, 1] as [number, number] },
      },
    };
  }, [animation, resolvedAnimation, highlightColor]);

  const mergedStyle = useMemo(() => {
    if (typeof style === 'function') {
      return (state: any) => [
        toastOptions?.styles?.actionButton,
        variantOptions?.styles?.actionButton,
        style(state),
      ];
    }

    return [
      toastOptions?.styles?.actionButton,
      variantOptions?.styles?.actionButton,
      style,
    ];
  }, [
    style,
    toastOptions?.styles?.actionButton,
    variantOptions?.styles?.actionButton,
  ]);

  return (
    <Button
      ref={ref}
      variant={resolvedVariant}
      size={size}
      className={cn(
        toastClassNames.action({ variant: surfaceVariant, className }),
        toastOptions?.classNames?.actionButton,
        variantOptions?.classNames?.actionButton
      )}
      style={mergedStyle}
      feedbackVariant="scale-highlight"
      animation={mergedAnimation}
      {...buttonProps}
    >
      {children}
    </Button>
  );
});

ToastAction.displayName = DISPLAY_NAME.TOAST_ACTION;
