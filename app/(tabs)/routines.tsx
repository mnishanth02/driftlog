import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/core/contexts/ThemeContext";

export default function RoutinesScreen() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView className="flex-1 px-5">
        <View className="gap-6 pb-8" style={{ paddingTop: insets.top + 12 }}>
          <View>
            <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Routines
            </Text>
            <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Manage your workout routines
            </Text>
          </View>

          <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 items-center justify-center min-h-64">
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-center">
              Routines management coming soon
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
