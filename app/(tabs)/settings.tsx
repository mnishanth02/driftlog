import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/core/contexts/ThemeContext";

export default function SettingsScreen() {
  const { colorScheme } = useTheme();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView className="flex-1 px-4 pt-12">
        <Text className="text-3xl font-bold text-black dark:text-white mb-2">Settings</Text>
        <Text className="text-base text-gray-600 dark:text-gray-400 mb-6">
          Minimal configuration
        </Text>

        <View className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-base font-medium text-black dark:text-white">Theme</Text>
            <ThemeToggle />
          </View>
        </View>

        <View className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 items-center justify-center h-40">
          <Text className="text-gray-500 dark:text-gray-500 text-center">
            Additional settings coming soon
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
