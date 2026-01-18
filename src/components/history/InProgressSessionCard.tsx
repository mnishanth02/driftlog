import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";
import { formatDate, formatElapsedTime } from "@/core/utils/helpers";
import type { HistorySession } from "@/features/history";

interface InProgressSessionCardProps {
  session: HistorySession;
  onResume: () => void;
  onDiscard: () => void;
}

function InProgressSessionCardComponent({
  session,
  onResume,
  onDiscard,
}: InProgressSessionCardProps) {
  const { colorScheme } = useTheme();

  // Calculate elapsed time since session started
  const elapsedSeconds = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);

  const handleDiscard = () => {
    Alert.alert(
      "Discard Workout?",
      "This will permanently delete this in-progress workout. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: onDiscard,
        },
      ],
    );
  };

  return (
    <View
      className="bg-light-surface/70 dark:bg-dark-surface/70 border border-dashed border-warning dark:border-warning rounded-2xl p-5 mb-4"
      accessibilityRole="button"
      accessibilityLabel={`In-progress workout from ${formatDate(session.date, "EEEE, MMMM d")}`}
    >
      {/* Header: Date & In Progress Badge */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="bg-warning/20 dark:bg-warning/30 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-semibold text-warning dark:text-warning">
              In Progress
            </Text>
          </View>
          <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {formatElapsedTime(elapsedSeconds)} ago
          </Text>
        </View>
      </View>

      {/* Session Info */}
      <Text className="text-base font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
        {formatDate(session.date, "EEEE, MMMM d")}
      </Text>

      {/* Routine Title (if exists) */}
      {session.planTitle ? (
        <View className="flex-row items-center mb-2 gap-1.5">
          <Ionicons
            name="barbell-outline"
            size={14}
            color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
            accessible={false}
          />
          <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {session.planTitle}
          </Text>
        </View>
      ) : null}

      {/* Exercise count */}
      <View className="flex-row items-center mb-3 gap-1.5">
        <Ionicons
          name="fitness-outline"
          size={14}
          color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
          accessible={false}
        />
        <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          {session.exerciseCount} {session.exerciseCount === 1 ? "exercise" : "exercises"}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={onResume}
          android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}
          accessibilityRole="button"
          accessibilityLabel="Resume workout"
          className="flex-1 bg-primary-500 dark:bg-dark-primary py-3 rounded-xl items-center active:opacity-70"
        >
          <Text className="text-sm font-semibold text-white dark:text-dark-bg-primary">Resume</Text>
        </Pressable>

        <Pressable
          onPress={handleDiscard}
          android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
          accessibilityRole="button"
          accessibilityLabel="Discard workout"
          className="flex-1 bg-light-bg-cream dark:bg-dark-bg-elevated border border-light-border-medium dark:border-dark-border-medium py-3 rounded-xl items-center active:opacity-70"
        >
          <Text className="text-sm font-semibold text-error dark:text-error">Discard</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const InProgressSessionCard = memo(InProgressSessionCardComponent);
