import { Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui";
import type { RoutineWithExercises } from "@/features/routines";

interface RoutineCardProps {
  routine: RoutineWithExercises;
  onPress: () => void;
  onStartRoutine: () => void;
}

export function RoutineCard({ routine, onPress, onStartRoutine }: RoutineCardProps) {
  const { title, exercises } = routine;

  // Fallback: use first exercise name if title is empty/default
  const normalizedTitle = title.trim();
  const displayTitle =
    normalizedTitle && normalizedTitle !== "Untitled Routine"
      ? normalizedTitle
      : exercises[0]?.name || "Untitled Routine";

  // Build comma-separated exercise list
  const exerciseNames = exercises.map((e) => e.name);
  const fullExerciseText = exerciseNames.join(", ");

  // Truncate to 2 lines (approximate: ~40 chars per line = 80 chars)
  const MAX_CHARS = 80;
  let displayExercises = fullExerciseText;
  let hasMore = false;
  let remainingCount = 0;

  if (fullExerciseText.length > MAX_CHARS) {
    // Find last comma before MAX_CHARS
    const truncated = fullExerciseText.slice(0, MAX_CHARS);
    const lastComma = truncated.lastIndexOf(",");
    if (lastComma > 0) {
      displayExercises = truncated.slice(0, lastComma);
      const displayedCount = displayExercises
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean).length;
      remainingCount = Math.max(0, exerciseNames.length - displayedCount);
      hasMore = remainingCount > 0;
    } else {
      displayExercises = truncated;
      hasMore = true;
      remainingCount = Math.max(0, exerciseNames.length - 1);
    }
  }

  return (
    <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-light rounded-2xl overflow-hidden">
      {/* Card body - tappable for edit */}
      <Pressable onPress={onPress} className="p-5 active:opacity-70">
        {/* Title */}
        <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          {displayTitle}
        </Text>

        {/* Exercise overview */}
        {exercises.length > 0 ? (
          <View>
            <Text
              numberOfLines={2}
              className="text-sm text-light-text-secondary dark:text-dark-text-secondary"
            >
              {displayExercises}
              {hasMore && remainingCount > 0 ? ` +${remainingCount} more` : ""}
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary italic">
            No exercises added
          </Text>
        )}
      </Pressable>

      {/* Divider */}
      <View className="h-px bg-light-border-light dark:bg-dark-border-light" />

      {/* Footer - Start Routine button */}
      <View className="px-5 py-3">
        <Button
          title="Start Routine"
          onPress={onStartRoutine}
          variant="secondary"
          className="py-3"
        />
      </View>
    </View>
  );
}
