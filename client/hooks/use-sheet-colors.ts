import { useUniwind } from 'uniwind';

import { getSheetBoardColors, getSheetColors } from '@/constants/sheet';

export function useSheetColors() {
  const { theme } = useUniwind();

  return {
    boardColors: getSheetBoardColors(theme),
    colors: getSheetColors(theme),
    isDark: theme === 'dark',
  };
}
