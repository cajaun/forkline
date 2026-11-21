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
  stackBack: '#F0F0F0',
  stackFront: '#F6F6F6',
  text: '#262626',
  trayIcon: '#787878',
  traySeparator: '#F6F6F6',
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
  stackBack: '#1F1F1F',
  stackFront: '#222222',
  text: '#D9D9D9',
  trayIcon: '#D9D9D9',
  traySeparator: '#333333',
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

// matches the reference, damping ratio 0.85 with half the travel at 70ms and 90% at 140ms
export const SHEET_SPRING = {
  damping: 38,
  mass: 1,
  stiffness: 500,
};

// closed-card stack peeking out under the sheet (measured from the reference)
export const SHEET_STACK = {
  front: { inset: 14.5, peek: 8, radius: 31 },
  back: { inset: 35.5, peek: 14, radius: 31 },
} as const;

// each layer's shadow falls on the one behind it, darkening the stacked cards' top edges
export const SHEET_SHADOWS = {
  sheet: '0px 0px 24px rgba(0, 0, 0, 0.08)',
  front: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  back: '0px 6px 16px rgba(0, 0, 0, 0.10)',
} as const;

// the home background fades to the sheet colour so the sheet reads as becoming the screen
export const SHEET_BACKDROP_FADE: { input: number[]; output: number[] } = {
  input: [0, 0.36, 0.68, 0.9],
  output: [0, 0.53, 0.77, 1],
};

export const SHEET_BOARD_MOVE_SPRING = {
  damping: 80,
  energyThreshold: 1e-4,
  mass: 1,
  stiffness: 1600,
} as const;
