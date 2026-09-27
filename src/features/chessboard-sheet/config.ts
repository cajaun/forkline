import { BOARD_COLORS } from '../chess-game/constants';

export const SHEET_LAYOUT = {
  closedBottom: 0.22,
  closedTop: 0.18,
  closedBoardCenter: 0.556,
  openBoardCenter: 0.5,
  openBoardGutter: 12,
  openBoardRatio: 1,
  previewBoardRatio: 0.53,
  sheetGutter: 24,
  sheetRadius: 34,
} as const;

export const SHEET_BOARD_COLORS = {
  ...BOARD_COLORS,
  black: '#E9EBEB',
  checkmateHighlight: '#e2caca',
  lastMoveHighlight: '#B7B8B8',
  white: '#F9FAFA',
};

export const SHEET_COLORS = {
  background: '#FEFFFF',
  handle: '#DEDFDF',
  icon: '#262626',
  lightControl: '#F2F2F2',
  primary: '#1f70f7',
  text: '#262626',
} as const;

export const SHEET_SPRING = {
  damping: 75,
  mass: 1,
  overshootClamping: true,
  stiffness: 750,
};
