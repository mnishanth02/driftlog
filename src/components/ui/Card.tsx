import type { PropsWithChildren } from "react";
import { Text, View, type ViewProps } from "react-native";

interface CardProps extends PropsWithChildren, ViewProps {
  title?: string;
  className?: string;
}

export function Card({ title, children, className = "", ...props }: CardProps) {
  return (
    <View
      className={`bg-light-surface dark:bg-dark-surface rounded-2xl p-5 border border-light-border-light dark:border-dark-border-medium shadow-sm dark:shadow-dark-sm ${className}`}
      {...props}
    >
      {title ? (
        <Text className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
