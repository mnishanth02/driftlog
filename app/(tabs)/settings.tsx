import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/core/contexts/ThemeContext";
import { useSettingsStore } from "@/features/settings";

export default function SettingsScreen() {
  const { colorScheme } = useTheme();
  const { units, autoEndSession, setUnits, setAutoEndSession } = useSettingsStore();

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView className="flex-1 px-5">
        <View className="pt-12 gap-6 pb-8">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Settings
            </Text>
            <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Customize your DriftLog experience
            </Text>
          </View>

          {/* Theme Section */}
          <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border-light dark:border-dark-border-medium">
            <Text className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
              Appearance
            </Text>
            <ThemeToggle />
          </View>

          {/* Units Section */}
          <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border-light dark:border-dark-border-medium">
            <Text className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Units
            </Text>
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Choose your preferred weight unit
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setUnits("kg")}
                className={`flex-1 py-4 rounded-xl border-2 items-center justify-center ${
                  units === "kg"
                    ? "bg-primary-500 dark:bg-dark-primary border-primary-500 dark:border-dark-primary"
                    : "bg-light-bg-cream dark:bg-dark-bg-elevated border-light-border-medium dark:border-dark-border-medium"
                }`}
              >
                <Text
                  className={`text-lg font-semibold ${
                    units === "kg"
                      ? "text-white dark:text-dark-bg-primary"
                      : "text-light-text-primary dark:text-dark-text-primary"
                  }`}
                >
                  kg
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setUnits("lb")}
                className={`flex-1 py-4 rounded-xl border-2 items-center justify-center ${
                  units === "lb"
                    ? "bg-primary-500 dark:bg-dark-primary border-primary-500 dark:border-dark-primary"
                    : "bg-light-bg-cream dark:bg-dark-bg-elevated border-light-border-medium dark:border-dark-border-medium"
                }`}
              >
                <Text
                  className={`text-lg font-semibold ${
                    units === "lb"
                      ? "text-white dark:text-dark-bg-primary"
                      : "text-light-text-primary dark:text-dark-text-primary"
                  }`}
                >
                  lb
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Auto-End Session Section */}
          <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border-light dark:border-dark-border-medium">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                  Auto-End Session
                </Text>
                <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Automatically end session after 60 minutes of inactivity
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
              />
            </View>
          </View>

          {/* Info Footer */}
          <View className="items-center py-4">
            <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary text-center">
              DriftLog v1.0{"\n"}
              Offline-first workout logging
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
