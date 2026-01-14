import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { memo, useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { useTheme } from "@/core/contexts/ThemeContext";
import { formatDate, formatElapsedTime } from "@/core/utils/helpers";
import type { HistorySession } from "@/features/history";

interface SessionCardProps {
  session: HistorySession;
  onPress: () => void;
  onDelete: () => void;
  onAssignToDate: () => void;
}

function SessionCardComponent({ session, onPress, onDelete, onAssignToDate }: SessionCardProps) {
  const { colorScheme } = useTheme();
  const swipeRef = useRef<SwipeableMethods | null>(null);

  // Calculate duration if session has ended
  const duration = session.endTime
    ? Math.floor(
        (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000,
      )
    : null;

  // Memoize action handlers to prevent recreation on each render
  const handleAssign = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeRef.current?.close();
    onAssignToDate();
  }, [onAssignToDate]);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeRef.current?.close();
    onDelete();
  }, [onDelete]);

  const handlePress = useCallback(() => {
    swipeRef.current?.close();
    onPress();
  }, [onPress]);

  const renderRightActions = useCallback(() => {
    return (
      <View className="flex-row justify-end items-center gap-1">
        {/* Assign to Date Action */}
        <Pressable
          onPress={handleAssign}
          accessibilityRole="button"
          accessibilityLabel="Assign to date"
          accessibilityHint="Creates a routine from this workout and assigns it to a date"
          className="bg-primary-500 dark:bg-dark-primary flex-col justify-center items-center h-full"
          style={{ width: 80 }}
        >
          <Ionicons name="calendar-outline" size={24} color="#ffffff" />
          <Text className="text-white text-xs font-semibold mt-1">Assign</Text>
        </Pressable>

        {/* Delete Action */}
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete session"
          accessibilityHint="Permanently deletes this workout session"
          className="bg-error flex-col justify-center items-center rounded-r-2xl h-full"
          style={{ width: 80 }}
        >
          <Ionicons name="trash-outline" size={24} color="#ffffff" />
          <Text className="text-white text-xs font-semibold mt-1">Delete</Text>
        </Pressable>
      </View>
    );
  }, [handleAssign, handleDelete]);

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Workout session from ${formatDate(session.date, "EEEE, MMMM d")}`}
        accessibilityHint="Double tap to view session details"
        className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-5 mb-3 active:opacity-70"
      >
        {/* Header: Date & Duration */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
            {formatDate(session.date, "EEEE, MMMM d")}
          </Text>
          {duration && (
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {formatElapsedTime(duration)}
            </Text>
          )}
        </View>

        {/* Routine Title (if exists) */}
        {session.planTitle ? (
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="barbell-outline"
              size={16}
              color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
              style={{ marginRight: 6 }}
            />
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {session.planTitle}
            </Text>
          </View>
        ) : null}

        {/* Stats Row */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <Ionicons
              name="fitness-outline"
              size={16}
              color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
              style={{ marginRight: 4 }}
            />
            <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
              {session.exerciseCount} {session.exerciseCount === 1 ? "exercise" : "exercises"}
            </Text>
          </View>

          {session.hasReflection ? (
            <View className="flex-row items-center">
              <Ionicons
                name="chatbox-outline"
                size={16}
                color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
                style={{ marginRight: 4 }}
              />
              <Text className="text-sm text-primary-500 dark:text-dark-primary">Reflection</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

export const SessionCard = memo(SessionCardComponent);
