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

// a won game shrinks the board under the header with its badge on the lower edge and stats below
export const SHEET_RESULT = {
  boardScale: 0.76,
  boardTop: 0.19,
  fadeShare: 0.45,
  statsTop: 0.69,
} as const;

// offsets the live card and the stand in cards share
export const SHEET_CARD_TEXT = {
  dateTop: 95,
  timerOffset: 151,
  weekdayLineHeight: 56,
  weekdayTop: 47,
} as const;

const LIGHT_SHEET_BOARD_COLORS = {
  black: '#E9EBEB',
  checkmateHighlight: '#e2caca',
  lastMoveHighlight: 'transparent',
  white: '#F9FAFA',
} as const;

const DARK_SHEET_BOARD_COLORS = {
  black: '#191919',
  checkmateHighlight: 'transparent',
  lastMoveHighlight: 'transparent',
  white: '#222222',
} as const;

const SHEET_BOARD_COLORS_BY_THEME = {
  dark: DARK_SHEET_BOARD_COLORS,
  light: LIGHT_SHEET_BOARD_COLORS,
} as const;

const LIGHT_SHEET_COLORS = {
  appBackground: '#E6E6E6',
  background: '#FEFFFF',
  controlIcon: '#262626',
  dateText: '#262626',
  handle: '#DEDFDF',
  // hint squares sit one clear step under the board greys
  hint: '#D4D7D7',
  icon: '#262626',
  mutedText: '#777777',
  controlBackground: '#F2F2F2',
  boardBorder: '#262626',
  cardDivider: '#E0E0E0',
  // empty capture slots sit one step off the background so piece dots stand out in either theme
  captureEmptyDot: '#D9D9D9',
  pieceBlack: '#070707',
  pieceWhite: '#BABABA',
  playButton: '#262626',
  playButtonForeground: '#FEFFFF',
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
  hint: '#3A3A3A',
  icon: '#D9D9D9',
  mutedText: '#9E9E9E',
  controlBackground: '#333333',
  boardBorder: '#D9D9D9',
  cardDivider: '#444444',
  captureEmptyDot: '#3A3A3A',
  pieceBlack: '#797979',
  pieceWhite: '#AAAAAA',
  playButton: '#D9D9D9',
  playButtonForeground: '#262626',
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

export function getSheetColors(theme: string) {
  return SHEET_COLORS_BY_THEME[theme === 'dark' ? 'dark' : 'light'];
}

export function getSheetBoardColors(theme: string) {
  return SHEET_BOARD_COLORS_BY_THEME[theme === 'dark' ? 'dark' : 'light'];
}

// the spring matches the reference sheet measured frame by frame
export const SHEET_SPRING = {
  damping: 38,
  mass: 1,
  stiffness: 500,
};

export const SHEET_STACK = {
  front: { inset: 14.5, peek: 8, radius: 31 },
  back: { inset: 35.5, peek: 14, radius: 31 },
} as const;

export const SHEET_SHADOWS = {
  sheet: '0px 0px 24px rgba(0, 0, 0, 0.08)',
  front: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  back: '0px 6px 16px rgba(0, 0, 0, 0.10)',
} as const;

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
