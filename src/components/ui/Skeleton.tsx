import { View, type ViewProps } from "react-native";

interface SkeletonProps extends ViewProps {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <View
      className={`bg-light-border-light dark:bg-dark-border-light opacity-60 ${className}`}
      {...props}
    />
  );
}
