import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";

export default function PlanScreen() {
  const { colorScheme } = useTheme();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView className="flex-1 px-4 pt-12">
        <Text className="text-3xl font-bold text-black dark:text-white mb-2">Weekly Plan</Text>
        <Text className="text-base text-gray-600 dark:text-gray-400 mb-6">
          Rough intent, not prescription
        </Text>

        <View className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 items-center justify-center h-64">
          <Text className="text-gray-500 dark:text-gray-500 text-center">
            Weekly planning view coming soon
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
