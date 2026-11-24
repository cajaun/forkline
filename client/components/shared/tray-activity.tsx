import { useEffect } from 'react';

import { useTrayHost } from 'react-native-morpheus';

// reports tray visibility from its own component so host updates re-render nothing else
export function TrayActivityWatcher({ onChange }: { onChange: (open: boolean) => void }) {
  const { activeTrayId } = useTrayHost();
  const open = activeTrayId !== null;

  useEffect(() => {
    onChange(open);
  }, [onChange, open]);

  return null;
}
