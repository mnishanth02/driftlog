import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { useTheme } from "@/core/contexts/ThemeContext";

export default function TodayScreen() {
  const { colorScheme } = useTheme();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView className="flex-1 px-4 pt-12">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text className="text-3xl font-bold text-black dark:text-white mt-1">Today's Drift</Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <MetricCard label="Duration" value="0" unit="min" icon="⏱️" />
          </View>
          <View className="flex-1">
            <MetricCard label="Distance" value="0" unit="km" icon="📍" />
          </View>
        </View>

        {/* Today's Session Card */}
        <Card title="Start Your Session">
          <View className="py-4">
            <Text className="text-base text-gray-600 dark:text-gray-400 mb-6 text-center">
              Log your training, track your drift
            </Text>

            <Button
              title="Start Session"
              onPress={() => console.log("Start session")}
              variant="primary"
            />
          </View>
        </Card>

        {/* Recent Note */}
        <View className="mt-6 bg-gray-100 dark:bg-gray-900 rounded-2xl p-6">
          <Text className="text-sm font-semibold text-black dark:text-white mb-2">Quick Note</Text>
          <Text className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            How did you feel today?
          </Text>
        </View>

        {/* Spacer for bottom tab bar */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
