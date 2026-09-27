import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { useAtomValue } from 'jotai';
import { PressableScale } from 'pressto';

import { pausedAtom, runningAtom } from '@/stores/chess-game';
import { theme } from '@/constants/theme';

export const PlayPauseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const running = useAtomValue(runningAtom);
  const paused = useAtomValue(pausedAtom);

  // pause shows the active icon while a stopped game shows play

  return (
    <PressableScale
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderRadius: 18,
        borderWidth: 0.5,
        height: 52,
        justifyContent: 'center',
        width: 54,
      }}>
      <Ionicons
        name={running && !paused ? 'pause' : 'play'}
        size={22}
        color={theme.text}
      />
    </PressableScale>
  );
};
