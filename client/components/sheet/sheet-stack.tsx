import type { ComponentProps } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { AnimatedView } from '@/components/shared/uniwind';
import { SHEET_SHADOWS, SHEET_STACK } from '@/constants/sheet';
import { useSheetColors } from '@/hooks/use-sheet-colors';

type StackLayer = (typeof SHEET_STACK)[keyof typeof SHEET_STACK];

function layerStyle(layer: StackLayer): ViewStyle {
  return {
    borderRadius: layer.radius,
    bottom: -layer.peek,
    left: layer.inset,
    position: 'absolute',
    right: layer.inset,
    top: layer.peek,
  };
}

// the stand in cards that peek out under the closed sheet
export function SheetStack({
  frameStyle,
}: {
  frameStyle: ComponentProps<typeof AnimatedView>['style'];
}) {
  const { colors } = useSheetColors();

  return (
    <AnimatedView className="absolute" pointerEvents="none" style={frameStyle}>
      <View
        style={[
          layerStyle(SHEET_STACK.back),
          { backgroundColor: colors.stackBack, boxShadow: SHEET_SHADOWS.back },
        ]}
      />
      <View
        style={[
          layerStyle(SHEET_STACK.front),
          { backgroundColor: colors.stackFront, boxShadow: SHEET_SHADOWS.front },
        ]}
      />
    </AnimatedView>
  );
}
