import { View, Text } from "react-native";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  className?: string;
}

export function MetricCard({ label, value, unit, icon, className = "" }: MetricCardProps) {
  return (
    <View
      className={`bg-light-surface dark:bg-dark-surface rounded-xl p-4 border border-light-border-light dark:border-dark-border-medium ${className}`}
    >
      <View className="flex-row items-center gap-2 mb-1">
        {icon && <Text className="text-base">{icon}</Text>}
        <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </Text>
      </View>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
          {value}
        </Text>
        {unit && (
          <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}
