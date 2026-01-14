import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Card } from "@/components/ui";
import { useTheme } from "@/core/contexts/ThemeContext";
import { DATE_FORMATS, formatDate, formatElapsedTime } from "@/core/utils/helpers";

interface SessionMetadataProps {
  date: string;
  startTime: string;
  endTime: string | null;
  planTitle: string | null;
}

export function SessionMetadata({ date, startTime, endTime, planTitle }: SessionMetadataProps) {
  const { colorScheme } = useTheme();

  // Calculate duration if session has ended
  const duration =
    endTime && startTime
      ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
      : null;

  return (
    <Card className="mb-6">
      <View className="gap-3">
        {/* Date */}
        <View className="flex-row items-center gap-3">
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
          />
          <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            {formatDate(date, DATE_FORMATS.FULL_DATE)}
          </Text>
        </View>

        {/* Start Time */}
        <View className="flex-row items-center gap-3">
          <Ionicons
            name="time-outline"
            size={20}
            color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
          />
          <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Started: {formatDate(startTime, DATE_FORMATS.TIME_12H)}
          </Text>
        </View>

        {/* Duration */}
        {duration ? (
          <View className="flex-row items-center gap-3">
            <Ionicons
              name="timer-outline"
              size={20}
              color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
            />
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Duration: {formatElapsedTime(duration)}
            </Text>
          </View>
        ) : null}

        {/* Routine (if linked) */}
        {planTitle ? (
          <View className="flex-row items-center gap-3">
            <Ionicons
              name="barbell-outline"
              size={20}
              color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
            />
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Routine: {planTitle}
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
