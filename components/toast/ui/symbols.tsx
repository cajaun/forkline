import type { ComponentType } from 'react';
import { Text } from 'react-native';
import { useThemeColor } from '../presentation';

interface CloseIconProps {
  size?: number;
  color?: string;
}

interface SymbolViewProps {
  name: string;
  size?: number;
  tintColor?: string;
  type?: string;
}

interface ToastIconProps {
  icon: React.ReactNode;
  size?: number;
  color?: string;
}

declare const require: (name: string) => {
  SymbolView?: ComponentType<SymbolViewProps>;
};

let SymbolView: ComponentType<SymbolViewProps> | undefined;

try {
  SymbolView = require('expo-symbols').SymbolView;
} catch {
  SymbolView = undefined;
}

export const CloseIcon = ({ size = 16, color }: CloseIconProps) => {
  const fallbackColor = useThemeColor('foreground');
  const resolvedColor = color ?? fallbackColor;

  if (SymbolView) {
    return (
      <SymbolView
        name="xmark"
        size={size}
        tintColor={resolvedColor}
        type="hierarchical"
      />
    );
  }

  return (
    <Text
      aria-hidden
      style={{ color: resolvedColor, fontSize: size, lineHeight: size }}
    >
      x
    </Text>
  );
};

CloseIcon.displayName = 'ToastCloseIcon';

export const ToastIcon = ({ icon, size = 20, color }: ToastIconProps) => {
  const fallbackColor = useThemeColor('foreground');
  const resolvedColor = color ?? fallbackColor;

  if (typeof icon === 'string') {
    if (SymbolView) {
      return (
        <SymbolView
          name={icon}
          size={size}
          tintColor={resolvedColor}
          type="hierarchical"
        />
      );
    }

    return (
      <Text
        aria-hidden
        style={{ color: resolvedColor, fontSize: size, lineHeight: size }}
      >
        {icon}
      </Text>
    );
  }

  return <>{icon}</>;
};

ToastIcon.displayName = 'ToastIcon';
