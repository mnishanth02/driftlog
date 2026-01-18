import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, Text, View } from "react-native";
import { calculateElapsedSeconds, formatElapsedTime } from "@/core/utils/helpers";
import { Navigation } from "@/core/utils/navigation";
import { useSessionStore } from "@/features/session";

interface ActiveSessionBannerProps {
  onDismiss: () => void; // Called after user takes action (resume or end)
}

export function ActiveSessionBanner({ onDismiss }: ActiveSessionBannerProps) {
  const activeSessionId = useSessionStore((state) => state.activeSessionId);
  const currentRoutineTitle = useSessionStore((state) => state.currentRoutineTitle);
  const sessionStartTime = useSessionStore((state) => state.sessionStartTime);
  const accumulatedPausedTime = useSessionStore((state) => state.accumulatedPausedTime);
  const endSession = useSessionStore((state) => state.endSession);

  // Calculate elapsed time
  const elapsedSeconds = sessionStartTime
    ? calculateElapsedSeconds(sessionStartTime, accumulatedPausedTime)
    : 0;
  const elapsedTime = formatElapsedTime(elapsedSeconds);

  const handleResume = () => {
    onDismiss(); // Clear banner state first
    if (!activeSessionId) return;
    // Resume via the special route; session screen will render the existing in-memory session.
    Navigation.goToSession("active");
  };

  const handleEndWorkout = () => {
    Alert.alert(
      "End Workout?",
      "Are you sure you want to end this workout? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "End Workout",
          style: "destructive",
          onPress: async () => {
            await endSession();
            onDismiss(); // Clear banner state after ending
          },
        },
      ],
    );
  };

  return (
    <View
      className="bg-primary-500 dark:bg-dark-primary rounded-2xl p-5 mb-6 border-2 border-primary-600 dark:border-dark-primary-dark shadow-md"
      style={{ elevation: 4 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="fitness-outline" size={18} color="#ffffff" accessible={false} />
          </View>
          <Text className="text-base font-bold text-white">Active Workout</Text>
        </View>
        <View className="bg-white/20 rounded-full px-3 py-1">
          <Text className="text-xs font-semibold text-white">{elapsedTime}</Text>
        </View>
      </View>

      {/* Routine Info */}
      {currentRoutineTitle && (
        <Text className="text-sm text-white/90 mb-4">{currentRoutineTitle}</Text>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <Pressable
          onPress={handleResume}
          android_ripple={{ color: "rgba(244, 162, 97, 0.3)" }}
          className="flex-1 bg-white rounded-xl py-3 px-4 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Resume workout"
          accessibilityHint="Continue your active workout session"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-base font-bold text-primary-500 dark:text-dark-primary text-center">
            Resume Workout
          </Text>
        </Pressable>
        <Pressable
          onPress={handleEndWorkout}
          android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}
          className="bg-white/20 rounded-xl py-3 px-4 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="End workout"
          accessibilityHint="Stop and save your workout session"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle-outline" size={24} color="#ffffff" accessible={false} />
        </Pressable>
      </View>

      {/* Info Note */}
      <Text className="text-xs text-white/70 mt-3 text-center">
        Your workout was paused while the app was closed
      </Text>
    </View>
  );
}
