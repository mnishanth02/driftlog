import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";
import type { ExerciseDetail } from "@/features/history";

interface ExerciseDetailCardProps {
  exercise: ExerciseDetail;
}

export function ExerciseDetailCard({ exercise }: ExerciseDetailCardProps) {
  const { colorScheme } = useTheme();

  return (
    <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-xl px-3 py-2 mb-2 flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <View className="w-6 h-6 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center">
          <Ionicons
            name="fitness-outline"
            size={ 14 }
            color={ colorScheme === "dark" ? "#ff9f6c" : "#f4a261" }
          />
        </View>
        <Text className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
          { exercise.name }
        </Text>
      </View>

      <View className="bg-success/10 px-2.5 py-0.5 rounded-full">
        <Text className="text-xs font-bold text-success capitalize">Completed</Text>
      </View>
    </View>
  );
}
