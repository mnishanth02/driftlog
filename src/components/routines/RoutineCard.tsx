import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { Button } from "@/components/ui";
import type { RoutineWithExercises } from "@/features/routines";

interface RoutineCardProps {
  routine: RoutineWithExercises;
  onPress: () => void;
  onStartRoutine: () => void;
  onDelete?: () => void;
}

function RoutineCardComponent({ routine, onPress, onStartRoutine, onDelete }: RoutineCardProps) {
  const { title, exercises } = routine;
  const colorScheme = useColorScheme();

  // Fallback: use first exercise name if title is empty/default
  const normalizedTitle = title.trim();
  const displayTitle =
    normalizedTitle && normalizedTitle !== "Untitled Routine"
      ? normalizedTitle
      : exercises[0]?.name || "Untitled Routine";

  // Build comma-separated exercise list
  const exerciseNames = exercises.map((e) => e.name);
  const fullExerciseText = exerciseNames.join(" • ");

  return (
    <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl overflow-hidden shadow-sm">
      {/* Card Header with Delete Button */}
      <View className="flex-row items-start justify-between px-5 pt-5 pb-3">
        <Pressable onPress={onPress} className="flex-1 pr-3 active:opacity-70">
          {/* Title */}
          <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            {displayTitle}
          </Text>

          {/* Exercise overview */}
          {exercises.length > 0 ? (
            <Text
              numberOfLines={2}
              className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-5"
            >
              {fullExerciseText}
            </Text>
          ) : (
            <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary italic">
              No exercises added
            </Text>
          )}
        </Pressable>

        {/* Delete Button */}
        {onDelete && (
          <Pressable
            onPress={onDelete}
            className="min-w-9 min-h-9 w-9 h-9 items-center justify-center rounded-lg active:opacity-70 bg-light-bg-cream dark:bg-dark-bg-elevated"
            accessibilityRole="button"
            accessibilityLabel="Delete routine"
            accessibilityHint="Removes this routine from your plan"
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
            />
          </Pressable>
        )}
      </View>

      {/* Divider */}
      <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

      {/* Footer - Start Routine button */}
      <View className="p-5">
        <Button
          title="Start Session"
          onPress={onStartRoutine}
          variant="primary"
          className="min-h-11"
        />
      </View>
    </View>
  );
}

export const RoutineCard = memo(RoutineCardComponent);
