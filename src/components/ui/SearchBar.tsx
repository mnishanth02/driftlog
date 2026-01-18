import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useTheme } from "@/core/contexts/ThemeContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  /** Debounce delay in ms. Set to 0 to disable debouncing. Default: 0 (no debounce) */
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  debounceMs = 0,
}: SearchBarProps) {
  const { colorScheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);

      if (debounceMs <= 0) {
        // No debounce - call immediately
        onChangeText(text);
        return;
      }

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        onChangeText(text);
      }, debounceMs);
    },
    [onChangeText, debounceMs],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setLocalValue("");
    onChangeText("");
    onClear?.();
  };

  return (
    <View
      className={`flex-row items-center px-4 py-2.5 rounded-2xl border gap-2.5 ${
        isFocused
          ? "bg-light-surface dark:bg-dark-surface border-primary-500 dark:border-dark-primary"
          : "bg-light-bg-cream/50 dark:bg-dark-bg-elevated/50 border-light-border-light dark:border-dark-border-medium"
      }`}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b"}
        accessible={false}
      />
      <TextInput
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colorScheme === "dark" ? "#6b6b6b" : "#b5b5b5"}
        selectionColor={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
        underlineColorAndroid="transparent"
        className="flex-1 text-base text-light-text-primary dark:text-dark-text-primary"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={placeholder}
      />
      {localValue.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          android_ripple={{ color: "rgba(244, 162, 97, 0.3)", radius: 20 }}
          className="active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityHint="Remove search text"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
            accessible={false}
          />
        </Pressable>
      )}
    </View>
  );
}
