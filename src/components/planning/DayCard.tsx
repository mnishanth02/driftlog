import { isToday, parseISO } from "date-fns";
import { Pressable, Text, View } from "react-native";
import { formatDate } from "@/core/utils/helpers";
import type { Plan } from "@/features/planning/types";

interface DayCardProps {
  date: string; // YYYY-MM-DD
  plan: Plan | undefined;
  onPress: () => void;
}

export function DayCard({ date, plan, onPress }: DayCardProps) {
  const dateObj = parseISO(date);
  const isTodayDate = isToday(dateObj);

  // Format: "Mon" and "Jan 13"
  const dayName = formatDate(date, "EEE");
  const dateDisplay = formatDate(date, "MMM d");

  return (
    <Pressable
      onPress={onPress}
      className={`
        bg-light-surface dark:bg-dark-surface 
        rounded-xl p-4 
        border-2 
        ${
          isTodayDate
            ? "border-primary-500 dark:border-dark-primary"
            : "border-light-border-light dark:border-dark-border-light"
        }
        active:opacity-70
      `}
      style={{ minHeight: 88, maxHeight: 100 }} // Constrained height prevents layout shifts
    >
      {/* Horizontal Layout: Date on left, Plan on right */}
      <View className="flex-row gap-3">
        {/* Left Section: Date - Fixed width */}
        <View style={{ width: 85 }} className="justify-center">
          <Text
            className={`text-xs font-bold mb-1 tracking-wide ${
              isTodayDate
                ? "text-primary-500 dark:text-dark-primary"
                : "text-light-text-secondary dark:text-dark-text-secondary"
            }`}
          >
            {dayName.toUpperCase()}
          </Text>
          <Text
            className={`text-lg ${
              isTodayDate
                ? "text-primary-500 dark:text-dark-primary font-bold"
                : "text-light-text-primary dark:text-dark-text-primary font-semibold"
            }`}
          >
            {dateDisplay}
          </Text>
        </View>

        {/* Right Section: Plan Details - Flexible width */}
        <View className="flex-1 justify-center">
          {plan ? (
            <View className="gap-1">
              {/* Title with Dot Indicator */}
              <View className="flex-row items-start justify-between gap-2">
                <Text
                  numberOfLines={2}
                  className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary flex-1"
                >
                  {plan.title}
                </Text>
                <View className="bg-primary-500 dark:bg-dark-primary rounded-full w-2 h-2 mt-1 shrink-0" />
              </View>

              {/* Notes - Limited to 3 lines */}
              {plan.notes && (
                <Text
                  numberOfLines={3}
                  className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary leading-relaxed"
                >
                  {plan.notes}
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary italic">
              Tap to plan
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
