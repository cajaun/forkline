import { useEffect } from 'react';

import { useTrayHost } from 'react-native-morpheus';

// the host clears the active tray as the close starts so the report waits for the tray to leave
const CLOSE_SETTLE_MS = 350;

// reports tray visibility from its own component so host updates re-render nothing else
export function TrayActivityWatcher({ onChange }: { onChange: (open: boolean) => void }) {
  const { activeTrayId } = useTrayHost();
  const open = activeTrayId !== null;

  useEffect(() => {
    if (open) {
      onChange(true);
      return;
    }
    const timer = setTimeout(() => onChange(false), CLOSE_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [onChange, open]);

  return null;
}
