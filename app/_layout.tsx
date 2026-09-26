import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "@/components/toast";
import "../global.css";

export default function RootLayout() {
  const [loaded] = useFonts({
    "Sf-black": require("../assets/fonts/SF-Pro-Rounded-Black.otf"),
    "Sf-bold": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
    "Sf-semibold": require("../assets/fonts/SF-Pro-Rounded-Semibold.otf"),
    "Sf-medium": require("../assets/fonts/SF-Pro-Rounded-Medium.otf"),
    "Sf-regular": require("../assets/fonts/SF-Pro-Rounded-Regular.otf"),
    "Sf-light": require("../assets/fonts/SF-Pro-Rounded-Light.otf"),
    "Sf-thin": require("../assets/fonts/SF-Pro-Rounded-Thin.otf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="account" options={{ title: "Account" }} />
          <Stack.Screen name="toast" options={{ title: "Toast" }} />
          <Stack.Screen name="laminar" options={{ title: "Laminar" }} />
          <Stack.Screen name="forms" options={{ title: "Forms" }} />
        </Stack>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
