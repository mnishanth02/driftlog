import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui";
import { useTheme } from "@/core/contexts/ThemeContext";

interface ReflectionSectionProps {
  feeling: string | null;
  notes: string | null;
  onEdit: () => void;
}

export function ReflectionSection({ feeling, notes, onEdit }: ReflectionSectionProps) {
  const { colorScheme } = useTheme();
  const hasReflection = feeling || notes;

  return (
    <Card className="mb-4 p-4 rounded-2xl">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="chatbox-outline"
            size={18}
            color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
          />
          <Text className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
            Reflection
          </Text>
        </View>
        <Pressable
          onPress={onEdit}
          android_ripple={{ color: "rgba(244, 162, 97, 0.3)", radius: 20 }}
          className="px-2 py-1 active:opacity-70"
          hitSlop={8}
        >
          <Text className="text-sm font-semibold text-primary-500 dark:text-dark-primary">
            {hasReflection ? "Edit" : "Add"}
          </Text>
        </Pressable>
      </View>

      {hasReflection ? (
        <View className="gap-3">
          {feeling && (
            <View>
              <Text className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider mb-1">
                How it felt
              </Text>
              <Text className="text-sm text-light-text-primary dark:text-dark-text-primary">
                {feeling}
              </Text>
            </View>
          )}
          {notes && (
            <View>
              <Text className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider mb-1">
                Notes
              </Text>
              <Text className="text-sm text-light-text-primary dark:text-dark-text-primary">
                {notes}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary italic">
          No reflection yet. Tap "Add" to capture your thoughts.
        </Text>
      )}
    </Card>
  );
}
