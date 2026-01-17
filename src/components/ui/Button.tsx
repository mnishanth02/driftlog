import { Pressable, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseClasses = "rounded-xl py-4 px-6 active:opacity-70 disabled:opacity-50";

  const variantClasses = {
    primary: "bg-primary-500 dark:bg-dark-primary",
    secondary:
      "bg-light-bg-cream dark:bg-dark-bg-elevated border border-light-border-medium dark:border-dark-border-medium",
    ghost: "bg-transparent",
  };

  const textClasses = {
    primary: "text-white dark:text-dark-bg-primary",
    secondary: "text-light-text-primary dark:text-dark-text-primary",
    ghost: disabled
      ? "text-light-text-tertiary dark:text-dark-text-tertiary" // Muted when disabled
      : "text-primary-500 dark:text-dark-primary",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text className={`text-base font-semibold text-center ${textClasses[variant]}`}>{title}</Text>
    </Pressable>
  );
}
