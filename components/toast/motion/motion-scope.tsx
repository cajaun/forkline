import { createContext, getRootAnimationState } from '../shared';
import type { AnimationRoot } from '../contracts';

export interface AnimationSettingsContextValue {
  isAllAnimationsDisabled: boolean;
}

const [AnimationSettingsProvider, useAnimationSettings] =
  createContext<AnimationSettingsContextValue>({
    name: 'ToastAnimationSettingsContext',
    strict: false,
  });

export function useCombinedAnimationDisabledState<
  TConfig extends Record<string, any>,
>(animation: AnimationRoot<TConfig> | undefined): boolean {
  const parentAnimationSettingsContext = useAnimationSettings();
  const parentIsAllAnimationsDisabled =
    parentAnimationSettingsContext?.isAllAnimationsDisabled;
  const { isAllAnimationsDisabled: ownIsAllAnimationsDisabled } =
    getRootAnimationState(animation);

  return parentIsAllAnimationsDisabled === true || ownIsAllAnimationsDisabled;
}

export { AnimationSettingsProvider, useAnimationSettings };
