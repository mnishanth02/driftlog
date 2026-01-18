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
      className={ `rounded-2xl overflow-hidden border ${isCompleted
          ? "bg-success/10 dark:bg-success/15 border-success/30"
          : "bg-light-bg-cream/50 dark:bg-dark-bg-accent/50 border-light-border-light dark:border-dark-border-light"
        }` }
    >
      {/* Card Header with Completion Badge */ }
      <View className="flex-row items-start justify-between px-4 pt-4 pb-2">
        <Pressable
          onPress={ onPress }
          android_ripple={ { color: "rgba(244, 162, 97, 0.3)" } }
          className="flex-1 pr-3"
          accessibilityRole="button"
          accessibilityLabel={ `Edit routine: ${displayTitle}${isCompleted ? ", completed" : ""}` }
          accessibilityHint="Opens routine editor"
        >
          {/* Title Row with Checkmark */ }
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="flex-1 text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
              { displayTitle }
            </Text>

            {/* Success Checkmark */ }
            { isCompleted && (
              <View
                className="w-6 h-6 rounded-full bg-success items-center justify-center shadow-sm"
                accessibilityLabel="Completed"
              >
                <Ionicons name="checkmark" size={ 16 } color="#ffffff" accessible={ false } />
              </View>
            ) }
          </View>

          {/* Exercise overview */ }
          { exercises.length > 0 ? (
            <Text
              numberOfLines={ 2 }
              className={ `text-sm leading-5 ${isCompleted
                  ? "text-light-text-secondary dark:text-dark-text-secondary font-medium"
                  : "text-light-text-secondary dark:text-dark-text-secondary"
                }` }
            >
              { fullExerciseText }
            </Text>
          ) : (
            <Text className="text-sm italic text-light-text-tertiary dark:text-dark-text-tertiary">
              No exercises added
            </Text>
          ) }
        </Pressable>

        {/* Delete Button */ }
        { onDelete && (
          <Pressable
            onPress={ onDelete }
            android_ripple={ { color: "rgba(0, 0, 0, 0.1)", radius: 20 } }
            className="w-9 h-9 items-center justify-center rounded-lg bg-light-bg-cream dark:bg-dark-bg-accent"
            accessibilityRole="button"
            accessibilityLabel="Delete routine"
            accessibilityHint="Removes this routine from your plan"
            hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
          >
            <Ionicons
              name="trash-outline"
              size={ 18 }
              color={ colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
              accessible={ false }
            />
          </Pressable>
        ) }
      </View>

      {/* Divider */ }
      <View className="h-[1px] bg-light-border-light dark:bg-dark-border-light mx-4" />

      {/* Footer - Action Button */ }
      <View className="p-4">
        { isCompleted ? (
          // Completed State - Placeholder for informative badge
          <View className="flex-row items-center justify-center min-h-11 rounded-xl bg-success/10 border border-success/20">
            <Text className="text-success font-semibold">Completed Today</Text>
          </View>
        ) : (
          // Original: Start Session Button
          <Button
            title="Start Session"
            onPress={ onStartRoutine }
            variant="primary"
            className="min-h-11"
          />
        ) }
      </View>
    </View>
  );
}

export const RoutineCard = memo(RoutineCardComponent);
