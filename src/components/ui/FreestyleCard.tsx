import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";

interface FreestyleCardProps {
  onPress: () => void;
}

export function FreestyleCard({ onPress }: FreestyleCardProps) {
  const { colorScheme } = useTheme();

  return (
    <Pressable
      onPress={ onPress }
      android_ripple={ { color: "rgba(244, 162, 97, 0.3)" } }
      style={ {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colorScheme === "dark" ? "#252525" : "#ffffff",
        borderWidth: 1,
        borderColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e4df",
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      } }
      accessibilityRole="button"
      accessibilityLabel="Start freestyle session"
      accessibilityHint="Begin a workout without a planned routine"
      hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
    >
      <View
        style={ {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colorScheme === "dark" ? "rgba(255, 159, 108, 0.15)" : "rgba(244, 162, 97, 0.15)",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        } }
      >
        <Ionicons
          name="flash"
          size={ 24 }
          color={ colorScheme === "dark" ? "#ff9f6c" : "#f4a261" }
          accessible={ false }
        />
      </View>
      <View style={ { flex: 1 } }>
        <Text
          style={ {
            fontSize: 16,
            fontWeight: "600",
            color: colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b",
          } }
        >
          Freestyle Session
        </Text>
        <Text
          style={ {
            fontSize: 14,
            color: colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b",
            marginTop: 2,
          } }
        >
          Build your workout as you go
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={ 22 }
        color={ colorScheme === "dark" ? "#6b6b6b" : "#8e8e8e" }
        accessible={ false }
      />
    </Pressable>
  );
}
