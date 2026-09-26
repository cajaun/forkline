import { Colors } from "../constants";
import { Uniwind, useUniwind } from "uniwind";

export type AppThemeMode = "system" | "light" | "dark";

export function useAppColorScheme() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const colorScheme = theme === "dark" ? "dark" : "light";
  const mode: AppThemeMode = hasAdaptiveThemes ? "system" : colorScheme;

  return {
    colorScheme,
    mode,
    setColorScheme: (nextTheme: AppThemeMode) => {
      Uniwind.setTheme(nextTheme);
    },
  };
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  path: string
) {
  const { colorScheme } = useAppColorScheme();
  const theme: "light" | "dark" = colorScheme === "dark" ? "dark" : "light";

  const colorFromProps = props[theme];
  if (colorFromProps) return colorFromProps;

  const keys = path.split(".");
  let value: any = Colors[theme];

  for (const key of keys) {
    value = value?.[key];
  }

  return value;
}
