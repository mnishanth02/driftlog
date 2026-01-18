import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
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
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Settings
          </Text>
          <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary mt-2">
            Customize your DriftLog experience
          </Text>
        </View>

        {/* Theme Section */}
        <Card title="Appearance" className="mb-6">
          <ThemeToggle />
        </Card>

        {/* Auto-End Session Section */}
        <Card className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Auto-End Session
              </Text>
              <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Automatically end session after {autoEndTimeout} minutes of inactivity
              </Text>
            </View>

            <Switch
              value={autoEndSession}
              onValueChange={setAutoEndSession}
              trackColor={{
                false: colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4",
                true: colorScheme === "dark" ? "#ff9f6c" : "#f4a261",
              }}
              thumbColor="#ffffff"
              ios_backgroundColor={colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4"}
              accessibilityRole="switch"
              accessibilityLabel="Auto-end session toggle"
              accessibilityHint={`Turn ${autoEndSession ? "off" : "on"} automatic session ending`}
            />
          </View>

          {/* Timeout Picker - Only visible when auto-end is enabled */}
          {autoEndSession && (
            <View className="mt-4 pt-4 border-t border-light-border-light dark:border-dark-border-medium">
              <Text className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Inactivity Timeout
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {timeoutPresets.map((minutes) => (
                  <Pressable
                    key={minutes}
                    onPress={() => setAutoEndTimeout(minutes)}
                    className={`px-4 py-2.5 rounded-lg border ${
                      autoEndTimeout === minutes
                        ? "bg-primary-500 border-primary-500 dark:bg-dark-primary dark:border-dark-primary"
                        : "bg-light-bg-cream border-light-border-medium dark:bg-dark-bg-elevated dark:border-dark-border-medium"
                    }`}
                    accessibilityRole="button"
                    accessibilityLabel={`${minutes} minutes`}
                    accessibilityHint={`Set timeout to ${minutes} minutes`}
                    accessibilityState={{ selected: autoEndTimeout === minutes }}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        autoEndTimeout === minutes
                          ? "text-white dark:text-dark-bg-primary"
                          : "text-light-text-primary dark:text-dark-text-primary"
                      }`}
                    >
                      {minutes} min
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Info Footer */}
        <View className="items-center py-6 mt-4">
          <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary text-center">
            DriftLog v1.0{"\n"}
            Offline-first workout logging
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
