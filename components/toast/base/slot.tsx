import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react';
import {
  Pressable as RNPressable,
  Text as RNText,
  View as RNView,
  type PressableProps as RNPressableProps,
  type PressableStateCallbackType,
  type TextProps as RNTextProps,
  type ViewProps as RNViewProps,
} from 'react-native';

type AnyProps = Record<string, any>;

function isTextChildren(
  children:
    | React.ReactNode
    | ((state: PressableStateCallbackType) => React.ReactNode)
) {
  return Array.isArray(children)
    ? children.every((child) => typeof child === 'string')
    : typeof children === 'string';
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T) =>
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T>).current = node;
      }
    });
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps) {
  const overrideProps = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);

    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === 'style') {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean);
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(' ');
    }
  }

  return { ...slotProps, ...overrideProps };
}

const Pressable = forwardRef<
  React.ComponentRef<typeof RNPressable>,
  RNPressableProps
>((props, forwardedRef) => {
  const { children, ...pressableSlotProps } = props;

  if (!isValidElement(children)) {
    return null;
  }

  return cloneElement<
    React.ComponentPropsWithoutRef<typeof RNPressable>,
    React.ComponentRef<typeof RNPressable>
  >(isTextChildren(children) ? <></> : children, {
    ...mergeProps(pressableSlotProps, children.props as AnyProps),
    ref: forwardedRef
      ? composeRefs(forwardedRef, (children as any).ref)
      : (children as any).ref,
  });
});

const View = forwardRef<React.ComponentRef<typeof RNView>, RNViewProps>(
  (props, forwardedRef) => {
    const { children, ...viewSlotProps } = props;

    if (!isValidElement(children)) {
      return null;
    }

    return cloneElement<
      ComponentPropsWithoutRef<typeof RNView>,
      ComponentRef<typeof RNView>
    >(isTextChildren(children) ? <></> : children, {
      ...mergeProps(viewSlotProps, children.props as AnyProps),
      ref: forwardedRef
        ? composeRefs(forwardedRef, (children as any).ref)
        : (children as any).ref,
    });
  }
);

const Text = forwardRef<ComponentRef<typeof RNText>, RNTextProps>(
  (props, forwardedRef) => {
    const { children, ...textSlotProps } = props;

    if (!isValidElement(children)) {
      return null;
    }

    return cloneElement<
      React.ComponentPropsWithoutRef<typeof RNText>,
      React.ComponentRef<typeof RNText>
    >(isTextChildren(children) ? <></> : children, {
      ...mergeProps(textSlotProps, children.props as AnyProps),
      ref: forwardedRef
        ? composeRefs(forwardedRef, (children as any).ref)
        : (children as any).ref,
    });
  }
);

Pressable.displayName = 'SlotPressable';
View.displayName = 'SlotView';
Text.displayName = 'SlotText';

export { Pressable, Text, View };
