import { StyleSheet } from 'react-native';
import { cn } from '../shared';
import type { ToastVariant, ToastTextSize } from '../contracts';

/**
 * Toast root styles
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The following properties are animated and cannot be overridden using Tailwind classes:
 * - `opacity` - Animated for visibility transitions when toasts are pushed beyond visible stack limits
 * - `transform` (translateY) - Animated for vertical position transitions when toasts are stacked, and for swipe-to-dismiss gestures
 * - `transform` (scale) - Animated for size scaling transitions when toasts are stacked (toasts behind active one are scaled down)
 * - `height` - Animated for height transitions when toast content changes
 *
 * To customize these properties, use the `animation` prop on `Toast.Root`:
 * ```tsx
 * <Toast.Root
 *   animation={{
 *     opacity: {
 *       value: [1, 0],
 *       timingConfig: { duration: 300 }
 *     },
 *     translateY: {
 *       value: [0, 10],
 *       timingConfig: { duration: 300 }
 *     },
 *     scale: {
 *       value: [1, 0.97],
 *       timingConfig: { duration: 300 }
 *     }
 *   }}
 * />
 * ```
 *
 * To completely disable animated styles and apply your own via className or style prop,
 * set `isAnimatedStyleActive={false}` on `Toast.Root`.
 */
const labelByVariant: Record<ToastVariant, string> = {
  default: 'text-foreground',
  info: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

const actionByVariant: Record<ToastVariant, string> = {
  default: '',
  info: '',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: '',
};

export const toastVariantColors: Record<ToastVariant, string> = {
  default: '#11181c',
  info: '#11181c',
  success: '#17c964',
  warning: '#f5a524',
  danger: '#f31260',
};

export const toastVariantColorsByScheme: Record<
  'light' | 'dark',
  Record<ToastVariant, string>
> = {
  light: {
    default: '#111111',
    info: '#0973dc',
    success: '#008a2e',
    warning: '#dc7609',
    danger: '#e60000',
  },
  dark: {
    default: '#ffffff',
    info: '#5896f3',
    success: '#59f3a6',
    warning: '#f3cf58',
    danger: '#ff9ea1',
  },
};

const toastVariantBackgroundsByScheme: Record<
  'light' | 'dark',
  Record<ToastVariant, string | undefined>
> = {
  light: {
    default: undefined,
    info: '#f0f8ff',
    success: '#ecfdf3',
    warning: '#fffcf0',
    danger: '#fff0f0',
  },
  dark: {
    default: undefined,
    info: '#000d1f',
    success: '#001f0f',
    warning: '#1d1f00',
    danger: '#2d0607',
  },
};

const toastVariantBordersByScheme: Record<
  'light' | 'dark',
  Record<ToastVariant, string | undefined>
> = {
  light: {
    default: undefined,
    info: '#dfe9fe',
    success: '#c5fbd3',
    warning: '#faedb4',
    danger: '#ffe0e0',
  },
  dark: {
    default: undefined,
    info: '#192849',
    success: '#003d17',
    warning: '#2e2e00',
    danger: '#4d050b',
  },
};

export function getToastThemeStyles(
  colorScheme: 'light' | 'dark',
  variant: ToastVariant = 'default'
) {
  const isDark = colorScheme === 'dark';
  const semanticText = toastVariantColorsByScheme[colorScheme][variant];
  const semanticBackground = toastVariantBackgroundsByScheme[colorScheme][variant];
  const semanticBorder = toastVariantBordersByScheme[colorScheme][variant];
  const defaultOutline = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)';

  return {
    root: {
      backgroundColor: semanticBackground ?? (isDark ? '#000000' : '#ffffff'),
      borderColor: semanticBorder ?? 'transparent',
    },
    outline:
      variant === 'default'
        ? {
            boxShadow: `inset 0px 0px 0px 0.5px ${defaultOutline}`,
          }
        : undefined,
    title: {
      color: semanticText,
    },
    description: {
      color:
        variant === 'default'
          ? isDark
            ? '#a1a1aa'
            : '#52525b'
          : semanticText,
    },
  };
}

export const toastTextSizeStyles: Record<
  ToastTextSize,
  {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
  }
> = {
  largeTitle: { fontSize: 34, lineHeight: 41, letterSpacing: 0.4 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: 0.3 },
  title2: { fontSize: 22, lineHeight: 28, letterSpacing: 0.2 },
  title3: { fontSize: 20, lineHeight: 26, letterSpacing: 0.2 },
  headline: { fontSize: 17, lineHeight: 22, letterSpacing: 0.1 },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  caption2: { fontSize: 11, lineHeight: 15, letterSpacing: 0 },
  footnote: { fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  subheadline: { fontSize: 15, lineHeight: 20, letterSpacing: 0.1 },
  callout: { fontSize: 16, lineHeight: 21, letterSpacing: 0.1 },
  body: { fontSize: 17, lineHeight: 22, letterSpacing: 0.1 },
};

export const toastClassNames = {
  root: ({ className }: { className?: string } = {}) =>
    cn(className),
  label: ({
    variant = 'default',
    className,
  }: {
    variant?: ToastVariant;
    className?: string;
  } = {}) => cn(labelByVariant[variant], className),
  description: ({ className }: { className?: string } = {}) =>
    cn(className),
  action: ({
    variant = 'default',
    className,
  }: {
    variant?: ToastVariant;
    className?: string;
  } = {}) => cn(actionByVariant[variant], className),
};

export const toastStyleSheet = StyleSheet.create({
  root: {
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  defaultToastRoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
  },
  outline: {
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    pointerEvents: 'none',
  },
  placementTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  placementBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholderTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  placeholderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  hiddenMeasure: {
    position: 'absolute',
    opacity: 0,
  },
  fill: {
    flex: 1,
  },
});
