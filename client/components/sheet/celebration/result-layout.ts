import { SHEET_RESULT } from '@/constants/sheet';

// the screen rectangle the won board settles into so the badge and fade can sit on it
export function resultBoardRect(width: number, height: number, boardSize: number) {
  const size = boardSize * SHEET_RESULT.boardScale;
  const top = height * SHEET_RESULT.boardTop;
  return { bottom: top + size, left: (width - size) / 2, size, top };
}

export const RESULT_OPEN_RANGE = [0.85, 1];
