import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { RoutineCard } from "@/components/routines";
import { useTheme } from "@/core/contexts/ThemeContext";
import { getTodayString } from "@/core/utils/helpers";
import { Navigation } from "@/core/utils/navigation";
import { useRoutineStore } from "@/features/routines";

export default function TodayScreen() {
  const { colorScheme } = useTheme();
  const { routines, loadRoutines } = useRoutineStore();

  // Load routines on mount
  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  // Filter routines for today
  const todayRoutines = routines.filter((r) => r.plannedDate === getTodayString());

  // Handle starting a freestyle session (no routine)
  const handleStartFreestyle = () => {
    Navigation.goToSession("freestyle");
  };

  // Handle starting a routine
  const handleStartRoutine = (routineId: string) => {
    Navigation.goToSession(routineId);
  };

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-12 pb-6">
          <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
            Today
          </Text>
        </View>

        {/* Today's Routines */}
        {todayRoutines.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
              Planned for Today
            </Text>
            <View className="gap-4">
              {todayRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onPress={() => Navigation.goToRoutine(routine.id)}
                  onStartRoutine={() => handleStartRoutine(routine.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Start Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            {todayRoutines.length > 0 ? "Or start freestyle" : "Start a Workout"}
          </Text>

          <Pressable
            onPress={handleStartFreestyle}
            className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-6 flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center">
                <Ionicons
                  name="flash-outline"
                  size={24}
                  color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
                />
              </View>
              <View>
                <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Freestyle Session
                </Text>
                <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Build as you go
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colorScheme === "dark" ? "#6b6b6b" : "#8e8e8e"}
            />
          </Pressable>
        </View>

        {/* Empty State when no routines planned */}
        {todayRoutines.length === 0 && (
          <View className="bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium rounded-2xl p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center mb-4">
              <Ionicons
                name="calendar-outline"
                size={32}
                color={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
              />
            </View>
            <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 text-center">
              No routine planned
            </Text>
            <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center mb-4">
              Plan a routine or start a freestyle session
            </Text>
            <Pressable
              onPress={() => Navigation.goToTab("plan")}
              className="flex-row items-center gap-2 py-2 px-4 active:opacity-70"
            >
              <Text className="text-base font-semibold text-primary-500 dark:text-dark-primary">
                Go to Plan
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
              />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
