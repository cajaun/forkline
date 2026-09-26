import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeOverlay } from './window-overlay';
import type { ToastInsets } from '../contracts';

interface SafeAreaPortalProps {
  disableFullWindowOverlay: boolean;
  insets?: ToastInsets;
  contentWrapper?: (children: ReactNode) => React.ReactElement;
  children: ReactNode;
}

export function SafeAreaPortal({
  insets,
  contentWrapper,
  children,
  disableFullWindowOverlay,
}: SafeAreaPortalProps) {
  const safeAreaInsets = useSafeAreaInsets();

  const finalInsets = useMemo(() => {
    return {
      top: insets?.top ?? safeAreaInsets.top + (Platform.OS === 'ios' ? 0 : 12),
      bottom:
        insets?.bottom ??
        safeAreaInsets.bottom + (Platform.OS === 'ios' ? 6 : 12),
      left: insets?.left ?? safeAreaInsets.left + 12,
      right: insets?.right ?? safeAreaInsets.right + 12,
    };
  }, [safeAreaInsets, insets]);

  const content = (
    <View
      pointerEvents="box-none"
      style={{
        ...StyleSheet.absoluteFillObject,
        paddingTop: finalInsets.top,
        paddingBottom: finalInsets.bottom,
        paddingLeft: finalInsets.left,
        paddingRight: finalInsets.right,
      }}
    >
      {contentWrapper ? contentWrapper(children) : children}
    </View>
  );

  if (Platform.OS !== 'ios') {
    return content;
  }

  return (
    <NativeOverlay disabled={disableFullWindowOverlay}>
      {content}
    </NativeOverlay>
  );
}
