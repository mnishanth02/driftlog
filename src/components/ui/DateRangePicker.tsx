import { endOfMonth, format, startOfMonth, subDays, subMonths } from "date-fns";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { useTheme } from "@/core/contexts/ThemeContext";
import { getTodayString } from "@/core/utils/helpers";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

type PeriodMarkedDate = {
  startingDay?: boolean;
  endingDay?: boolean;
  color?: string;
  textColor?: string;
};

type MarkedDates = Record<string, PeriodMarkedDate>;

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  onClear?: () => void;
}

export function DateRangePicker({ visible, onClose, onApply, onClear }: DateRangePickerProps) {
  const { colorScheme } = useTheme();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const primaryColor = colorScheme === "dark" ? "#ff9f6c" : "#f4a261";

  // Reset state when modal closes to prevent stale selections
  useEffect(() => {
    if (!visible) {
      setStartDate(null);
      setEndDate(null);
    }
  }, [visible]);

  const dateToString = (date: Date) => format(date, "yyyy-MM-dd");

  const applyRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    onApply(start, end);
    onClose();
    setStartDate(null);
    setEndDate(null);
  };

  const handleDayPress = (day: DateData) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(day.dateString);
      setEndDate(null);
    } else {
      // Complete range
      if (day.dateString < startDate) {
        // Pressed earlier date - swap
        setEndDate(startDate);
        setStartDate(day.dateString);
      } else {
        setEndDate(day.dateString);
      }
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
      onClose();
      // Reset for next use
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleCancel = () => {
    setStartDate(null);
    setEndDate(null);
    onClose();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onClear?.();
    onClose();
  };

  // Generate marked dates for calendar
  const markedDates: MarkedDates = {};

  if (startDate) {
    markedDates[startDate] = {
      startingDay: true,
      color: primaryColor,
      textColor: "white",
    };
  }

  if (endDate) {
    markedDates[endDate] = {
      endingDay: true,
      color: primaryColor,
      textColor: "white",
    };

    // Mark dates in between
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateString = current.toISOString().split("T")[0];
        markedDates[dateString] = {
          color: primaryColor,
          textColor: "white",
        };
        current.setDate(current.getDate() + 1);
      }
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleCancel} title="Select Date Range">
      <View className="pb-6 gap-4">
        <View className="flex-row flex-wrap gap-2 px-2">
          <Button
            title="Last 7 days"
            variant="secondary"
            onPress={() => {
              const end = new Date();
              const start = subDays(end, 6);
              applyRange(dateToString(start), dateToString(end));
            }}
            className="flex-1"
          />
          <Button
            title="Last 30 days"
            variant="secondary"
            onPress={() => {
              const end = new Date();
              const start = subDays(end, 29);
              applyRange(dateToString(start), dateToString(end));
            }}
            className="flex-1"
          />
          <Button
            title="This month"
            variant="secondary"
            onPress={() => {
              const now = new Date();
              applyRange(dateToString(startOfMonth(now)), dateToString(endOfMonth(now)));
            }}
            className="flex-1"
          />
          <Button
            title="Last month"
            variant="secondary"
            onPress={() => {
              const lastMonth = subMonths(new Date(), 1);
              applyRange(
                dateToString(startOfMonth(lastMonth)),
                dateToString(endOfMonth(lastMonth)),
              );
            }}
            className="flex-1"
          />
        </View>

        <Calendar
          current={getTodayString()}
          onDayPress={handleDayPress}
          markingType="period"
          markedDates={markedDates}
          theme={{
            backgroundColor: colorScheme === "dark" ? "#252525" : "#ffffff",
            calendarBackground: colorScheme === "dark" ? "#252525" : "#ffffff",
            textSectionTitleColor: colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b",
            selectedDayBackgroundColor: primaryColor,
            selectedDayTextColor: "#ffffff",
            todayTextColor: primaryColor,
            dayTextColor: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
            textDisabledColor: colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4",
            monthTextColor: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
            arrowColor: primaryColor,
          }}
        />

        <View className="gap-3 px-2">
          <Button
            title={
              startDate && endDate ? `Apply (${startDate} to ${endDate})` : "Select date range"
            }
            onPress={handleApply}
            variant="primary"
            disabled={!startDate || !endDate}
          />
          {onClear && <Button title="Clear filter" onPress={handleClear} variant="secondary" />}
          <Button title="Cancel" onPress={handleCancel} variant="ghost" />
        </View>
      </View>
    </BottomSheet>
  );
}
