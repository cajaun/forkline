import { useMemo } from 'react';
import { useToastConfig } from '../runtime/toast-settings';
import { getToastThemeStyles } from '../presentation';
import type {
  ToastColorScheme,
  ToastGlobalConfig,
  ToastOptions,
  ToastRootProps,
  ToastVariant,
} from '../contracts';

export const defaultIconByVariant = {
  success: 'checkmark.circle.fill',
  warning: 'exclamationmark.triangle.fill',
  danger: 'exclamationmark.circle.fill',
  info: 'info.circle.fill',
} as const;

export function getToastColorScheme(
  toastOptions: ToastOptions | undefined
): ToastColorScheme {
  return toastOptions?.colorScheme ?? 'light';
}

export function getVariantOptions(
  toastOptions: ToastOptions | undefined,
  variant: ToastVariant | undefined
) {
  return variant ? toastOptions?.variants?.[variant] : undefined;
}

export function resolveToastRootConfig(
  globalConfig: ToastGlobalConfig | undefined,
  props: Pick<
    ToastRootProps,
    'variant' | 'placement' | 'animation' | 'isSwipeable'
  >
) {
  return {
    variant: props.variant ?? globalConfig?.variant ?? 'default',
    placement: props.placement ?? globalConfig?.placement ?? 'top',
    animation: props.animation ?? globalConfig?.animation,
    isSwipeable: props.isSwipeable ?? globalConfig?.isSwipeable,
  };
}

export function useToastVisualContext(variant: ToastVariant) {
  const globalConfig = useToastConfig();
  const toastOptions = globalConfig?.toastOptions;
  const colorScheme = getToastColorScheme(toastOptions);
  const variantOptions = getVariantOptions(toastOptions, variant);
  const themeStyles = useMemo(
    () => getToastThemeStyles(colorScheme, variant),
    [colorScheme, variant]
  );

  return {
    globalConfig,
    toastOptions,
    variantOptions,
    colorScheme,
    themeStyles,
  };
}
