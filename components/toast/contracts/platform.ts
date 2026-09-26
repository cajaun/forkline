import type {
  Pressable,
  PressableProps,
  Text,
  TextProps,
  View,
  ViewProps,
} from 'react-native';
import type {
  BaseAnimationBuilder,
  LayoutAnimationFunction,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';

export type ComponentPropsWithAsChild<T extends React.ElementType<any>> =
  React.ComponentPropsWithoutRef<T> & { asChild?: boolean };

export type ViewRef = React.ComponentRef<typeof View>;
export type PressableRef = React.ComponentRef<typeof Pressable>;
export type TextRef = React.ComponentRef<typeof Text>;

export type SlottableViewProps = ViewProps & { asChild?: boolean };
export type SlottablePressableProps = PressableProps & { asChild?: boolean };
export type SlottableTextProps = TextProps & { asChild?: boolean };

export type Animation<
  TConfig extends Record<string, any> = Record<string, any>,
> = boolean | 'disabled' | (TConfig & { state?: 'disabled' | boolean });

export type AnimationRoot<
  TConfig extends Record<string, any> = Record<string, any>,
> =
  | boolean
  | 'disabled'
  | 'disable-all'
  | (TConfig & { state?: 'disabled' | 'disable-all' | boolean });

export type AnimationValue<
  TConfig extends Record<string, any> = Record<string, any>,
> = TConfig;

export type LayoutTransition =
  | BaseAnimationBuilder
  | LayoutAnimationFunction
  | typeof BaseAnimationBuilder
  | undefined;

export interface SpringAnimationConfig {
  type: 'spring';
  config?: WithSpringConfig;
}

export interface TimingAnimationConfig {
  type: 'timing';
  config?: WithTimingConfig;
}
