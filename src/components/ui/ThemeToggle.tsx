import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";

export function ThemeToggle() {
  const { selectedScheme, setColorScheme } = useTheme();

  const options: Array<{
    value: "light" | "dark" | "system";
    icon: string;
    label: string;
  }> = [
    { value: "light", icon: "☀️", label: "Light" },
    { value: "dark", icon: "🌙", label: "Dark" },
    { value: "system", icon: "📱", label: "System" },
  ];

  return (
    <View
      className="flex-row gap-2 bg-light-bg-cream dark:bg-dark-bg-secondary p-1 rounded-xl"
      accessibilityRole="radiogroup"
      accessibilityLabel="Theme selection"
    >
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => setColorScheme(option.value)}
          android_ripple={{
            color:
              selectedScheme === option.value
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(244, 162, 97, 0.3)",
          }}
          className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
            selectedScheme === option.value
              ? "bg-primary-500 dark:bg-dark-primary"
              : "bg-transparent"
          }`}
          accessibilityRole="radio"
          accessibilityLabel={`${option.label} theme`}
          accessibilityHint={`Set app theme to ${option.label.toLowerCase()} mode`}
          accessibilityState={{ checked: selectedScheme === option.value }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-base" accessible={false}>
            {option.icon}
          </Text>
          <Text
            className={`text-sm font-medium ${
              selectedScheme === option.value
                ? "text-white"
                : "text-light-text-secondary dark:text-dark-text-secondary"
            }`}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
