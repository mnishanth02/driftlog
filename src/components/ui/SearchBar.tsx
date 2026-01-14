import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
}: SearchBarProps) {
  const { colorScheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View
      className={`flex-row items-center px-4 py-1 rounded-xl border ${
        isFocused
          ? "bg-light-surface dark:bg-dark-surface border-primary-500 dark:border-dark-primary"
          : "bg-light-bg-cream dark:bg-dark-bg-elevated border-light-border-light dark:border-dark-border-medium"
      }`}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
        style={{ marginRight: 8 }}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colorScheme === "dark" ? "#6b6b6b" : "#b5b5b5"}
        className="flex-1 text-base text-light-text-primary dark:text-dark-text-primary"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="active:opacity-70"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
          />
        </Pressable>
      )}
    </View>
  );
}
