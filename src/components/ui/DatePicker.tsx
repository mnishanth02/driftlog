import { Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { useTheme } from "@/core/contexts/ThemeContext";
import { getTodayString } from "@/core/utils/helpers";
import { BottomSheet } from "./BottomSheet";

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate?: string;
  title?: string;
  description?: string;
}

export function DatePicker({
  visible,
  onClose,
  onSelect,
  selectedDate,
  title = "Select Date",
  description,
}: DatePickerProps) {
  const { colorScheme } = useTheme();

  const handleDayPress = (day: DateData) => {
    onSelect(day.dateString);
    onClose();
  };

  return (
    <BottomSheet visible={ visible } onClose={ onClose } title={ title }>
      <View className="pb-6">
        { description && (
          <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center mb-4 px-2">
            { description }
          </Text>
        ) }
        <Calendar
          current={ selectedDate || getTodayString() }
          onDayPress={ handleDayPress }
          markedDates={
            selectedDate
              ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: colorScheme === "dark" ? "#ff9f6c" : "#f4a261",
                },
              }
              : undefined
          }
          theme={ {
            backgroundColor: colorScheme === "dark" ? "#252525" : "#ffffff",
            calendarBackground: colorScheme === "dark" ? "#252525" : "#ffffff",
            textSectionTitleColor: colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b",
            selectedDayBackgroundColor: colorScheme === "dark" ? "#ff9f6c" : "#f4a261",
            selectedDayTextColor: "#ffffff",
            todayTextColor: colorScheme === "dark" ? "#ff9f6c" : "#f4a261",
            dayTextColor: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
            textDisabledColor: colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4",
            monthTextColor: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
            arrowColor: colorScheme === "dark" ? "#ff9f6c" : "#f4a261",
          } }
        />
      </View>
    </BottomSheet>
  );
}
