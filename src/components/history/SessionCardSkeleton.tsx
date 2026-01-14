import { View } from "react-native";
import { Skeleton } from "@/components/ui";

interface SessionCardSkeletonProps {
  showRoutine?: boolean;
  showReflection?: boolean;
}

export function SessionCardSkeleton({
  showRoutine = true,
  showReflection = true,
}: SessionCardSkeletonProps) {
  return (
    <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-5 mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <Skeleton className="h-5 w-44 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </View>

      {showRoutine && (
        <View className="mb-2">
          <Skeleton className="h-4 w-40 rounded-md" />
        </View>
      )}

      <View className="flex-row items-center gap-4">
        <Skeleton className="h-4 w-28 rounded-md" />
        {showReflection && <Skeleton className="h-4 w-24 rounded-md" />}
      </View>
    </View>
  );
}
