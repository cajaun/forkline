import { forwardRef } from 'react';
import { cn } from '../shared';
import {
  toastClassNames,
  toastStyleSheet,
  toastTextSizeStyles,
} from '../presentation';
import type {
  TextRef,
  ToastDescriptionProps,
  ToastTitleProps,
} from '../contracts';
import { DISPLAY_NAME } from './display-names';
import { ToastText } from './typography';
import { useToastSurface } from './toast-context';
import { useToastVisualContext } from './resolve-toast-view';

export const ToastTitle = forwardRef<TextRef, ToastTitleProps>((props, ref) => {
  const {
    children,
    className,
    style,
    textSize = 'subheadline',
    ...textProps
  } = props;
  const { variant } = useToastSurface();
  const { toastOptions, variantOptions, themeStyles } =
    useToastVisualContext(variant);

  return (
    <ToastText
      ref={ref}
      className={cn(
        toastClassNames.label({ variant, className }),
        toastOptions?.classNames?.title,
        variantOptions?.classNames?.title
      )}
      style={[
        toastStyleSheet.title,
        toastTextSizeStyles[textSize],
        themeStyles.title,
        toastOptions?.styles?.title,
        variantOptions?.styles?.title,
        style,
      ]}
      {...textProps}
    >
      {children}
    </ToastText>
  );
});

export const ToastDescription = forwardRef<TextRef, ToastDescriptionProps>(
  (props, ref) => {
    const {
      children,
      className,
      style,
      textSize = 'footnote',
      ...textProps
    } = props;
    const { variant } = useToastSurface();
    const { toastOptions, variantOptions, themeStyles } =
      useToastVisualContext(variant);

    return (
      <ToastText
        ref={ref}
        className={cn(
          toastClassNames.description({ className }),
          toastOptions?.classNames?.description,
          variantOptions?.classNames?.description
        )}
        style={[
          toastStyleSheet.description,
          toastTextSizeStyles[textSize],
          themeStyles.description,
          toastOptions?.styles?.description,
          variantOptions?.styles?.description,
          style,
        ]}
        {...textProps}
      >
        {children}
      </ToastText>
    );
  }
);

ToastTitle.displayName = DISPLAY_NAME.TOAST_TITLE;
ToastDescription.displayName = DISPLAY_NAME.TOAST_DESCRIPTION;
