import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WeekNavigationRail } from "@/components/planning";
import { RoutineCard } from "@/components/routines";
import { useTheme } from "@/core/contexts/ThemeContext";
import { formatDate, getTodayString, getWeekDates } from "@/core/utils/helpers";
import { useHistoryStore } from "@/features/history";
import { useRoutineStore } from "@/features/routines";

export default function PlanScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  // State for selected date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>([]);
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true);
  const [completedRoutineIds, setCompletedRoutineIds] = useState<Set<string>>(new Set());
  const [sessionsMap, setSessionsMap] = useState<Map<string, number>>(new Map());

  // Routines store
  const { routines, loadRoutines } = useRoutineStore();
  const { getCompletedRoutineIdsForDate, getSessionsCountByDate } = useHistoryStore();

  // Load routines on mount
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoadingRoutines(true);
      await loadRoutines();
      if (isMounted) {
        setCurrentWeekDates(getWeekDates(new Date()));

        // Load completion status for today
        const today = getTodayString();
        const completed = await getCompletedRoutineIdsForDate(today);
        setCompletedRoutineIds(completed);

        setIsLoadingRoutines(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [loadRoutines, getCompletedRoutineIdsForDate]);

  // Load sessions count for week (for day indicators)
  useEffect(() => {
    const loadSessionsForWeek = async () => {
      if (currentWeekDates.length === 0) return;

      const sessionsCount = await getSessionsCountByDate(currentWeekDates[0], currentWeekDates[6]);

      setSessionsMap(sessionsCount);
    };

    if (!isLoadingRoutines) {
      loadSessionsForWeek();
    }
  }, [currentWeekDates, isLoadingRoutines, getSessionsCountByDate]);

  // Load completion status when selected date changes
  useEffect(() => {
    const loadCompletionStatus = async () => {
      const completed = await getCompletedRoutineIdsForDate(selectedDate);
      setCompletedRoutineIds(completed);
    };

    if (!isLoadingRoutines) {
      loadCompletionStatus();
    }
  }, [selectedDate, getCompletedRoutineIdsForDate, isLoadingRoutines]);

  // Week navigation handlers (memoized for performance)
  const handlePreviousWeek = useCallback(() => {
    if (currentWeekDates.length === 0) return;
    // Parse ISO date safely using date-fns parseISO to avoid timezone issues
    const firstDayStr = currentWeekDates[0];
    const firstDay = new Date(`${firstDayStr}T12:00:00`); // Add time to ensure local parsing
    firstDay.setDate(firstDay.getDate() - 7);
    const newWeekDates = getWeekDates(firstDay);
    setCurrentWeekDates(newWeekDates);
    setSelectedDate(newWeekDates[0]);
  }, [currentWeekDates]);

  const handleNextWeek = useCallback(() => {
    if (currentWeekDates.length === 0) return;
    // Parse ISO date safely using date-fns parseISO to avoid timezone issues
    const firstDayStr = currentWeekDates[0];
    const firstDay = new Date(`${firstDayStr}T12:00:00`); // Add time to ensure local parsing
    firstDay.setDate(firstDay.getDate() + 7);
    const newWeekDates = getWeekDates(firstDay);
    setCurrentWeekDates(newWeekDates);
    setSelectedDate(newWeekDates[0]);
  }, [currentWeekDates]);

  const handleDaySelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  // Format week range for display (memoized)
  const weekRangeText = useMemo(
    () =>
      currentWeekDates.length > 0
        ? `${formatDate(currentWeekDates[0], "MMM d")} - ${formatDate(currentWeekDates[6], "d")}`
        : "",
    [currentWeekDates],
  );

  // Calculate routines map for week navigation (memoized)
  const routinesMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const routine of routines) {
      if (routine.plannedDate) {
        const count = map.get(routine.plannedDate) || 0;
        map.set(routine.plannedDate, count + 1);
      }
    }
    return map;
  }, [routines]);

  // Filter routines for selected date (memoized)
  const filteredRoutines = useMemo(
    () => routines.filter((r) => r.plannedDate === selectedDate),
    [routines, selectedDate],
  );

  // Count completed routines for selected date (memoized)
  const completedCount = useMemo(() => {
    return filteredRoutines.filter((r) => completedRoutineIds.has(r.id)).length;
  }, [filteredRoutines, completedRoutineIds]);

  const isToday = selectedDate === getTodayString();

  // Handler for starting a routine
  const handleStartRoutine = useCallback(
    async (routineId: string) => {
      try {
        // Navigate to session start with routine ID
        router.push(`/session/${routineId}` as never);
      } catch (_error) {
        Alert.alert("Error", "Failed to start routine. Please try again.");
      }
    },
    [router],
  );

  // Handler for deleting a routine
  const handleDeleteRoutine = useCallback(
    async (routineId: string) => {
      Alert.alert(
        "Delete Routine",
        "Are you sure you want to delete this routine? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await useRoutineStore.getState().deleteRoutine(routineId);
                // Reload routines to update UI
                await loadRoutines();
              } catch (_error) {
                Alert.alert("Error", "Failed to delete routine. Please try again.");
              }
            },
          },
        ],
      );
    },
    [loadRoutines],
  );

  // Show loading state while routines are being fetched
  if (isLoadingRoutines) {
    return (
      <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary items-center justify-center">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary">
          Loading routines...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={ colorScheme === "dark" ? "light" : "dark" } />

      {/* Header */ }
      <View className="" style={ { paddingTop: insets.top + 12 } }>
        <Text className="text-3xl px-5 pb-3 font-bold text-light-text-primary dark:text-dark-text-primary">
          Plan
        </Text>
      </View>

      {/* Week Range & Navigation */ }
      <View className="px-5 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={ handlePreviousWeek }
            android_ripple={ { color: "rgba(244, 162, 97, 0.3)", radius: 22 } }
            className="min-w-11 min-h-11 w-11 h-11 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium items-center justify-center active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Previous week"
            accessibilityHint="Navigate to the previous week"
            hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
          >
            <Ionicons
              name="chevron-back"
              size={ 20 }
              color={ colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
              accessible={ false }
            />
          </Pressable>

          <Text className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            { weekRangeText }
          </Text>

          <Pressable
            onPress={ handleNextWeek }
            android_ripple={ { color: "rgba(244, 162, 97, 0.3)", radius: 22 } }
            className="min-w-11 min-h-11 w-11 h-11 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium items-center justify-center active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Next week"
            accessibilityHint="Navigate to the next week"
            hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
          >
            <Ionicons
              name="chevron-forward"
              size={ 20 }
              color={ colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
              accessible={ false }
            />
          </Pressable>
        </View>
      </View>

      {/* Week Navigation Rail */ }
      <View className="mb-6">
        <WeekNavigationRail
          currentWeekDates={ currentWeekDates }
          selectedDate={ selectedDate }
          onDaySelect={ handleDaySelect }
          routinesMap={ routinesMap }
          sessionsMap={ sessionsMap }
        />
      </View>

      {/* Main Content - Routines */ }
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={ false }
        contentContainerStyle={ { paddingHorizontal: 20, paddingBottom: 100 } }
      >
        <View>
          {/* Section Header */ }
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                { isToday ? "Planned for today" : formatDate(selectedDate, "EEEE, MMMM d") }
              </Text>
              <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                { filteredRoutines.length === 0
                  ? "No routines planned"
                  : completedCount > 0
                    ? `${filteredRoutines.length} ${filteredRoutines.length === 1 ? "routine" : "routines"} • ${completedCount} completed`
                    : `${filteredRoutines.length} ${filteredRoutines.length === 1 ? "routine" : "routines"}` }
              </Text>
            </View>
            { filteredRoutines.length > 0 && (
              <Pressable
                onPress={ () => router.push(`/routines/new?date=${selectedDate}` as never) }
                android_ripple={ { color: "rgba(255, 255, 255, 0.3)" } }
                className="bg-primary-500 dark:bg-dark-primary rounded-xl py-2.5 px-5 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Create routine"
                accessibilityHint={ `Create a new routine for ${formatDate(selectedDate, "EEEE, MMMM d")}` }
                hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
              >
                <Text className="text-sm font-semibold text-white dark:text-dark-bg-primary">
                  Create
                </Text>
              </Pressable>
            ) }
          </View>

          { filteredRoutines.length === 0 ? (
            <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-8 items-center">
              <Ionicons
                name="calendar-outline"
                size={ 48 }
                color={ colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5" }
                style={ { marginBottom: 16 } }
                accessible={ false }
              />
              <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 text-center">
                No routine planned
              </Text>
              <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center mb-6 px-4">
                Create a routine to plan your workout for this day.
              </Text>
              <Pressable
                onPress={ () => router.push(`/routines/new?date=${selectedDate}` as never) }
                android_ripple={ { color: "rgba(255, 255, 255, 0.3)" } }
                className="min-h-11 bg-primary-500 dark:bg-dark-primary rounded-xl py-3 px-6 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Create routine"
                accessibilityHint={ `Create a new routine for ${formatDate(selectedDate, "EEEE, MMMM d")}` }
                hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
              >
                <Text className="text-base font-semibold text-white dark:text-dark-bg-primary">
                  Create Routine
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-4 shadow-sm dark:shadow-dark-sm">
              <View className="gap-3">
                { filteredRoutines.map((routine, index) => (
                  <View key={ routine.id }>
                    <RoutineCard
                      routine={ routine }
                      onPress={ () => router.push(`/routines/${routine.id}` as never) }
                      onStartRoutine={ () => handleStartRoutine(routine.id) }
                      onDelete={ () => handleDeleteRoutine(routine.id) }
                      isCompleted={ completedRoutineIds.has(routine.id) }
                      completedDate={ selectedDate }
                    />
                    { index < filteredRoutines.length - 1 && (
                      <View className="h-[1px] bg-light-border-light dark:bg-dark-border-light mt-3" />
                    ) }
                  </View>
                )) }
              </View>
            </View>
          ) }
        </View>
      </ScrollView>
    </View>
  );
}
