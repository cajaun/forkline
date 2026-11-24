import { useUniwind } from 'uniwind';

import { DARK_KING_COLORS, KING_COLORS } from '@/components/sheet/board/constants';
import {
  CHECKMATE_KING_IMG,
  DARK_CHECKMATE_KING_IMG,
  DARK_GAME_OVER_KING_IMG,
  GAME_OVER_KING_IMG,
} from '@/constants/chess-pieces';
import { getSheetBoardColors, getSheetColors } from '@/constants/sheet';

const KING_IMAGES = { checkmate: CHECKMATE_KING_IMG, gameOver: GAME_OVER_KING_IMG } as const;
const DARK_KING_IMAGES = { checkmate: DARK_CHECKMATE_KING_IMG, gameOver: DARK_GAME_OVER_KING_IMG } as const;

// the palette and king art for the current theme
export function useSheetColors() {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  return {
    boardColors: getSheetBoardColors(theme),
    colors: getSheetColors(theme),
    isDark,
    kingColors: isDark ? DARK_KING_COLORS : KING_COLORS,
    kingImages: isDark ? DARK_KING_IMAGES : KING_IMAGES,
  };
}
