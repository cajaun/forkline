type ThemeColorToken =
  | 'foreground'
  | 'muted'
  | 'default-hover'
  | 'info-hover'
  | 'success-hover'
  | 'warning-hover'
  | 'danger-hover'
  | 'danger-soft-hover';

const colorMap: Record<ThemeColorToken, string> = {
  foreground: '#11181c',
  muted: '#687076',
  'default-hover': 'rgba(17, 24, 28, 0.08)',
  'info-hover': 'rgba(0, 111, 238, 0.14)',
  'success-hover': 'rgba(23, 201, 100, 0.14)',
  'warning-hover': 'rgba(245, 165, 36, 0.14)',
  'danger-hover': 'rgba(243, 18, 96, 0.14)',
  'danger-soft-hover': 'rgba(243, 18, 96, 0.14)',
};

export function useThemeColor(token: ThemeColorToken): string;
export function useThemeColor(tokens: ThemeColorToken[]): string[];
export function useThemeColor(tokenOrTokens: ThemeColorToken | ThemeColorToken[]) {
  if (Array.isArray(tokenOrTokens)) {
    return tokenOrTokens.map((token) => colorMap[token]);
  }

  return colorMap[tokenOrTokens];
}
