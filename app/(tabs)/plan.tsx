import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import { WeekNavigationRail } from "@/components/planning";
import { RoutineCard } from "@/components/routines";
import { useTheme } from "@/core/contexts/ThemeContext";
import { formatDate, getTodayString, getWeekDates } from "@/core/utils/helpers";
import { usePlanningStore } from "@/features/planning";
import { useRoutineStore } from "@/features/routines";

export default function PlanScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const systemColorScheme = useColorScheme();

  // State for selected date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>([]);

  // Routines store
  const { routines, loadRoutines } = useRoutineStore();

  // Planning store
  const { weekPlans, loadWeek } = usePlanningStore();

  // Load routines and plans on mount
  useEffect(() => {
    loadRoutines();
    loadWeek();
    setCurrentWeekDates(getWeekDates(new Date()));
  }, [loadRoutines, loadWeek]);

  // Week navigation handlers
  const handlePreviousWeek = () => {
    const firstDay = new Date(currentWeekDates[0]);
    firstDay.setDate(firstDay.getDate() - 7);
    const newWeekDates = getWeekDates(firstDay);
    setCurrentWeekDates(newWeekDates);
    setSelectedDate(newWeekDates[0]);
  };

  const handleNextWeek = () => {
    const firstDay = new Date(currentWeekDates[0]);
    firstDay.setDate(firstDay.getDate() + 7);
    const newWeekDates = getWeekDates(firstDay);
    setCurrentWeekDates(newWeekDates);
    setSelectedDate(newWeekDates[0]);
  };

  const handleDaySelect = (date: string) => {
    setSelectedDate(date);
  };

  // Format week range for display
  const weekRangeText =
    currentWeekDates.length > 0
      ? `${formatDate(currentWeekDates[0], "MMM d")} - ${formatDate(currentWeekDates[6], "d")}`
      : "";

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View className="px-5 pt-12 pb-3">
        <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
          Plan
        </Text>

        {/* Week Range & Navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={handlePreviousWeek}
            className="w-10 h-10 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Previous week"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={systemColorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
            />
          </Pressable>

          <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
            {weekRangeText}
          </Text>

          <Pressable
            onPress={handleNextWeek}
            className="w-10 h-10 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Next week"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={systemColorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
            />
          </Pressable>
        </View>
      </View>

      {/* Week Navigation Rail */}
      <View className="mb-4">
        <WeekNavigationRail
          currentWeekDates={currentWeekDates}
          selectedDate={selectedDate}
          onDaySelect={handleDaySelect}
          weekPlans={weekPlans}
        />
      </View>

      {/* Selected Date Display & Action Row */}
      <View className="px-5 pb-4">
        <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
          {formatDate(selectedDate, "EEEE, MMMM d")}
          {selectedDate === getTodayString() && " · Today"}
        </Text>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push(`/routines/new?date=${selectedDate}` as never)}
            className="flex-1 bg-primary-500 dark:bg-dark-primary rounded-xl py-3.5 px-4 active:opacity-70 flex-row items-center justify-center gap-2"
            accessibilityRole="button"
            accessibilityLabel="Create new routine"
          >
            <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
            <Text className="text-sm font-semibold text-white dark:text-dark-bg-primary">
              Add Routine
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              // TODO: Navigate to explore routines screen
              console.log("Explore routines");
            }}
            className="flex-1 bg-light-surface dark:bg-dark-surface border border-light-border-medium dark:border-dark-border-medium rounded-xl py-3.5 px-4 active:opacity-70 flex-row items-center justify-center gap-2"
            accessibilityRole="button"
            accessibilityLabel="Explore routines"
          >
            <Ionicons
              name="compass-outline"
              size={18}
              color={systemColorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
            />
            <Text className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
              Explore
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content - Routines */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        <View>
          {/* Filter routines for selected date */}
          {(() => {
            const filteredRoutines = routines.filter((r) => r.plannedDate === selectedDate);

            return (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                    Planned for this day
                  </Text>
                  <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    {filteredRoutines.length}{" "}
                    {filteredRoutines.length === 1 ? "routine" : "routines"}
                  </Text>
                </View>

                {filteredRoutines.length === 0 ? (
                  <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-light rounded-2xl p-8 items-center">
                    <Ionicons
                      name="barbell-outline"
                      size={48}
                      color={systemColorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
                      style={{ marginBottom: 16 }}
                    />
                    <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 text-center">
                      No routine planned
                    </Text>
                    <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center mb-6">
                      Create a routine for {formatDate(selectedDate, "MMMM d")} to plan your
                      workout.
                    </Text>
                    <Pressable
                      onPress={() => router.push(`/routines/new?date=${selectedDate}` as never)}
                      className="bg-primary-500 dark:bg-dark-primary rounded-xl py-3 px-6 active:opacity-70"
                    >
                      <Text className="text-base font-semibold text-white dark:text-dark-bg-primary">
                        Add Routine for This Day
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View className="gap-4">
                    {filteredRoutines.map((routine) => (
                      <RoutineCard
                        key={routine.id}
                        routine={routine}
                        onPress={() =>
                          router.push(`/routines/${routine.id}?date=${selectedDate}` as never)
                        }
                        onStartRoutine={() => {
                          // TODO: Implement routine start flow
                          console.log("Start routine:", routine.title);
                        }}
                      />
                    ))}
                  </View>
                )}
              </>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
}
