import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/core/contexts/ThemeContext";
import { initDatabase } from "@/core/db";

import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [loaded, error] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Initialize database
  useEffect(() => {
    initDatabase()
      .then(() => setDbInitialized(true))
      .catch((err) => {
        console.error("Failed to initialize database:", err);
        throw err;
      });
  }, []);

  useEffect(() => {
    if (loaded && dbInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbInitialized]);

  if (!loaded || !dbInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
