import React from 'react';

import { Text } from 'react-native';
import { useAtomValue } from 'jotai';

import { statusAtom } from '@/stores/chess-game';
import { theme } from '@/constants/theme';

export const StatusCaption: React.FC = () => {
  // read the current game status from the store
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
