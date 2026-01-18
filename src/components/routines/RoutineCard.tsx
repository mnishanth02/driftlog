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
      style={ {
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: isCompleted
          ? colorScheme === "dark" ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)"
          : colorScheme === "dark" ? "rgba(42, 42, 42, 0.5)" : "rgba(249, 245, 241, 0.5)",
      } }
    >
      {/* Card Header with Completion Badge */ }
      <View style={ { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 } }>
        <Pressable
          onPress={ onPress }
          android_ripple={ { color: "rgba(244, 162, 97, 0.3)" } }
          style={ { flex: 1, paddingRight: 12 } }
          accessibilityRole="button"
          accessibilityLabel={ `Edit routine: ${displayTitle}${isCompleted ? ", completed" : ""}` }
          accessibilityHint="Opens routine editor"
        >
          {/* Title Row with Checkmark */ }
          <View style={ { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 } }>
            <Text
              style={ {
                flex: 1,
                fontSize: 18,
                fontWeight: "700",
                color: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
              } }
            >
              { displayTitle }
            </Text>

            {/* Success Checkmark */ }
            { isCompleted && (
              <View
                style={ {
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#10b981",
                  alignItems: "center",
                  justifyContent: "center",
                } }
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
              style={ {
                fontSize: 14,
                lineHeight: 20,
                color: isCompleted
                  ? colorScheme === "dark" ? "#8e8e8e" : "#8e8e8e"
                  : colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b",
              } }
            >
              { fullExerciseText }
            </Text>
          ) : (
            <Text
              style={ {
                fontSize: 14,
                color: colorScheme === "dark" ? "#8e8e8e" : "#8e8e8e",
                fontStyle: "italic",
              } }
            >
              No exercises added
            </Text>
          ) }
        </Pressable>

        {/* Delete Button */ }
        { onDelete && (
          <Pressable
            onPress={ onDelete }
            android_ripple={ { color: "rgba(0, 0, 0, 0.1)", radius: 20 } }
            style={ {
              minWidth: 36,
              minHeight: 36,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f9f5f1",
            } }
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
      <View
        style={ {
          height: 1,
          backgroundColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e4df",
          marginHorizontal: 16,
        } }
      />

      {/* Footer - Action Button */ }
      <View style={ { padding: 16 } }>
        { isCompleted ? (
          // Completed State - Ghost Button
          <Button
            title="Completed Today"
            onPress={ () => {} } // No-op, button is informational
            variant="ghost"
            disabled={ true }
            className="min-h-11 opacity-70"
          />
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
