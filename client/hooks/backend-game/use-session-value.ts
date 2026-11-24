import { useCallback, useState } from 'react';

type Tagged<T> = { key: string | null; value: T };

// a value tagged with its session so a reply from an old session reads as empty
export function useSessionValue<T>(currentKey: string | null, keyRef: { current: string | null }) {
  const [tagged, setTagged] = useState<Tagged<T> | null>(null);

  const set = useCallback(
    (value: T | null, key: string | null = keyRef.current) =>
      setTagged(value === null ? null : { key, value }),
    [keyRef],
  );

  return [tagged?.key === currentKey ? tagged.value : null, set] as const;
}
