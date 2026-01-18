import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/core/contexts/ThemeContext";
import { useSettingsStore } from "@/features/settings";

export default function SettingsScreen() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { autoEndSession, autoEndTimeout, setAutoEndSession, setAutoEndTimeout } =
    useSettingsStore();

  // Timeout presets in minutes
  const timeoutPresets = [15, 30, 45, 60, 90];

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={ colorScheme === "dark" ? "light" : "dark" } />
      <ScrollView
        className="flex-1"
        contentContainerStyle={ {
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
        } }
      >
        {/* Header */ }
        <View className="mb-8">
          <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Settings
          </Text>
          <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary mt-2">
            Customize your DriftLog experience
          </Text>
        </View>

        {/* Theme Section */ }
        <View
          style={ {
            backgroundColor: colorScheme === "dark" ? "#252525" : "#ffffff",
            borderWidth: 1,
            borderColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e4df",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          } }
        >
          <Text
            style={ {
              fontSize: 18,
              fontWeight: "600",
              color: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
              marginBottom: 12,
            } }
          >
            Appearance
          </Text>
          <ThemeToggle />
        </View>

        {/* Auto-End Session Section */ }
        <View
          style={ {
            backgroundColor: colorScheme === "dark" ? "#252525" : "#ffffff",
            borderWidth: 1,
            borderColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e4df",
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          } }
        >
          <View style={ { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }>
            <View style={ { flex: 1, paddingRight: 16 } }>
              <Text
                style={ {
                  fontSize: 18,
                  fontWeight: "600",
                  color: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
                  marginBottom: 4,
                } }
              >
                Auto-End Session
              </Text>
              <Text
                style={ {
                  fontSize: 14,
                  color: colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b",
                } }
              >
                Automatically end session after { autoEndTimeout } minutes of inactivity
              </Text>
            </View>

            <Switch
              value={ autoEndSession }
              onValueChange={ setAutoEndSession }
              trackColor={ {
                false: colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4",
                true: colorScheme === "dark" ? "#ff9f6c" : "#f4a261",
              } }
              thumbColor="#ffffff"
              ios_backgroundColor={ colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4" }
              accessibilityRole="switch"
              accessibilityLabel="Auto-end session toggle"
              accessibilityHint={ `Turn ${autoEndSession ? "off" : "on"} automatic session ending` }
            />
          </View>

          {/* Timeout Picker - Only visible when auto-end is enabled */ }
          { autoEndSession && (
            <View
              style={ {
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e4df",
              } }
            >
              <Text
                style={ {
                  fontSize: 14,
                  fontWeight: "500",
                  color: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
                  marginBottom: 12,
                } }
              >
                Inactivity Timeout
              </Text>
              <View style={ { flexDirection: "row", flexWrap: "wrap", gap: 8 } }>
                { timeoutPresets.map((minutes) => (
                  <Pressable
                    key={ minutes }
                    onPress={ () => setAutoEndTimeout(minutes) }
                    android_ripple={ {
                      color:
                        autoEndTimeout === minutes
                          ? "rgba(255, 255, 255, 0.3)"
                          : "rgba(244, 162, 97, 0.3)",
                    } }
                    style={ {
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        autoEndTimeout === minutes
                          ? colorScheme === "dark" ? "#ff9f6c" : "#f4a261"
                          : colorScheme === "dark" ? "#2a2a2a" : "#f9f5f1",
                      borderWidth: autoEndTimeout === minutes ? 0 : 1,
                      borderColor: colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4",
                    } }
                    accessibilityRole="button"
                    accessibilityLabel={ `${minutes} minutes` }
                    accessibilityHint={ `Set timeout to ${minutes} minutes` }
                    accessibilityState={ { selected: autoEndTimeout === minutes } }
                  >
                    <Text
                      style={ {
                        fontSize: 14,
                        fontWeight: "600",
                        color:
                          autoEndTimeout === minutes
                            ? colorScheme === "dark" ? "#0f0f0f" : "#ffffff"
                            : colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
                      } }
                    >
                      { minutes } min
                    </Text>
                  </Pressable>
                )) }
              </View>
            </View>
          ) }
        </View>

        {/* Info Footer */ }
        <View className="items-center py-6 mt-4">
          <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary text-center">
            DriftLog v1.0{ "\n" }
            Offline-first workout logging
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
