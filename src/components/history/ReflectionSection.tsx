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
    <Card className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="chatbox-outline"
            size={20}
            color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
          />
          <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            Reflection
          </Text>
        </View>
        <Pressable onPress={onEdit} className="px-3 py-1.5 active:opacity-70">
          <Text className="text-sm font-semibold text-primary-500 dark:text-dark-primary">
            {hasReflection ? "Edit" : "Add"}
          </Text>
        </Pressable>
      </View>

      {hasReflection ? (
        <View className="gap-3">
          {feeling && (
            <View>
              <Text className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                How did this feel?
              </Text>
              <Text className="text-base text-light-text-primary dark:text-dark-text-primary">
                {feeling}
              </Text>
            </View>
          )}
          {notes && (
            <View>
              <Text className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Notes
              </Text>
              <Text className="text-base text-light-text-primary dark:text-dark-text-primary">
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
