import { View } from 'react-native';
import { useToastConfig } from '../runtime/toast-settings';
import { cn } from '../shared';
import {
  toastStyleSheet,
  toastVariantColorsByScheme,
} from '../presentation';
import type { DefaultToastProps } from '../contracts';
import {
  defaultIconByVariant,
  resolveToastRootConfig,
  useToastVisualContext,
} from './resolve-toast-view';
import { ToastIcon } from './symbols';
import { ToastFrame } from './toast-frame';
import { ToastTitle, ToastDescription } from './toast-copy';
import { ToastAction } from './toast-action';

export function DefaultToast(props: DefaultToastProps) {
  const globalConfig = useToastConfig();
  const {
    id,
    variant: localVariant,
    placement: localPlacement,
    isSwipeable: localIsSwipeable,
    animation: localAnimation,
    label,
    description,
    actionLabel,
    onActionPress,
    icon,
    iconSize = 20,
    textSize,
    labelTextSize,
    descriptionTextSize,
    labelStyle,
    descriptionStyle,
    hide,
    show,
    style,
    ...frameProps
  } = props;

  const { variant, placement, animation, isSwipeable } = resolveToastRootConfig(
    globalConfig,
    {
      variant: localVariant,
      placement: localPlacement,
      animation: localAnimation,
      isSwipeable: localIsSwipeable,
    }
  );
  const { toastOptions, variantOptions, colorScheme } =
    useToastVisualContext(variant);
  const resolvedIcon =
    icon ??
    (variant === 'success' ||
    variant === 'warning' ||
    variant === 'danger' ||
    variant === 'info'
      ? defaultIconByVariant[variant]
      : undefined);

  return (
    <ToastFrame
      id={id}
      variant={variant}
      placement={placement}
      isSwipeable={isSwipeable}
      animation={animation}
      style={[toastStyleSheet.defaultToastRoot, style]}
      hide={hide}
      show={show}
      {...frameProps}
    >
      {resolvedIcon ? (
        <View
          className={cn(
            toastOptions?.classNames?.icon,
            variantOptions?.classNames?.icon
          )}
          style={[
            toastStyleSheet.iconContainer,
            { height: iconSize + 4, width: iconSize + 4 },
            toastOptions?.styles?.icon,
            variantOptions?.styles?.icon,
          ]}
        >
          <ToastIcon
            icon={resolvedIcon}
            color={toastVariantColorsByScheme[colorScheme][variant]}
            size={iconSize}
          />
        </View>
      ) : null}
      <View
        className={cn(
          toastOptions?.classNames?.content,
          variantOptions?.classNames?.content
        )}
        style={[
          toastStyleSheet.content,
          toastOptions?.styles?.content,
          variantOptions?.styles?.content,
        ]}
      >
        {label ? (
          <ToastTitle textSize={labelTextSize ?? textSize ?? 'subheadline'} style={labelStyle}>
            {label}
          </ToastTitle>
        ) : null}
        {description ? (
          <ToastDescription
            textSize={descriptionTextSize ?? textSize ?? 'footnote'}
            style={descriptionStyle}
          >
            {description}
          </ToastDescription>
        ) : null}
      </View>
      {actionLabel ? (
        <ToastAction onPress={() => onActionPress?.({ show, hide })}>
          {actionLabel}
        </ToastAction>
      ) : null}
    </ToastFrame>
  );
}
