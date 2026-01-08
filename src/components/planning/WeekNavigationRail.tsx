import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import { formatDate, getTodayString } from "@/core/utils/helpers";
import type { Plan } from "@/features/planning/types";

interface WeekNavigationRailProps {
  currentWeekDates: string[];
  selectedDate: string | null;
  onDaySelect: (date: string) => void;
  weekPlans: Map<string, Plan>;
}

export function WeekNavigationRail({
  currentWeekDates,
  selectedDate,
  onDaySelect,
  weekPlans,
}: WeekNavigationRailProps) {
  const todayString = getTodayString();
  const colorScheme = useColorScheme();

  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const hasOverflow = contentWidth > containerWidth + 1;

  const fadeColor = useMemo(() => {
    // Mirrors `bg-light-bg-primary` / `bg-dark-bg-primary`
    return colorScheme === "dark" ? "#0f0f0f" : "#faf4f0";
  }, [colorScheme]);

  const getDayName = (dateString: string): string => {
    return formatDate(dateString, "EEE");
  };

  const getDayNumber = (dateString: string): string => {
    return formatDate(dateString, "d");
  };

  const getAccessibilityLabel = (date: string): string => {
    const dayName = formatDate(date, "EEEE, MMMM d");
    const isTodayDate = date === todayString;
    const plan = weekPlans.get(date);

    let label = dayName;

    if (isTodayDate) {
      label += ", today";
    }

    if (plan) {
      if (plan.isRest) {
        label += ", rest day";
      } else {
        label += ", planned";
      }
    } else {
      label += ", no plan";
    }

    return label;
  };

  const shouldShowDot = (date: string): boolean => {
    const plan = weekPlans.get(date);
    return plan !== undefined && !plan.isRest;
  };

  const activeDate = selectedDate ?? todayString;

  return (
    <View
      className="relative"
      onLayout={(e) => {
        setContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={(w) => {
          setContentWidth(w);
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          flexGrow: hasOverflow ? 0 : 1,
          justifyContent: hasOverflow ? "flex-start" : "center",
        }}
        className="flex-row"
      >
        <View className="flex-row gap-1.5">
          {currentWeekDates.map((date) => {
            const isTodayDate = date === todayString;
            const isSelected = date === activeDate;
            const showDot = shouldShowDot(date);

            return (
              <Pressable
                key={date}
                onPress={() => onDaySelect(date)}
                accessibilityRole="button"
                accessibilityLabel={getAccessibilityLabel(date)}
                accessibilityHint="Tap to jump to this day"
                className="items-center"
              >
                <View className="relative items-center justify-center w-11 h-11 rounded-full mb-0.5">
                  {/* Circle */}
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center ${
                      isSelected
                        ? "bg-primary-500 dark:bg-dark-primary"
                        : isTodayDate
                          ? "border-2 border-primary-500 dark:border-dark-primary"
                          : "border-2 border-light-border-medium dark:border-dark-border-medium"
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        isSelected
                          ? "text-white dark:text-dark-bg-primary"
                          : isTodayDate
                            ? "text-primary-500 dark:text-dark-primary"
                            : "text-light-text-primary dark:text-dark-text-primary"
                      }`}
                    >
                      {getDayNumber(date)}
                    </Text>
                  </View>

                  {/* Plan dot indicator */}
                  {showDot && (
                    <View
                      className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-dark-primary"
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                      }}
                    />
                  )}
                </View>

                {/* Day name label */}
                <Text className="text-xs uppercase text-light-text-secondary dark:text-dark-text-secondary">
                  {getDayName(date)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Subtle edge fades (only when scrollable) */}
      {hasOverflow && (
        <>
          <LinearGradient
            colors={[fadeColor, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            pointerEvents="none"
            style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 24 }}
          />
          <LinearGradient
            colors={["transparent", fadeColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            pointerEvents="none"
            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 24 }}
          />
        </>
      )}
    </View>
  );
}
