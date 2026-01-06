import { Ionicons } from "@expo/vector-icons";
import { addWeeks, subWeeks } from "date-fns";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import { DayCard, PlanEditor } from "@/components/planning";
import { useTheme } from "@/core/contexts/ThemeContext";
import { formatDate, getWeekOffset } from "@/core/utils/helpers";
import { usePlanningStore } from "@/features/planning";

export default function PlanScreen() {
  const { colorScheme } = useTheme();
  const systemColorScheme = useColorScheme();
  const { weekPlans, currentWeekDates, isLoading, loadWeek } = usePlanningStore();

  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Load week on mount and when week changes
  useEffect(() => {
    loadWeek(currentWeekStart);
  }, [currentWeekStart, loadWeek]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedDate(null);
  };

  const handleGoToToday = () => {
    setCurrentWeekStart(new Date());
  };

  // Calculate week offset and determine display
  const weekOffset = getWeekOffset(currentWeekStart);
  const isCurrentWeek = weekOffset === 0;

  // Determine week label
  const getWeekLabel = () => {
    if (weekOffset === 0) return "This Week";
    if (weekOffset === -1) return "Previous Week";
    if (weekOffset === 1) return "Next Week";
    // For all other weeks, show dates
    if (currentWeekDates.length > 0) {
      return `${formatDate(currentWeekDates[0], "MMM d")} - ${formatDate(currentWeekDates[6], "d")}`;
    }
    return "";
  };

  const weekLabel = getWeekLabel();

  // Show date range below label for current/previous/next week
  const showDateRange = weekOffset >= -1 && weekOffset <= 1;
  const dateRangeDisplay =
    currentWeekDates.length > 0
      ? `${formatDate(currentWeekDates[0], "MMM d")} - ${formatDate(currentWeekDates[6], "d")}`
      : "";

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView
        className="flex-1 px-4 pt-12"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="mb-5">
          <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mt-2">
            Weekly Plan
          </Text>
        </View>

        {/* Week Navigation - Fixed height to prevent layout shifts */}
        <View className="mb-5">
          {/* Navigation Row - Fixed height keeps arrows centered */}
          <View
            style={{
              height: 60,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            {/* Previous Week Button */}
            <Pressable
              onPress={handlePreviousWeek}
              className="w-11 h-11 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium active:opacity-70"
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={systemColorScheme === "dark" ? "#f5f5f5" : "#2b2b2b"}
              />
            </Pressable>

            {/* Week Label Display - Min width prevents truncation */}
            <View
              style={{
                flex: 1,
                minWidth: 180,
                alignItems: "center",
              }}
            >
              <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                {weekLabel}
              </Text>
              {showDateRange && (
                <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                  {dateRangeDisplay}
                </Text>
              )}
            </View>

            {/* Next Week Button */}
            <Pressable
              onPress={handleNextWeek}
              className="w-11 h-11 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium active:opacity-70"
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={systemColorScheme === "dark" ? "#f5f5f5" : "#2b2b2b"}
              />
            </Pressable>
          </View>

          {/* Button Area - Fixed height prevents layout shift */}
          <View className="items-center justify-center">
            {!isCurrentWeek && (
              <Pressable
                onPress={handleGoToToday}
                className="px-4 py-2 rounded-full bg-primary-500 dark:bg-dark-primary active:opacity-70"
              >
                <Text className="text-sm font-semibold text-white dark:text-dark-bg-primary">
                  Back to This Week
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator
              size="large"
              color={systemColorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
            />
          </View>
        ) : (
          /* Weekly Calendar Grid */
          <View className="gap-3">
            {currentWeekDates.map((date: string) => (
              <DayCard
                key={date}
                date={date}
                plan={weekPlans.get(date)}
                onPress={() => handleDayPress(date)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Plan Editor Modal */}
      {selectedDate && (
        <PlanEditor visible={showEditor} onClose={handleCloseEditor} date={selectedDate} />
      )}
    </View>
  );
}
