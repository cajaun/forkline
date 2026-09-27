import React from 'react';

import { Text } from 'react-native';
import { useAtomValue } from 'jotai';

import { statusAtom } from '../state';
import { theme } from '../theme';

export const StatusCaption: React.FC = () => {
  const caption = useAtomValue(statusAtom);

  return (
    <Text
      className="mt-0.5 text-xs"
      numberOfLines={1}
      style={{ color: theme.textMuted }}>
      {caption}
    </Text>
  );
};
