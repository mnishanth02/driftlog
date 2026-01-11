import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Appearance,
  type ColorSchemeName,
  useColorScheme as useNativeColorScheme,
} from "react-native";

type ColorScheme = "light" | "dark" | "system";

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  selectedScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@driftlog_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const nativeColorScheme = useNativeColorScheme();
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>("system");

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
          const preference = saved as ColorScheme;
          setSelectedScheme(preference);

          // Apply the preference immediately to React Native's Appearance API
          // NativeWind v5 runtime listens to these changes automatically
          if (preference === "system") {
            Appearance.setColorScheme(null);
          } else {
            Appearance.setColorScheme(preference as "light" | "dark");
          }
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };

    void loadThemePreference();
  }, []);

  const setColorSchemeWithPersistence = async (scheme: ColorScheme) => {
    try {
      setSelectedScheme(scheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);

      // Apply the scheme using the native Appearance API
      if (scheme === "system") {
        Appearance.setColorScheme(null);
      } else {
        Appearance.setColorScheme(scheme as "light" | "dark");
      }
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const toggleColorScheme = () => {
    // Toggle between light and dark
    const current = Appearance.getColorScheme();
    const newScheme: Exclude<ColorScheme, "system"> = current === "dark" ? "light" : "dark";
    void setColorSchemeWithPersistence(newScheme);
  };

  // The effectively active color scheme is reactive via useNativeColorScheme()
  // which React Native updates whenever Appearance.setColorScheme is called.
  const effectiveColorScheme = nativeColorScheme || "light";

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: effectiveColorScheme,
        selectedScheme,
        setColorScheme: setColorSchemeWithPersistence,
        toggleColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
