import { useEffect } from 'react';

import { useTrayHost } from 'react-native-morpheus';

// reports whether a tray is on screen, isolated so the host's frequent updates re-render only this
export function TrayActivityWatcher({ onChange }: { onChange: (open: boolean) => void }) {
  const { activeTrayId } = useTrayHost();
  const open = activeTrayId !== null;

  useEffect(() => {
    onChange(open);
  }, [onChange, open]);

  return null;
}
