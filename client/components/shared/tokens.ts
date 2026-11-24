import type { TextStyle } from "react-native";

export const trayText = {
  LargeTitle: {
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: 0.2,
  } satisfies TextStyle,
  Title1: {
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: 0.2,
  } satisfies TextStyle,
  Title2: {
    fontSize: 23,
    lineHeight: 28,
  } satisfies TextStyle,
  Title3: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.2,
  } satisfies TextStyle,
  Subheadline: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.1,
  } satisfies TextStyle,
  Body: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.1,
  } satisfies TextStyle,
  Button: {
    fontSize: 21,
    lineHeight: 28,
    letterSpacing: 0.2,
  } satisfies TextStyle,
} as const;
