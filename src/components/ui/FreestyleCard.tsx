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
      onPress={ onPress }
      android_ripple={ { color: "rgba(244, 162, 97, 0.3)" } }
      className="flex-row items-center bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-5 shadow-sm dark:shadow-dark-sm"
      accessibilityRole="button"
      accessibilityLabel="Start freestyle session"
      accessibilityHint="Begin a workout without a planned routine"
      hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
    >
      <View
        className={ `w-12 h-12 rounded-full items-center justify-center mr-4 ${colorScheme === "dark" ? "bg-dark-primary/10" : "bg-primary-500/10"
          }` }
      >
        <Ionicons
          name="flash"
          size={ 24 }
          color={ colorScheme === "dark" ? "#ff9f6c" : "#f4a261" }
          accessible={ false }
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
          Freestyle Session
        </Text>
        <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Build your workout as you go
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={ 22 }
        color={ colorScheme === "dark" ? "#6b6b6b" : "#b5b5b5" }
        accessible={ false }
      />
    </Pressable>
  );
}
