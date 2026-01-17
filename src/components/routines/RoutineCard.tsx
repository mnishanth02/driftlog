import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui";
import { useTheme } from "@/core/contexts/ThemeContext";
import type { RoutineWithExercises } from "@/features/routines";

interface RoutineCardProps {
  routine: RoutineWithExercises;
  onPress: () => void;
  onStartRoutine: () => void;
  onDelete?: () => void;
  isCompleted?: boolean; // Completion status
  completedDate?: string; // Date when completed (for future use - tooltips, etc.)
}

function RoutineCardComponent({
  routine,
  onPress,
  onStartRoutine,
  onDelete,
  isCompleted = false,
  completedDate: _completedDate, // Prefixed with _ to indicate intentionally unused (for future use)
}: RoutineCardProps) {
  const { title, exercises } = routine;
  const { colorScheme } = useTheme();

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
    <View
      className={`bg-light-surface dark:bg-dark-surface border rounded-2xl overflow-hidden shadow-sm ${
        isCompleted
          ? "border-success/20 bg-light-bg-cream/50 dark:bg-dark-bg-elevated/50"
          : "border-light-border-light dark:border-dark-border-medium"
      }`}
    >
      {/* Card Header with Completion Badge */}
      <View className="flex-row items-start justify-between px-5 pt-5 pb-3">
        <Pressable
          onPress={onPress}
          className="flex-1 pr-3 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel={`Edit routine: ${displayTitle}${isCompleted ? ", completed" : ""}`}
          accessibilityHint="Opens routine editor"
        >
          {/* Title Row with Checkmark */}
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary flex-1">
              {displayTitle}
            </Text>

            {/* Success Checkmark */}
            {isCompleted && (
              <View
                className="w-6 h-6 rounded-full bg-success items-center justify-center"
                accessibilityLabel="Completed"
              >
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
            )}
          </View>

          {/* Exercise overview */}
          {exercises.length > 0 ? (
            <Text
              numberOfLines={2}
              className={`text-sm leading-5 ${
                isCompleted
                  ? "text-light-text-tertiary dark:text-dark-text-tertiary"
                  : "text-light-text-secondary dark:text-dark-text-secondary"
              }`}
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

      {/* Footer - Action Button */}
      <View className="p-5">
        {isCompleted ? (
          // Completed State - Ghost Button
          <Button
            title="Completed Today"
            onPress={() => {}} // No-op, button is informational
            variant="ghost"
            disabled={true}
            className="min-h-11 opacity-70"
          />
        ) : (
          // Original: Start Session Button
          <Button
            title="Start Session"
            onPress={onStartRoutine}
            variant="primary"
            className="min-h-11"
          />
        )}
      </View>
    </View>
  );
}

export const RoutineCard = memo(RoutineCardComponent);
