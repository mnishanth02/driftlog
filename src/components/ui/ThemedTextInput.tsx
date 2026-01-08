import { TextInput, type TextInputProps, useColorScheme } from "react-native";

interface ThemedTextInputProps extends Omit<TextInputProps, "style"> {
  className?: string;
}

export function ThemedTextInput({ className = "", ...props }: ThemedTextInputProps) {
  const colorScheme = useColorScheme();

  // Theme-aware colors from design tokens
  const textColor = colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b";
  const inputBgColor = colorScheme === "dark" ? "#212121" : "#f9f5f1";
  const borderColor = colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4";

  const isMultiline = props.multiline === true;

  return (
    <TextInput
      placeholderTextColor="#8e8e8e"
      autoCorrect={false}
      spellCheck={false}
      autoComplete="off"
      autoCapitalize="sentences"
      className={`rounded-xl text-base ${className}`}
      style={{
        backgroundColor: inputBgColor,
        color: textColor,
        borderWidth: 2,
        borderColor: borderColor,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: isMultiline ? 120 : 52,
        textAlignVertical: isMultiline ? "top" : "center",
      }}
      {...props}
    />
  );
}
