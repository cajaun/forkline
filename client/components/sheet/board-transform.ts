import type { SharedValue } from 'react-native-reanimated';

export type BoardTransform = {
  previewScale: number;
  scale: SharedValue<number>;
  translate: SharedValue<{ x: number; y: number }>;
};
