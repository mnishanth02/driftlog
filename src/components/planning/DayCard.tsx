import { isToday, parseISO } from "date-fns";
import { Pressable, Text, View } from "react-native";
import { formatDate } from "@/core/utils/helpers";
import type { Plan } from "@/features/planning/types";

interface DayCardProps {
  date: string;
  plan: Plan | undefined;
  onPress: () => void;
  isFocused?: boolean;
}

export function DayCard({ date, plan, onPress, isFocused = false }: DayCardProps) {
  const dateObj = parseISO(date);
  const isTodayDate = isToday(dateObj);

  // Format: "MON" and "5"
  const dayName = formatDate(date, "EEE").toUpperCase();
  const dayNumber = formatDate(date, "d");

  // Accessibility label
  const accessibilityLabel = `${formatDate(date, "EEEE, MMMM d")}${isTodayDate ? ", today" : ""}${
    plan ? (plan.isRest ? ", rest day" : ", planned") : ", no plan"
  }`;

  const emphasizeDate = isTodayDate || isFocused;

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-70"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Tap to edit plan for this day"
    >
      {/* Left accent bar for today */}
      {isTodayDate && (
        <View
          className="bg-primary-500 dark:bg-dark-primary"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
          }}
        />
      )}

      {/* Horizontal row layout */}
      <View className="flex-row gap-4 py-4 px-4">
        {/* Left Section: Date (64px fixed width) */}
        <View style={{ width: 64 }}>
          <Text
            className={`text-xs mb-1 ${
              emphasizeDate
                ? "font-bold text-primary-500 dark:text-dark-primary"
                : "font-semibold text-light-text-secondary dark:text-dark-text-secondary"
            }`}
          >
            {dayName}
          </Text>
          <Text
            className={`text-lg ${
              emphasizeDate
                ? "font-bold text-primary-500 dark:text-dark-primary"
                : "font-semibold text-light-text-primary dark:text-dark-text-primary"
            }`}
          >
            {dayNumber}
          </Text>
          {isTodayDate && (
            <Text className="text-xs font-semibold text-primary-500 dark:text-dark-primary mt-1">
              TODAY
            </Text>
          )}
        </View>

        {/* Right Section: Content */}
        <View className="flex-1 justify-center">
          {plan ? (
            plan.isRest ? (
              <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Rest
              </Text>
            ) : (
              <View className="bg-light-bg-cream dark:bg-dark-bg-elevated rounded-md p-3">
                <Text
                  numberOfLines={2}
                  className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary"
                >
                  {plan.title}
                </Text>
                {plan.notes && (
                  <Text
                    numberOfLines={3}
                    className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary leading-relaxed mt-1"
                  >
                    {plan.notes}
                  </Text>
                )}
              </View>
            )
          ) : (
            <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
              Add intent
            </Text>
          )}
        </View>
      </View>

      {/* Inset divider */}
      <View
        className="h-px bg-light-border-light dark:bg-dark-border-light"
        style={{ marginLeft: 16, marginRight: 16 }}
      />
    </Pressable>
  );
}
