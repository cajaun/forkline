import type { ComponentType, ReactNode } from 'react';
import { Platform } from 'react-native';

declare const require: (name: string) => {
  FullWindowOverlay?: ComponentType<{ children?: ReactNode }>;
};

let NativeFullWindowOverlay:
  | ComponentType<{ children?: ReactNode }>
  | undefined;

try {
  NativeFullWindowOverlay = require('react-native-screens').FullWindowOverlay;
} catch {
  NativeFullWindowOverlay = undefined;
}

export interface NativeOverlayProps {
  disabled: boolean;
  children: ReactNode;
}

export function NativeOverlay({
  disabled,
  children,
}: NativeOverlayProps) {
  if (
    Platform.OS !== 'ios' ||
    disabled ||
    !NativeFullWindowOverlay
  ) {
    return <>{children}</>;
  }

  return <NativeFullWindowOverlay>{children}</NativeFullWindowOverlay>;
}
