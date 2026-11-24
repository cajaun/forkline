import { DARK_PIECE_IMG, PIECE_IMG } from '@/constants/chess-pieces';
import { useSheetColors } from '@/hooks/use-sheet-colors';

export function useKingImages() {
  const { isDark } = useSheetColors();
  const images = isDark ? DARK_PIECE_IMG : PIECE_IMG;
  return { black: images.b.k, white: images.w.k };
}
