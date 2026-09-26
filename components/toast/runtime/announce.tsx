import { DefaultToast } from '../ui/default-toast';
import type {
  ToastComponentProps,
  ToastGlobalConfig,
  ToastShowConfig,
  ToastShowOptions,
  ToastShowOptionsWithComponent,
} from '../contracts';

export const DEFAULT_TOAST_DURATION = 4000;

type ToastRenderConfig = Pick<
  ToastGlobalConfig,
  'variant' | 'placement' | 'isSwipeable' | 'animation'
>;

export interface NormalizedToastRequest {
  id?: string;
  component: (props: ToastComponentProps) => React.ReactElement;
  duration: number | 'persistent';
  onShow?: () => void;
  onHide?: () => void;
  hasExplicitId: boolean;
}

function mergeRenderConfig(
  globalConfig: ToastGlobalConfig | undefined,
  localConfig: Partial<ToastRenderConfig>
): ToastRenderConfig {
  return {
    variant: localConfig.variant ?? globalConfig?.variant,
    placement: localConfig.placement ?? globalConfig?.placement,
    isSwipeable: localConfig.isSwipeable ?? globalConfig?.isSwipeable,
    animation: localConfig.animation ?? globalConfig?.animation,
  };
}

function createStringToastComponent(
  label: string,
  globalConfig: ToastGlobalConfig | undefined
) {
  function StringToast(props: ToastComponentProps) {
    return (
      <DefaultToast
        {...props}
        {...mergeRenderConfig(globalConfig, { variant: 'default' })}
        label={label}
      />
    );
  }

  return StringToast;
}

function createConfigToastComponent(
  config: ToastShowConfig,
  globalConfig: ToastGlobalConfig | undefined
) {
  function ConfigToast(props: ToastComponentProps) {
    return (
      <DefaultToast
        {...props}
        {...mergeRenderConfig(globalConfig, config)}
        label={config.label}
        description={config.description}
        actionLabel={config.actionLabel}
        onActionPress={config.onActionPress}
        icon={config.icon}
        iconSize={config.iconSize}
        textSize={config.textSize}
        labelTextSize={config.labelTextSize}
        descriptionTextSize={config.descriptionTextSize}
        labelStyle={config.labelStyle}
        descriptionStyle={config.descriptionStyle}
      />
    );
  }

  return ConfigToast;
}

function isCustomToastRequest(
  options: ToastShowOptions
): options is ToastShowOptionsWithComponent {
  return 'component' in options && typeof options.component === 'function';
}

export function normalizeToastRequest(
  options: string | ToastShowOptions,
  globalConfig: ToastGlobalConfig | undefined
): NormalizedToastRequest {
  if (typeof options === 'string') {
    return {
      component: createStringToastComponent(options, globalConfig),
      duration: DEFAULT_TOAST_DURATION,
      hasExplicitId: false,
    };
  }

  if (isCustomToastRequest(options)) {
    return {
      id: options.id,
      component: options.component,
      duration: options.duration ?? DEFAULT_TOAST_DURATION,
      onShow: options.onShow,
      onHide: options.onHide,
      hasExplicitId: options.id !== undefined,
    };
  }

  return {
    id: options.id,
    component: createConfigToastComponent(options, globalConfig),
    duration: options.duration ?? DEFAULT_TOAST_DURATION,
    onShow: options.onShow,
    onHide: options.onHide,
    hasExplicitId: options.id !== undefined,
  };
}

export function shouldAutoDismiss(
  duration: number | 'persistent'
): duration is number {
  return (
    duration !== 'persistent' &&
    typeof duration === 'number' &&
    Number.isFinite(duration) &&
    duration > 0
  );
}
