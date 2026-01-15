import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";
import { formatDate, formatElapsedTime } from "@/core/utils/helpers";
import type { HistorySession } from "@/features/history";

interface SessionCardProps {
  session: HistorySession;
  onPress: () => void;
}

function SessionCardComponent({ session, onPress }: SessionCardProps) {
  const { colorScheme } = useTheme();

  // Calculate duration if session has ended
  const duration = session.endTime
    ? Math.floor(
        (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000,
      )
    : null;

  return (
    <Pressable
      onPress={onPress}
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
  );
}

export const SessionCard = memo(SessionCardComponent);
