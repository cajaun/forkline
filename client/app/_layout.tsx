import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TrayProvider } from "react-native-morpheus";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";

import { useAppReady } from "@/hooks/use-app-ready";
import { useSheetColors } from "@/hooks/use-sheet-colors";

const APP_FADE = FadeIn.duration(450);

// the app fades in over the splash colour instead of showing a logo
export default function RootLayout() {
  const ready = useAppReady();
  const { colors } = useSheetColors();

  if (!ready) return null;

  // the root wears the splash colour so the fade in starts from it and not the system white or black
  return (
    <GestureHandlerRootView style={{ backgroundColor: colors.appBackground, flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <TrayProvider>
            <Animated.View entering={APP_FADE} style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
              </Stack>
            </Animated.View>
          </TrayProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
