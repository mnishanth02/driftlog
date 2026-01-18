import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";

export function ThemeToggle() {
  const { colorScheme, selectedScheme, setColorScheme } = useTheme();

  const options: Array<{
    value: "light" | "dark" | "system";
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }> = [
      { value: "light", icon: "sunny-outline", label: "Light" },
      { value: "dark", icon: "moon-outline", label: "Dark" },
      { value: "system", icon: "phone-portrait-outline", label: "System" },
    ];

  return (
    <View
      className="flex-row gap-2 bg-light-bg-cream dark:bg-dark-bg-secondary p-1 rounded-xl"
      accessibilityRole="radiogroup"
      accessibilityLabel="Theme selection"
    >
      { options.map((option) => {
        const isSelected = selectedScheme === option.value;

        return (
          <Pressable
            key={ option.value }
            onPress={ () => setColorScheme(option.value) }
            className={ `flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${isSelected ? "bg-primary-500 dark:bg-dark-primary" : "bg-transparent"
              }` }
            accessibilityRole="radio"
            accessibilityLabel={ `${option.label} theme` }
            accessibilityHint={ `Set app theme to ${option.label.toLowerCase()} mode` }
            accessibilityState={ { checked: isSelected } }
            hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
          >
            <Ionicons
              name={ option.icon }
              size={ 18 }
              color={ isSelected ? "#ffffff" : colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b" }
            />
            <Text
              className={ `text-sm font-medium ${isSelected
                  ? "text-white"
                  : "text-light-text-secondary dark:text-dark-text-secondary"
                }` }
            >
              { option.label }
            </Text>
          </Pressable>
        );
      }) }
    </View>
  );
}
