import * as ExpoHaptics from 'expo-haptics';

export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

// every tap and buzz in the app passes here so the Haptics setting can silence them all
let enabled = true;

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export function hapticsEnabled() {
  return enabled;
}

export async function selectionAsync() {
  if (enabled) await ExpoHaptics.selectionAsync();
}

export async function impactAsync(style?: ExpoHaptics.ImpactFeedbackStyle) {
  if (enabled) await ExpoHaptics.impactAsync(style);
}

export async function notificationAsync(type?: ExpoHaptics.NotificationFeedbackType) {
  if (enabled) await ExpoHaptics.notificationAsync(type);
}
