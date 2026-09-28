import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TrayProvider } from 'react-native-morpheus';
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  // keep gesture handling above every screen in the tree
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
             <KeyboardProvider>
        <TrayProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </TrayProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
