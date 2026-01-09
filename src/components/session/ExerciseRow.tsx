import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import type { ExerciseLog } from "@/features/session/types";

interface ExerciseRowProps {
  exercise: ExerciseLog;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  isDragging?: boolean;
}

function ExerciseRowComponent({
  exercise,
  index,
  isActive,
  onPress,
  onLongPress,
  isDragging = false,
}: ExerciseRowProps) {
  const isCompleted = !!exercise.completedAt;

  // Visual state classes based on status
  const getContainerClasses = () => {
    const base = "rounded-2xl mb-3 border overflow-hidden";

    if (isDragging) {
      return `${base} bg-primary-100 dark:bg-dark-bg-accent border-primary-300 dark:border-dark-primary opacity-90`;
    }

    if (isCompleted) {
      return `${base} bg-light-bg-cream dark:bg-dark-bg-secondary border-light-border-light dark:border-dark-border-light opacity-60`;
    }

    if (isActive) {
      return `${base} bg-light-surface dark:bg-dark-surface border-primary-500 dark:border-dark-primary border-2`;
    }

    return `${base} bg-light-surface dark:bg-dark-surface border-light-border-light dark:border-dark-border-medium`;
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className={getContainerClasses()}
      style={
        isDragging ? { elevation: 5, shadowOpacity: 0.3, transform: [{ scale: 1.02 }] } : undefined
      }
    >
      <View className="flex-row items-center">
        {/* Drag handle - hamburger icon on left */}
        <Pressable
          onLongPress={onLongPress}
          className="px-4 py-5 active:opacity-70"
          accessibilityLabel="Long press to reorder"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View className="gap-1">
            <View className="w-4 h-0.5 rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary" />
            <View className="w-4 h-0.5 rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary" />
            <View className="w-4 h-0.5 rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary" />
          </View>
        </Pressable>

        {/* Position indicator */}
        <View className="w-7 h-7 rounded-full items-center justify-center mr-3 bg-light-bg-cream dark:bg-dark-bg-accent">
          <Text className="text-xs font-bold text-light-text-tertiary dark:text-dark-text-tertiary">
            {index + 1}
          </Text>
        </View>

        {/* Exercise name - flex-1 to take remaining space */}
        <Text
          className={`flex-1 py-5 pr-4 ${
            isCompleted
              ? "text-base text-light-text-tertiary dark:text-dark-text-tertiary line-through"
              : isActive
                ? "text-lg font-bold text-light-text-primary dark:text-dark-text-primary"
                : "text-base font-medium text-light-text-primary dark:text-dark-text-primary"
          }`}
          numberOfLines={2}
        >
          {exercise.name}
        </Text>

        {/* Completion indicator */}
        {isCompleted ? (
          <View className="w-10 h-10 rounded-full items-center justify-center bg-success mr-4">
            <Ionicons name="checkmark" size={22} color="#ffffff" />
          </View>
        ) : (
          <View className="w-10 h-10 rounded-full items-center justify-center border-2 border-light-border-medium dark:border-dark-border-medium mr-4">
            <View className="w-3 h-3 rounded-full bg-light-border-light dark:bg-dark-border-light" />
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const ExerciseRow = memo(ExerciseRowComponent);
