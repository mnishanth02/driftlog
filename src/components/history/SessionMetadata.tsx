import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";
import {
  calculateSessionDuration,
  DATE_FORMATS,
  formatDate,
  formatElapsedTime,
} from "@/core/utils/helpers";

interface SessionMetadataProps {
  date: string;
  startTime: string;
  endTime: string | null;
  planTitle: string | null;
}

export function SessionMetadata({ date, startTime, endTime, planTitle }: SessionMetadataProps) {
  const { colorScheme } = useTheme();

  // Calculate duration intelligently (handles null endTime)
  const duration = calculateSessionDuration(startTime, endTime);
  const isDurationEstimated = !endTime && duration !== null;

  return (
    <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-xl p-3 mb-4">
      {/* Date and Duration Row */}
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
          {formatDate(date, DATE_FORMATS.SHORT_DATE)}
        </Text>
        {duration !== null && (
          <View className="bg-primary-500/10 dark:bg-dark-primary/10 rounded-lg px-2 py-0.5">
            <Text className="text-primary-500 dark:text-dark-primary text-[10px] font-bold">
              {formatElapsedTime(duration)}
            </Text>
          </View>
        )}
      </View>

      {/* Metadata Row */}
      <View className="flex-row items-center flex-wrap gap-y-1">
        <View className="flex-row items-center mr-3">
          <Ionicons
            name="time-outline"
            size={12}
            color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
            style={{ marginRight: 3 }}
          />
          <Text className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
            {formatDate(startTime, DATE_FORMATS.TIME_12H)}
          </Text>
        </View>

        {planTitle && (
          <View className="flex-row items-center">
            <Ionicons
              name="barbell-outline"
              size={12}
              color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
              style={{ marginRight: 3 }}
            />
            <Text className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
              {planTitle}
            </Text>
          </View>
        )}
      </View>

      {/* Warning for estimated duration (compact) */}
      {isDurationEstimated && (
        <View className="mt-1.5 pt-1.5 border-t border-light-border-light dark:border-dark-border-medium flex-row items-center gap-1.5">
          <Ionicons name="information-circle-outline" size={10} color="#f59e0b" />
          <Text className="text-[9px] text-warning flex-1 italic">
            Estimated duration (session wasn't ended)
          </Text>
        </View>
      )}
    </View>
  );
}
