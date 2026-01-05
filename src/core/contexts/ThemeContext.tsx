import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { type ColorSchemeName, useColorScheme } from "react-native";
import { colorScheme as nativeWindColorScheme } from "react-native-css";

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
  const systemColorScheme = useColorScheme();
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>("system");

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
          const preference = saved as ColorScheme;
          setSelectedScheme(preference);
          // Apply the preference immediately
          if (preference === "system") {
            nativeWindColorScheme.set(null); // null means follow system
          } else {
            nativeWindColorScheme.set(preference);
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

      // Apply the scheme using NativeWind's color scheme API
      if (scheme === "system") {
        nativeWindColorScheme.set(null); // null means follow system
      } else {
        nativeWindColorScheme.set(scheme);
      }
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const toggleColorScheme = () => {
    // Get the effective current color scheme
    const currentScheme = nativeWindColorScheme.get() || systemColorScheme || "light";

    // If currently in system mode, toggle to the opposite of current effective scheme
    if (selectedScheme === "system") {
      const newScheme: Exclude<ColorScheme, "system"> = currentScheme === "dark" ? "light" : "dark";
      void setColorSchemeWithPersistence(newScheme);
      return;
    }

    // Otherwise, toggle between light and dark
    const newScheme: Exclude<ColorScheme, "system"> = selectedScheme === "dark" ? "light" : "dark";
    void setColorSchemeWithPersistence(newScheme);
  };

  // Get the effective color scheme (either override or system)
  const effectiveColorScheme = nativeWindColorScheme.get() || systemColorScheme || "light";

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
