import ColorLib from 'color';

export const theme = {
  bg: '#0d0e12',
  surface: '#17191f',
  surfaceHi: '#202329',
  border: '#2c2f35',
  textFaint: '#60636a',
  textMuted: '#8f9298',
  text: '#f0f2f5',
  accent: '#3a91f8',
  win: '#5fe19e',
  lose: '#f56b76',
  boardLight: '#e5e8ed',
  boardDark: '#818895',
};

export const quality = {
  brilliant: '#84d5d1',
  great: '#90baf1',
  book: '#cebb9e',
  best: '#93d8b0',
  excellent: '#a6dbb6',
  good: '#a6d2b6',
  inaccuracy: '#e9cf87',
  mistake: '#ebaf86',
  miss: '#e79287',
  blunder: '#e18083',
};

export const withAlpha = (hex: string, alpha: number): string =>
  ColorLib(hex).alpha(alpha).rgb().string();
