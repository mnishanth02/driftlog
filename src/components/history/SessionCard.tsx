import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";
import { calculateSessionDuration, formatDate, formatElapsedTime } from "@/core/utils/helpers";
import type { HistorySession } from "@/features/history";

interface SessionCardProps {
  session: HistorySession;
  onPress: () => void;
}

function SessionCardComponent({ session, onPress }: SessionCardProps) {
  const { colorScheme } = useTheme();

  // Calculate duration intelligently (handles null endTime)
  const duration = calculateSessionDuration(session.startTime, session.endTime);

  return (
    <Pressable
      onPress={ onPress }
      android_ripple={ { color: "rgba(244, 162, 97, 0.3)" } }
      style={ {
        backgroundColor: colorScheme === "dark" ? "#252525" : "#ffffff",
        borderWidth: 1,
        borderColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e4df",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      } }
      accessibilityRole="button"
      accessibilityLabel={ `Workout session from ${formatDate(session.date, "EEEE, MMMM d")}` }
      accessibilityHint="Double tap to view session details"
    >
      {/* Header: Date & Duration */ }
      <View style={ { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }>
        <Text
          style={ {
            fontSize: 16,
            fontWeight: "700",
            color: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
          } }
        >
          { formatDate(session.date, "EEEE, MMMM d") }
        </Text>
        { duration && (
          <Text
            style={ {
              fontSize: 14,
              color: colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b",
            } }
          >
            { formatElapsedTime(duration) }
          </Text>
        ) }
      </View>

      {/* Routine Title (if exists) */ }
      { session.planTitle ? (
        <View style={ { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 } }>
          <Ionicons
            name="barbell-outline"
            size={ 16 }
            color={ colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
            accessible={ false }
          />
          <Text
            style={ {
              fontSize: 14,
              color: colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b",
            } }
          >
            { session.planTitle }
          </Text>
        </View>
      ) : null }

      {/* Stats Row */ }
      <View style={ { flexDirection: "row", alignItems: "center", gap: 16 } }>
        <View style={ { flexDirection: "row", alignItems: "center", gap: 6 } }>
          <Ionicons
            name="fitness-outline"
            size={ 16 }
            color={ colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5" }
            accessible={ false }
          />
          <Text
            style={ {
              fontSize: 14,
              color: colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5",
            } }
          >
            { session.exerciseCount } { session.exerciseCount === 1 ? "exercise" : "exercises" }
          </Text>
        </View>

        { session.hasReflection ? (
          <View style={ { flexDirection: "row", alignItems: "center", gap: 6 } }>
            <Ionicons
              name="chatbox-outline"
              size={ 16 }
              color={ colorScheme === "dark" ? "#ff9f6c" : "#f4a261" }
              accessible={ false }
            />
            <Text
              style={ {
                fontSize: 14,
                color: colorScheme === "dark" ? "#ff9f6c" : "#f4a261",
              } }
            >
              Reflection
            </Text>
          </View>
        ) : null }
      </View>
    </Pressable>
  );
}

export const SessionCard = memo(SessionCardComponent);
