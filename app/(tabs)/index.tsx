import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoutineCard } from "@/components/routines";
import { ActiveSessionBanner } from "@/components/session";
import { FreestyleCard } from "@/components/ui";
import { useTheme } from "@/core/contexts/ThemeContext";
import { getTodayString } from "@/core/utils/helpers";
import { Navigation } from "@/core/utils/navigation";
import { useHistoryStore } from "@/features/history";
import { useRoutineStore } from "@/features/routines";
import { useSessionStore } from "@/features/session";

export default function TodayScreen() {
  const { colorScheme } = useTheme();
  const { routines, loadRoutines } = useRoutineStore();
  const { getCompletedRoutineIdsForDate } = useHistoryStore();
  const insets = useSafeAreaInsets();

  // Subscribe to session store with individual selectors
  const isSessionActive = useSessionStore((state) => state.isSessionActive);
  const activeSessionId = useSessionStore((state) => state.activeSessionId);
  const isResumedFromKill = useSessionStore((state) => state.isResumedFromKill);
  const dismissResumedFromKillBanner = useSessionStore(
    (state) => state.dismissResumedFromKillBanner,
  );

  // Loading state
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true);
  const [completedRoutineIds, setCompletedRoutineIds] = useState<Set<string>>(new Set());

  // Load routines and check completion status on mount and when screen is focused
  const loadData = useCallback(async () => {
    setIsLoadingRoutines(true);
    await loadRoutines();

    // Check which routines are completed for today
    const today = getTodayString();
    const completed = await getCompletedRoutineIdsForDate(today);
    setCompletedRoutineIds(completed);

    setIsLoadingRoutines(false);
  }, [loadRoutines, getCompletedRoutineIdsForDate]);

  // Load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh completion status when returning to this screen (e.g., after completing a session)
  useFocusEffect(
    useCallback(() => {
      const refreshCompletionStatus = async () => {
        const today = getTodayString();
        const completed = await getCompletedRoutineIdsForDate(today);
        setCompletedRoutineIds(completed);
      };

      refreshCompletionStatus();
    }, [getCompletedRoutineIdsForDate]),
  );

  // Safeguard: If isSessionActive but no activeSessionId, clear session
  // This prevents showing "Workout In Progress" banner after manual end
  useEffect(() => {
    if (isSessionActive && !activeSessionId) {
      useSessionStore.getState().clearSession();
    }
  }, [isSessionActive, activeSessionId]);

  // Filter routines for today
  const todayRoutines = routines.filter((r) => r.plannedDate === getTodayString());

  // Handle starting a freestyle session (no routine)
  const handleStartFreestyle = () => {
    // If a session is active, never wipe it from Today.
    // Route to resume instead.
    if (isSessionActive) {
      Navigation.goToSession("active");
      return;
    }

    // Clear any stale session remnants before starting a new session.
    // (In-memory state is cleared synchronously; AsyncStorage cleanup happens async.)
    useSessionStore.getState().clearSession();
    Navigation.goToSession("freestyle");
  };

  // Handle starting a routine
  const handleStartRoutine = (routineId: string) => {
    // If a session is active, never wipe it from Today.
    // Route to resume instead.
    if (isSessionActive) {
      Navigation.goToSession("active");
      return;
    }

    // Clear any stale session remnants before starting a new session.
    // (In-memory state is cleared synchronously; AsyncStorage cleanup happens async.)
    useSessionStore.getState().clearSession();
    Navigation.goToSession(routineId);
  };

  // Only show banner when session was restored from app kill (not after manual end)
  // isResumedFromKill is set ONLY during rehydration when app restarts with active session
  // It's NOT persisted, so it's false for new sessions and after manual endSession()
  const shouldShowBanner = isSessionActive && activeSessionId !== null && isResumedFromKill;

  // Show loading state while routines are being fetched
  if (isLoadingRoutines) {
    return (
      <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary items-center justify-center">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pb-6" style={{ paddingTop: insets.top + 12 }}>
          <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
            Today
          </Text>
        </View>

        {/* Active Session Banner - Show when there's an active session */}
        {shouldShowBanner && <ActiveSessionBanner onDismiss={dismissResumedFromKillBanner} />}

        {/* Today's Routines - Show when banner is NOT displayed */}
        {!shouldShowBanner && todayRoutines.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
              Planned for Today
            </Text>
            <View className="gap-4">
              {todayRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onPress={() => Navigation.goToRoutine(routine.id)}
                  onStartRoutine={() => handleStartRoutine(routine.id)}
                  isCompleted={completedRoutineIds.has(routine.id)}
                  completedDate={getTodayString()}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Start Section - Show when banner is NOT displayed */}
        {!shouldShowBanner && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
              {todayRoutines.length > 0 ? "Or start freestyle" : "Start a Workout"}
            </Text>
            <FreestyleCard onPress={handleStartFreestyle} />
          </View>
        )}

        {/* Empty State when no routines planned and banner is NOT displayed */}
        {!shouldShowBanner && todayRoutines.length === 0 && (
          <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center mb-4">
              <Ionicons
                name="calendar-outline"
                size={32}
                color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
              />
            </View>
            <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 text-center">
              No routine planned
            </Text>
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center mb-4">
              Plan a routine or start a freestyle session
            </Text>
            <Pressable
              onPress={() => Navigation.goToTab("plan")}
              className="flex-row items-center gap-2 py-2 px-4 active:opacity-70"
            >
              <Text className="text-base font-semibold text-primary-500 dark:text-dark-primary">
                Go to Plan
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
              />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
