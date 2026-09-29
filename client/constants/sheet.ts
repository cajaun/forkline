import { BOARD_COLORS } from '@/constants/chess-game';

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

const LIGHT_SHEET_BOARD_COLORS = {
  ...BOARD_COLORS,
  black: '#E9EBEB',
  checkmateHighlight: '#e2caca',
  lastMoveHighlight: 'transparent',
  white: '#F9FAFA',
} as const;

const DARK_SHEET_BOARD_COLORS = {
  ...BOARD_COLORS,
  black: '#191919',
  checkmateHighlight: '#e2caca',
  lastMoveHighlight: 'transparent',
  white: '#222222',
} as const;

export const SHEET_BOARD_COLORS_BY_THEME = {
  dark: DARK_SHEET_BOARD_COLORS,
  light: LIGHT_SHEET_BOARD_COLORS,
} as const;

export const SHEET_BOARD_COLORS = LIGHT_SHEET_BOARD_COLORS;

const LIGHT_SHEET_COLORS = {
  appBackground: '#E6E6E6',
  background: '#FEFFFF',
  controlIcon: '#262626',
  dateText: '#262626',
  handle: '#DEDFDF',
  icon: '#262626',
  controlBackground: '#F2F2F2',
  boardBorder: '#262626',
  pieceBlack: '#070707',
  pieceWhite: '#BABABA',
  playButton: '#262626',
  playButtonForeground: '#FEFFFF',
  primary: '#1f70f7',
  selectedDateBackground: '#DCDCDC',
  selectedDateText: '#262626',
  text: '#262626',
  weekdayText: '#777777',
} as const;

const DARK_SHEET_COLORS = {
  appBackground: '#1A1A1A',
  background: '#262626',
  controlIcon: '#D9D9D9',
  dateText: '#D9D9D9',
  handle: '#333333',
  icon: '#D9D9D9',
  controlBackground: '#333333',
  boardBorder: '#D9D9D9',
  pieceBlack: '#797979',
  pieceWhite: '#AAAAAA',
  playButton: '#D9D9D9',
  playButtonForeground: '#262626',
  primary: '#1f70f7',
  selectedDateBackground: '#232323',
  selectedDateText: '#D9D9D9',
  text: '#D9D9D9',
  weekdayText: '#393939',
} as const;

export const SHEET_COLORS_BY_THEME = {
  dark: DARK_SHEET_COLORS,
  light: LIGHT_SHEET_COLORS,
} as const;

export const SHEET_COLORS = LIGHT_SHEET_COLORS;

export function getSheetColors(theme: string) {
  return SHEET_COLORS_BY_THEME[theme === 'dark' ? 'dark' : 'light'];
}

export function getSheetBoardColors(theme: string) {
  return SHEET_BOARD_COLORS_BY_THEME[theme === 'dark' ? 'dark' : 'light'];
}

export const SHEET_SPRING = {
  damping: 75,
  mass: 1,
  overshootClamping: true,
  stiffness: 750,
};

export const SHEET_BOARD_MOVE_SPRING = {
  damping: 80,
  energyThreshold: 1e-4,
  mass: 1,
  stiffness: 1600,
} as const;
