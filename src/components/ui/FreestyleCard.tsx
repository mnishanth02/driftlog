import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";

interface FreestyleCardProps {
  onPress: () => void;
}

export function FreestyleCard({ onPress }: FreestyleCardProps) {
  const { colorScheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-6 flex-row items-center justify-between active:opacity-80"
    >
      <View className="flex-row items-center gap-4">
        <View className="w-12 h-12 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center">
          <Ionicons
            name="flash-outline"
            size={24}
            color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
          />
        </View>
        <View>
          <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
            No Plan? Freestyle Session
          </Text>
          <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Build as you go
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={colorScheme === "dark" ? "#6b6b6b" : "#8e8e8e"}
      />
    </Pressable>
  );
}
