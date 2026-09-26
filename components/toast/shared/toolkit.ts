import * as React from 'react';

type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

export function cn(...args: ClassValue[]) {
  return args
    .flatMap((value): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return [cn(...value)];
      if (typeof value === 'object') {
        return Object.entries(value)
          .filter(([, enabled]) => Boolean(enabled))
          .map(([className]) => className);
      }

      return [String(value)];
    })
    .filter(Boolean)
    .join(' ');
}

export function combineStyles<T extends Record<string, any>>(styles: T): T {
  return styles;
}

export interface CreateContextOptions {
  strict?: boolean;
  errorMessage?: string;
  name?: string;
}

export type CreateContextReturn<T> = [
  React.Provider<T>,
  () => T,
  React.Context<T | undefined>,
];

export function createContext<ContextType>(options: CreateContextOptions = {}) {
  const {
    strict = true,
    errorMessage = 'useContext: `context` is undefined. Seems you forgot to wrap component within the Provider',
    name,
  } = options;

  const Context = React.createContext<ContextType | undefined>(undefined);
  Context.displayName = name;

  function useContext() {
    const context = React.useContext(Context);

    if (!context && strict) {
      const error = new Error(errorMessage);
      error.name = 'ContextError';
      throw error;
    }

    return context;
  }

  return [
    Context.Provider,
    useContext,
    Context,
  ] as CreateContextReturn<ContextType>;
}

export function getAnimationValueProperty<
  TConfig extends Record<string, any>,
  K extends keyof TConfig,
  D extends NonNullable<TConfig[K]>,
>(options: {
  animationValue: TConfig | undefined;
  property: K;
  defaultValue: D;
}): NonNullable<TConfig[K]> {
  if (options.animationValue === undefined) {
    return options.defaultValue;
  }

  return (options.animationValue[options.property] ??
    options.defaultValue) as NonNullable<TConfig[K]>;
}

export function getAnimationValueMergedConfig<
  TConfig extends Record<string, any>,
  K extends keyof TConfig,
>(options: {
  animationValue: TConfig | undefined;
  property: K;
  defaultValue: TConfig[K];
}): TConfig[K] {
  if (options.animationValue === undefined) {
    return options.defaultValue;
  }

  const value = options.animationValue[options.property];

  if (value === undefined || typeof value !== 'object') {
    return options.defaultValue;
  }

  return { ...options.defaultValue, ...value };
}

export function isAnimationDisabled<TConfig extends Record<string, any>>(
  animation:
    | boolean
    | 'disabled'
    | 'disable-all'
    | (TConfig & { state?: 'disabled' | 'disable-all' | boolean })
    | undefined
): boolean {
  if (
    animation === false ||
    animation === 'disabled' ||
    animation === 'disable-all'
  ) {
    return true;
  }

  if (
    typeof animation === 'object' &&
    animation !== null &&
    'state' in animation
  ) {
    return (
      animation.state === false ||
      animation.state === 'disabled' ||
      animation.state === 'disable-all'
    );
  }

  return false;
}

export function shouldDisableAll<TConfig extends Record<string, any>>(
  animation:
    | boolean
    | 'disabled'
    | 'disable-all'
    | (TConfig & { state?: 'disabled' | 'disable-all' | boolean })
    | undefined
): boolean {
  if (animation === 'disable-all') {
    return true;
  }

  return (
    typeof animation === 'object' &&
    animation !== null &&
    'state' in animation &&
    animation.state === 'disable-all'
  );
}

export function getRootAnimationState<TConfig extends Record<string, any>>(
  animation:
    | boolean
    | 'disabled'
    | 'disable-all'
    | (TConfig & { state?: 'disabled' | 'disable-all' | boolean })
    | undefined
): {
  animationConfig: TConfig | undefined;
  isAnimationDisabled: boolean;
  isAllAnimationsDisabled: boolean;
} {
  const isAllAnimationsDisabled = shouldDisableAll(animation);
  const disabled = isAnimationDisabled(animation);
  const animationConfig =
    typeof animation === 'object' && animation !== null
      ? (animation as TConfig)
      : undefined;

  return {
    animationConfig,
    isAnimationDisabled: disabled,
    isAllAnimationsDisabled,
  };
}

export function getIsAnimationDisabledValue(options: {
  isAnimationDisabled: boolean;
  isAllAnimationsDisabled: boolean | undefined;
}): boolean {
  return options.isAllAnimationsDisabled === true || options.isAnimationDisabled;
}
