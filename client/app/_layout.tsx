import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TrayProvider } from "react-native-morpheus";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";

import { useSavedTheme } from "@/hooks/use-saved-theme";

const APP_FADE = FadeIn.duration(450);

// the app fades in over the splash colour instead of showing a logo
export default function RootLayout() {
  const themeReady = useSavedTheme();

  if (!themeReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
