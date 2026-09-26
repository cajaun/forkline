import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

interface UseVerticalPlaceholderStylesParams {
  style?: StyleProp<ViewStyle>;
}

export function useVerticalPlaceholderStyles({
  style,
}: UseVerticalPlaceholderStylesParams) {
  return useMemo(() => {
    const resolvedStyle = style ? StyleSheet.flatten(style) : undefined;

    const stylePaddingTop =
      resolvedStyle?.paddingTop ??
      resolvedStyle?.paddingVertical ??
      resolvedStyle?.padding;
    const stylePaddingBottom =
      resolvedStyle?.paddingBottom ??
      resolvedStyle?.paddingVertical ??
      resolvedStyle?.padding;

    const paddingTopValue = stylePaddingTop;
    const paddingBottomValue = stylePaddingBottom;

    const topHeight =
      typeof paddingTopValue === 'number' && paddingTopValue >= 0
        ? paddingTopValue
        : 0;
    const bottomHeight =
      typeof paddingBottomValue === 'number' && paddingBottomValue >= 0
        ? paddingBottomValue
        : 0;

    const styleBackgroundColor = resolvedStyle?.backgroundColor;
    const backgroundColor = styleBackgroundColor ?? undefined;

    const topStyle: ViewStyle = {
      height: topHeight,
    };

    const bottomStyle: ViewStyle = {
      height: bottomHeight,
    };

    if (backgroundColor !== undefined) {
      topStyle.backgroundColor = backgroundColor;
      bottomStyle.backgroundColor = backgroundColor;
    }

    return {
      topStyle,
      bottomStyle,
    };
  }, [style]);
}
