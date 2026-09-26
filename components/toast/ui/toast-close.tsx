import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import { useThemeColor } from '../presentation';
import { cn } from '../shared';
import type { ToastCloseProps } from '../contracts';
import { DISPLAY_NAME } from './display-names';
import { Button } from './press-control';
import { CloseIcon } from './symbols';
import { useToastSurface } from './toast-context';
import { useToastVisualContext } from './resolve-toast-view';

export const ToastClose = forwardRef<View, ToastCloseProps>((props, ref) => {
  const {
    children,
    iconProps,
    size = 'sm',
    className,
    style,
    onPress,
    ...buttonProps
  } = props;
  const { hide, id, variant } = useToastSurface();
  const { toastOptions, variantOptions } = useToastVisualContext(variant);
  const mutedColor = useThemeColor('muted');

  const mergedStyle = useMemo(() => {
    if (typeof style === 'function') {
      return (state: any) => [
        toastOptions?.styles?.closeButton,
        variantOptions?.styles?.closeButton,
        style(state),
      ];
    }

    return [
      toastOptions?.styles?.closeButton,
      variantOptions?.styles?.closeButton,
      style,
    ];
  }, [
    style,
    toastOptions?.styles?.closeButton,
    variantOptions?.styles?.closeButton,
  ]);

  const handlePress: ToastCloseProps['onPress'] = (event) => {
    if (id) hide?.(id);
    onPress?.(event);
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size={size}
      isIconOnly
      aria-label="Close"
      className={cn(
        className,
        toastOptions?.classNames?.closeButton,
        variantOptions?.classNames?.closeButton
      )}
      style={mergedStyle}
      onPress={handlePress}
      {...buttonProps}
    >
      {children ?? (
        <CloseIcon
          size={iconProps?.size ?? 16}
          color={iconProps?.color ?? mutedColor}
        />
      )}
    </Button>
  );
});

ToastClose.displayName = DISPLAY_NAME.TOAST_CLOSE;
