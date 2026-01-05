import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { ThemeDemo } from "@/components/ThemeDemo";
import { useTheme } from "@/core/contexts/ThemeContext";

export default function TodayScreen() {
  const { colorScheme } = useTheme();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ThemeDemo />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </View>
  );
}
