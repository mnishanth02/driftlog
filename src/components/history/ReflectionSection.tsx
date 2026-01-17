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
    <Card className="mb-4 p-3 rounded-xl border-light-border-light dark:border-dark-border-medium">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="chatbox-outline"
            size={16}
            color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
          />
          <Text className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
            Reflection
          </Text>
        </View>
        <Pressable onPress={onEdit} className="px-2 py-1 active:opacity-70">
          <Text className="text-xs font-semibold text-primary-500 dark:text-dark-primary">
            {hasReflection ? "Edit" : "Add"}
          </Text>
        </Pressable>
      </View>

      {hasReflection ? (
        <View className="gap-2.5">
          {feeling && (
            <View>
              <Text className="text-[10px] font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider mb-0.5">
                How it felt
              </Text>
              <Text className="text-xs text-light-text-primary dark:text-dark-text-primary">
                {feeling}
              </Text>
            </View>
          )}
          {notes && (
            <View>
              <Text className="text-[10px] font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider mb-0.5">
                Notes
              </Text>
              <Text className="text-xs text-light-text-primary dark:text-dark-text-primary">
                {notes}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Text className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary italic">
          No reflection yet. Tap "Add" to capture your thoughts.
        </Text>
      )}
    </Card>
  );
}
