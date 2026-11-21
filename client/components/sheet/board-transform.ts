import type { SharedValue } from 'react-native-reanimated';

// the board's offset from its open rect during the transition, a translation plus a scale about its centre
export type BoardTransform = {
  previewScale: number;
  scale: SharedValue<number>;
  translate: SharedValue<{ x: number; y: number }>;
};
