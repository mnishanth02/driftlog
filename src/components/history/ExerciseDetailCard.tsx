import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Card } from "@/components/ui";
import { useTheme } from "@/core/contexts/ThemeContext";
import type { ExerciseDetail, SetDetail } from "@/features/history";

interface SetsListProps {
  sets: SetDetail[];
  weightUnit: string;
}

function SetsList({ sets, weightUnit }: SetsListProps) {
  if (sets.length === 0) {
    return (
      <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary italic">
        No sets logged
      </Text>
    );
  }

  return (
    <View className="mt-3">
      {/* Table Header */}
      <View className="flex-row pb-2 border-b border-light-border-light dark:border-dark-border-medium">
        <Text className="w-12 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary text-center">
          Set
        </Text>
        <Text className="w-16 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary text-center">
          Reps
        </Text>
        <Text className="flex-1 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary text-center">
          Weight
        </Text>
      </View>

      {/* Table Rows */}
      {sets.map((set) => (
        <View
          key={set.id}
          className="flex-row py-2.5 border-b border-light-border-light dark:border-dark-border-light"
        >
          <Text className="w-12 text-sm text-light-text-primary dark:text-dark-text-primary text-center">
            {set.order + 1}
          </Text>
          <Text className="w-16 text-sm text-light-text-primary dark:text-dark-text-primary text-center">
            {set.reps}
          </Text>
          <Text className="flex-1 text-sm text-light-text-primary dark:text-dark-text-primary text-center">
            {set.weight != null ? `${set.weight} ${weightUnit}` : "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}

interface ExerciseDetailCardProps {
  exercise: ExerciseDetail;
  weightUnit: string;
}

export function ExerciseDetailCard({ exercise, weightUnit }: ExerciseDetailCardProps) {
  const { colorScheme } = useTheme();

  return (
    <Card className="mb-3">
      <View className="flex-row items-center gap-2 mb-1">
        <Ionicons
          name="fitness-outline"
          size={18}
          color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
        />
        <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
          {exercise.name}
        </Text>
      </View>
      <SetsList sets={exercise.sets} weightUnit={weightUnit} />
    </Card>
  );
}
