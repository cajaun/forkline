import { forwardRef, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { AnimationRoot, PressableRef } from '../contracts';
import { ToastText } from './typography';
import { cn } from '../shared';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'danger-soft';

type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonRootProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isIconOnly?: boolean;
  isDisabled?: boolean;
  className?: string;
  animation?: AnimationRoot<Record<string, any>>;
  feedbackVariant?: 'none' | 'scale-highlight' | 'scale-ripple';
}

export type ButtonRootPropsScaleHighlight = ButtonRootProps;

const rootBase = 'items-center justify-center flex-row overflow-hidden';

const rootBySize: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 rounded-full',
  md: 'min-h-10 px-4 rounded-full',
  lg: 'min-h-12 px-5 rounded-full',
};

const iconBySize: Record<ButtonSize, string> = {
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-12 w-12 p-0',
};

const rootByVariant: Record<ButtonVariant, string> = {
  primary: 'bg-info',
  secondary: 'bg-default',
  tertiary: 'bg-transparent',
  outline: 'border border-default bg-transparent',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
  'danger-soft': 'bg-danger-soft',
};

const labelByVariant: Record<ButtonVariant, string> = {
  primary: 'text-info-foreground',
  secondary: 'text-foreground',
  tertiary: 'text-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  danger: 'text-danger-foreground',
  'danger-soft': 'text-danger',
};

const labelBySize: Record<ButtonSize, string> = {
  sm: 'text-sm font-medium',
  md: 'text-base font-medium',
  lg: 'text-base font-medium',
};

const buttonStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  sm: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  md: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  lg: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  iconSm: {
    width: 32,
    height: 32,
    paddingHorizontal: 0,
  },
  iconMd: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
  },
  iconLg: {
    width: 48,
    height: 48,
    paddingHorizontal: 0,
  },
  primary: {
    backgroundColor: '#006fee',
  },
  secondary: {
    backgroundColor: '#f1f3f5',
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#d7dbdf',
    borderWidth: StyleSheet.hairlineWidth,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#f31260',
  },
  dangerSoft: {
    backgroundColor: 'rgba(243, 18, 96, 0.12)',
  },
  disabled: {
    opacity: 0.5,
  },
});

const labelStyles = StyleSheet.create({
  sm: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  md: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  lg: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  primary: {
    color: '#ffffff',
  },
  secondary: {
    color: '#11181c',
  },
  tertiary: {
    color: '#11181c',
  },
  outline: {
    color: '#11181c',
  },
  ghost: {
    color: '#11181c',
  },
  danger: {
    color: '#ffffff',
  },
  dangerSoft: {
    color: '#f31260',
  },
});

const buttonStyleByVariant: Record<ButtonVariant, ViewStyle> = {
  primary: buttonStyles.primary,
  secondary: buttonStyles.secondary,
  tertiary: buttonStyles.tertiary,
  outline: buttonStyles.outline,
  ghost: buttonStyles.ghost,
  danger: buttonStyles.danger,
  'danger-soft': buttonStyles.dangerSoft,
};

const labelStyleByVariant: Record<ButtonVariant, TextStyle> = {
  primary: labelStyles.primary,
  secondary: labelStyles.secondary,
  tertiary: labelStyles.tertiary,
  outline: labelStyles.outline,
  ghost: labelStyles.ghost,
  danger: labelStyles.danger,
  'danger-soft': labelStyles.dangerSoft,
};

const buttonStyleBySize: Record<ButtonSize, ViewStyle> = {
  sm: buttonStyles.sm,
  md: buttonStyles.md,
  lg: buttonStyles.lg,
};

const iconStyleBySize: Record<ButtonSize, ViewStyle> = {
  sm: buttonStyles.iconSm,
  md: buttonStyles.iconMd,
  lg: buttonStyles.iconLg,
};

const labelStyleBySize: Record<ButtonSize, TextStyle> = {
  sm: labelStyles.sm,
  md: labelStyles.md,
  lg: labelStyles.lg,
};

export const Button = forwardRef<PressableRef, ButtonRootProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isIconOnly = false,
      isDisabled = false,
      className,
      style,
      disabled,
      animation,
      feedbackVariant,
      ...props
    },
    ref
  ) => {
    const isButtonDisabled = Boolean(isDisabled || disabled);

    void animation;
    void feedbackVariant;

    const rootClassName = cn(
      rootBase,
      isIconOnly ? iconBySize[size] : rootBySize[size],
      rootByVariant[variant],
      isButtonDisabled && 'opacity-disabled',
      className
    );
    void rootClassName;

    const labelClassName = useMemo(
      () => cn(labelBySize[size], labelByVariant[variant]),
      [size, variant]
    );
    void labelClassName;

    const pressableStyle = useMemo(() => {
      const baseStyle = [
        buttonStyles.root,
        isIconOnly ? iconStyleBySize[size] : buttonStyleBySize[size],
        buttonStyleByVariant[variant],
        isButtonDisabled && buttonStyles.disabled,
      ];

      if (typeof style === 'function') {
        return (state: PressableStateCallbackType): StyleProp<ViewStyle> => [
          ...baseStyle,
          { opacity: state.pressed && !isButtonDisabled ? 0.72 : 1 },
          style(state),
        ];
      }

      return ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
        ...baseStyle,
        { opacity: pressed && !isButtonDisabled ? 0.72 : 1 },
        style,
      ];
    }, [isButtonDisabled, isIconOnly, size, style, variant]);

    const labelStyle = useMemo(
      () => [labelStyleBySize[size], labelStyleByVariant[variant]],
      [size, variant]
    );

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isButtonDisabled }}
        disabled={isButtonDisabled}
        style={pressableStyle}
        {...props}
      >
        {typeof children === 'string' ? (
          <ToastText style={labelStyle}>
            {children}
          </ToastText>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'ToastPortableButton';
