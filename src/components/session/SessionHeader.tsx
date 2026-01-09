import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSessionStore } from "@/features/session";
import { useSessionTimer } from "@/hooks";
import { useTheme } from "@/core/contexts/ThemeContext";

interface SessionHeaderProps {
  onTimerPress: () => void;
}

function SessionHeaderComponent({ onTimerPress }: SessionHeaderProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const { currentRoutineTitle, timerStartTime, targetDuration, setTimerWarningShown } =
    useSessionStore();

  // Use the custom timer hook
  const { isOvertime, formattedRemaining } = useSessionTimer({
    startTime: timerStartTime,
    targetDuration,
    onTimeUp: () => {
      // Mark warning as shown when time's up
      setTimerWarningShown(true);
    },
  });

  return (
    <View className="px-5 pt-14 pb-3 bg-light-surface dark:bg-dark-surface border-b border-light-border-light dark:border-dark-border-medium">
      {/* Routine Title */}
      <Text className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary text-center mb-2">
        {currentRoutineTitle || "Workout"}
      </Text>

      {/* Timer Display - Tappable, prominent */}
      <Pressable
        onPress={onTimerPress}
        className={`flex-row items-center justify-center gap-3 py-3 px-4 rounded-2xl mx-auto active:opacity-70 ${
          isOvertime
            ? "bg-red-100 dark:bg-red-900/30"
            : "bg-light-bg-cream dark:bg-dark-bg-elevated"
        }`}
      >
        <Ionicons
          name="timer-outline"
          size={28}
          color={isOvertime ? "#dc2626" : isDark ? "#ff9f6c" : "#f4a261"}
        />
        <Text
          className={`text-5xl font-black tracking-tight ${
            isOvertime
              ? "text-red-600 dark:text-red-400"
              : "text-light-text-primary dark:text-dark-text-primary"
          }`}
        >
          {isOvertime ? "-" : ""}
          {formattedRemaining}
        </Text>
        <Ionicons name="chevron-down" size={20} color={isDark ? "#8e8e8e" : "#6b6b6b"} />
      </Pressable>

      {/* Subtitle */}
      <Text className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary text-center mt-2">
        {isOvertime ? "Overtime - tap to adjust" : `${targetDuration} min session`}
      </Text>
    </View>
  );
}

export const SessionHeader = memo(SessionHeaderComponent);
