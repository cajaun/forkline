import { Extrapolation, interpolate } from 'react-native-reanimated';

// the curve the Play button folds away on as the sheet opens
const FOLD_INPUT = [0, 0.45, 0.78, 1];

// opacity and scale for something folded away by the given amount from 0 shown to 1 gone
export function fold(away: number) {
  'worklet';
  return {
    opacity: interpolate(away, FOLD_INPUT, [1, 1, 0.35, 0], Extrapolation.CLAMP),
    scale: interpolate(away, FOLD_INPUT, [1, 0.9, 0.35, 0], Extrapolation.CLAMP),
  };
}
