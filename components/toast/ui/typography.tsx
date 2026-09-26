import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export interface ToastTextProps extends RNTextProps {
  className?: string;
}

export const ToastText = React.forwardRef<RNText, ToastTextProps>(
  ({ className, ...props }, ref) => {
    void className;
    return <RNText ref={ref} {...props} />;
  }
);

ToastText.displayName = 'ToastText';
