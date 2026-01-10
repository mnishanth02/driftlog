import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";
import { useSessionStore } from "@/features/session";
import { useSessionTimer } from "@/hooks";

interface SessionHeaderProps {
  onTimerPress: () => void;
}

function SessionHeaderComponent({ onTimerPress }: SessionHeaderProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const {
    currentRoutineTitle,
    timerStartTime,
    targetDuration,
    setTimerWarningShown,
    isTimerPaused,
    accumulatedPausedTime,
    resetTimerWithDuration,
  } = useSessionStore();

  // Use the custom timer hook with pause support
  const { isOvertime, formattedRemaining } = useSessionTimer({
    startTime: timerStartTime,
    targetDuration,
    isPaused: isTimerPaused,
    accumulatedPausedTime,
    onTimeUp: () => {
      // Mark warning as shown when time's up
      setTimerWarningShown(true);
    },
  });

  // Show target duration if timer hasn't started yet
  const displayTime = timerStartTime
    ? formattedRemaining
    : `${targetDuration.toString().padStart(2, "0")}:00`;

  return (
    <View className="px-5 pt-14 pb-3 bg-light-surface dark:bg-dark-surface border-b border-light-border-light dark:border-dark-border-medium">
      {/* Routine Title */}
      <Text className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary text-center mb-2">
        {currentRoutineTitle || "Workout"}
      </Text>

      {/* Timer Display - Centered with Reset on Right */}
      <View className="flex-row items-center px-2">
        {/* Left Spacer - Balances reset button on right for perfect centering */}
        <View className="w-14 ml-3" />

        {/* Timer Display - Centered */}
        <View className="flex-1 items-center">
          <Pressable
            onPress={onTimerPress}
            className={`flex-row items-center justify-center gap-3 py-3 px-6 rounded-2xl active:opacity-70 ${
              isOvertime
                ? "bg-red-100 dark:bg-red-900/30"
                : isTimerPaused
                  ? "bg-yellow-100 dark:bg-yellow-900/30"
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
              {displayTime}
            </Text>
            <Ionicons name="chevron-down" size={20} color={isDark ? "#8e8e8e" : "#6b6b6b"} />
          </Pressable>
        </View>

        {/* Reset Button - Right side */}
        <Pressable
          onPress={() => resetTimerWithDuration(targetDuration)}
          className="w-14 h-14 items-center justify-center rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated border border-light-border-medium dark:border-dark-border-medium active:opacity-70 ml-3"
        >
          <Ionicons name="refresh" size={24} color={isDark ? "#ff9f6c" : "#f4a261"} />
        </Pressable>
      </View>

      {/* Subtitle - Only show overtime or session duration */}
      <Text className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary text-center mt-2">
        {isOvertime ? "Overtime - tap to adjust" : `${targetDuration} min session`}
      </Text>
    </View>
  );
}

export const SessionHeader = memo(SessionHeaderComponent);
