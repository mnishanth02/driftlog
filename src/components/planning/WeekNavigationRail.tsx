import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";
import { formatDate, getTodayString } from "@/core/utils/helpers";

interface WeekNavigationRailProps {
  currentWeekDates: string[];
  selectedDate: string | null;
  onDaySelect: (date: string) => void;
  routinesMap: Map<string, number>; // Map of date -> routine count
  sessionsMap: Map<string, number>; // Map of date -> completed session count
}

export function WeekNavigationRail({
  currentWeekDates,
  selectedDate,
  onDaySelect,
  routinesMap,
  sessionsMap,
}: WeekNavigationRailProps) {
  const todayString = getTodayString();
  const { colorScheme } = useTheme();

  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const hasOverflow = contentWidth > containerWidth + 1;

  const fadeColor = useMemo(() => {
    // Mirrors `bg-light-bg-primary` / `bg-dark-bg-primary`
    return colorScheme === "dark" ? "#0f0f0f" : "#faf4f0";
  }, [colorScheme]);

  const getDayName = (dateString: string): string => {
    return formatDate(dateString, "EEE").toUpperCase();
  };

  const getDayNumber = (dateString: string): string => {
    return formatDate(dateString, "d");
  };

  const getAccessibilityLabel = (date: string): string => {
    const dayName = formatDate(date, "EEEE, MMMM d");
    const isTodayDate = date === todayString;
    const routineCount = routinesMap.get(date) || 0;
    const sessionCount = sessionsMap.get(date) || 0;

    let label = dayName;

    if (isTodayDate) {
      label += ", today";
    }

    if (routineCount > 0) {
      label += `, ${routineCount} ${routineCount === 1 ? "routine" : "routines"} planned`;
    }

    if (sessionCount > 0) {
      label += `, ${sessionCount} ${sessionCount === 1 ? "session" : "sessions"} completed`;
    }

    if (routineCount === 0 && sessionCount === 0) {
      label += ", no activity";
    }

    return label;
  };

  const hasRoutine = (date: string): boolean => {
    const routineCount = routinesMap.get(date) || 0;
    return routineCount > 0;
  };

  const hasSession = (date: string): boolean => {
    const sessionCount = sessionsMap.get(date) || 0;
    return sessionCount > 0;
  };

  const activeDate = selectedDate ?? todayString;

  return (
    <View
      className="relative"
      onLayout={ (e) => {
        setContainerWidth(e.nativeEvent.layout.width);
      } }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={ false }
        onContentSizeChange={ (w) => {
          setContentWidth(w);
        } }
        contentContainerStyle={ {
          paddingHorizontal: 16,
          flexGrow: hasOverflow ? 0 : 1,
          justifyContent: hasOverflow ? "flex-start" : "center",
        } }
        className="flex-row"
      >
        <View className="flex-row gap-2.5">
          { currentWeekDates.map((date) => {
            const isTodayDate = date === todayString;
            const isSelected = date === activeDate;
            const showRoutineDot = hasRoutine(date);
            const showSessionDot = hasSession(date);

            return (
              <View key={ date } className="items-center">
                {/* Day Name Label (at top) */ }
                <Text className="text-xs font-medium uppercase text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                  { getDayName(date) }
                </Text>

                {/* Date Circle */ }
                <Pressable
                  onPress={ () => onDaySelect(date) }
                  accessibilityRole="button"
                  accessibilityLabel={ getAccessibilityLabel(date) }
                  accessibilityHint="Tap to jump to this day"
                >
                  <View
                    className={ `relative min-w-11 min-h-11 w-12 h-12 rounded-full items-center justify-center ${isSelected
                      ? "bg-primary-500 dark:bg-dark-primary"
                      : isTodayDate
                        ? "bg-light-surface dark:bg-dark-surface border-2 border-primary-500 dark:border-dark-primary"
                        : "bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium"
                      }` }
                  >
                    <Text
                      className={ `text-base font-semibold ${isSelected
                        ? "text-white dark:text-dark-bg-primary"
                        : isTodayDate
                          ? "text-primary-500 dark:text-dark-primary"
                          : "text-light-text-primary dark:text-dark-text-primary"
                        }` }
                    >
                      { getDayNumber(date) }
                    </Text>

                    {/* Activity Indicator Dot */ }
                    { (showSessionDot || showRoutineDot) && (
                      <View
                        style={ {
                          position: "absolute",
                          bottom: 8,
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: showSessionDot
                            ? (colorScheme === "dark" ? "#10b981" : "#10b981")
                            : isSelected
                              ? "#ffffff"
                              : (colorScheme === "dark" ? "#ff9f6c" : "#f4a261"),
                          shadowColor: showSessionDot ? "#10b981" : "#f4a261",
                          shadowOpacity: 0.4,
                          shadowRadius: 3,
                          shadowOffset: { width: 0, height: 1 },
                          elevation: 3,
                        } }
                      />
                    ) }
                  </View>
                </Pressable>
              </View>
            );
          }) }
        </View>
      </ScrollView>

      {/* Subtle edge fades (only when scrollable) */ }
      { hasOverflow && (
        <>
          <LinearGradient
            colors={ [fadeColor, "transparent"] }
            start={ { x: 0, y: 0 } }
            end={ { x: 1, y: 0 } }
            pointerEvents="none"
            style={ { position: "absolute", left: 0, top: 0, bottom: 0, width: 24 } }
          />
          <LinearGradient
            colors={ ["transparent", fadeColor] }
            start={ { x: 0, y: 0 } }
            end={ { x: 1, y: 0 } }
            pointerEvents="none"
            style={ { position: "absolute", right: 0, top: 0, bottom: 0, width: 24 } }
          />
        </>
      ) }
    </View>
  );
}
