import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { ExerciseRow, SessionHeader, TimerPicker } from "@/components/session";
import { useTheme } from "@/core/contexts/ThemeContext";
import { type ExerciseLog, useSessionStore } from "@/features/session";

export default function ActiveSessionScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId?: string | string[] }>();
  const { colorScheme } = useTheme();
  const systemColorScheme = useColorScheme();

  const actualRoutineId = Array.isArray(routineId) ? routineId[0] : routineId;
  const isFreestyle = !actualRoutineId || actualRoutineId === "freestyle";

  // Use selectors to prevent unnecessary re-renders
  const isSessionActive = useSessionStore((state) => state.isSessionActive);
  const currentExercises = useSessionStore((state) => state.currentExercises);
  const activeExerciseIndex = useSessionStore((state) => state.activeExerciseIndex);
  const sessionStartTime = useSessionStore((state) => state.sessionStartTime);
  const targetDuration = useSessionStore((state) => state.targetDuration);
  const timerWarningShown = useSessionStore((state) => state.timerWarningShown);

  // Actions don't change, so can destructure from store
  const {
    startSession,
    startSessionFromRoutine,
    endSession,
    addExercise,
    toggleExerciseComplete,
    reorderExercises,
  } = useSessionStore();

  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [exerciseInputValue, setExerciseInputValue] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const exerciseInputRef = useRef<TextInput>(null);

  // Cleanup auto-end timer when component unmounts
  useEffect(() => {
    return () => {
      const store = useSessionStore.getState();
      if (store.autoEndTimerId) {
        clearTimeout(store.autoEndTimerId);
        useSessionStore.setState({ autoEndTimerId: null });
      }
    };
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      // Only initialize if no session is active
      if (!isSessionActive) {
        try {
          if (isFreestyle) {
            await startSession();
          } else if (actualRoutineId) {
            await startSessionFromRoutine(actualRoutineId);
          }
        } catch (error) {
          console.error("Failed to start session:", error);
          Alert.alert("Error", "Failed to start session", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      }
    };

    initSession();
  }, [
    actualRoutineId,
    isFreestyle,
    isSessionActive,
    startSession,
    startSessionFromRoutine,
    router,
  ]);

  const handleEndSession = useCallback(async () => {
    try {
      await endSession();
      // Small delay to ensure state updates before navigation
      const NAVIGATION_DELAY = 100;
      setTimeout(() => {
        router.replace("/(tabs)");
      }, NAVIGATION_DELAY);
    } catch (error) {
      console.error("Failed to end session:", error);
      Alert.alert("Error", "Failed to end session");
    }
  }, [endSession, router]);

  // Store latest callback in ref to avoid memory leaks
  const handleEndSessionRef = useRef(handleEndSession);
  handleEndSessionRef.current = handleEndSession;

  // Timer warning check
  useEffect(() => {
    if (!sessionStartTime || !targetDuration || timerWarningShown) return;

    const checkTimer = () => {
      const startDate = new Date(sessionStartTime);
      const now = new Date();
      const elapsedMinutes = (now.getTime() - startDate.getTime()) / 1000 / 60;

      if (elapsedMinutes >= targetDuration && !timerWarningShown) {
        // Call store directly to avoid stale closure
        useSessionStore.getState().setTimerWarningShown(true);
        Alert.alert(
          "Time's up!",
          "Your target session time has elapsed. Would you like to end your workout or continue?",
          [
            { text: "Continue", style: "cancel" },
            {
              text: "End Session",
              style: "default",
              onPress: () => handleEndSessionRef.current(),
            },
          ],
        );
      }
    };

    // Check every 30 seconds
    const TIMER_CHECK_INTERVAL = 30000;
    const interval = setInterval(checkTimer, TIMER_CHECK_INTERVAL);
    // Also check immediately
    checkTimer();

    return () => clearInterval(interval);
  }, [sessionStartTime, targetDuration, timerWarningShown]);

  const handleConfirmEnd = () => {
    const completedCount = currentExercises.filter((e) => e.completedAt).length;
    const totalCount = currentExercises.length;

    if (totalCount > 0 && completedCount < totalCount) {
      Alert.alert(
        "End workout?",
        `You've completed ${completedCount} of ${totalCount} exercises.`,
        [
          { text: "Continue", style: "cancel" },
          { text: "End", style: "destructive", onPress: handleEndSession },
        ],
      );
    } else {
      handleEndSession();
    }
  };

  const handleExercisePress = (exerciseId: string) => {
    toggleExerciseComplete(exerciseId);
  };

  const handleAddExercise = () => {
    if (exerciseInputValue.trim()) {
      addExercise(exerciseInputValue.trim());
      setExerciseInputValue("");
      setShowAddInput(false);
    }
  };

  const handleShowAddInput = () => {
    setShowAddInput(true);
    setTimeout(() => {
      exerciseInputRef.current?.focus();
    }, 100);
  };

  const renderExerciseItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<ExerciseLog>) => {
    const index = getIndex() ?? 0;
    const isActiveExercise = index === activeExerciseIndex && !item.completedAt;

    return (
      <ScaleDecorator>
        <ExerciseRow
          exercise={item}
          index={index}
          isActive={isActiveExercise}
          onPress={() => handleExercisePress(item.id)}
          onLongPress={drag}
          isDragging={isActive}
        />
      </ScaleDecorator>
    );
  };

  // Loading state
  if (!isSessionActive) {
    return (
      <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary items-center justify-center">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary">
          Starting session...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary"
    >
      <View className="flex-1">
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

        {/* Session Header with Timer */}
        <SessionHeader onTimerPress={() => setShowTimerPicker(true)} />

        {/* Exercise List */}
        <View className="flex-1">
          {currentExercises.length === 0 ? (
            <View className="flex-1 items-center justify-center px-5">
              <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-12 items-center shadow-sm dark:shadow-dark-sm border border-light-border-light dark:border-dark-border-medium max-w-xs">
                <View className="w-20 h-20 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center mb-4">
                  <Ionicons
                    name="fitness-outline"
                    size={40}
                    color={systemColorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
                  />
                </View>
                <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2 text-center">
                  Let's Go!
                </Text>
                <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
                  Add exercises below to start your workout
                </Text>
              </View>
            </View>
          ) : (
            <DraggableFlatList
              data={currentExercises}
              onDragEnd={({ data }) => reorderExercises(data)}
              keyExtractor={(item) => item.id}
              renderItem={renderExerciseItem}
              contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Footer - Add Exercise & End Session */}
        <View className="bg-light-surface dark:bg-dark-surface border-t border-light-border-light dark:border-dark-border-medium px-4 pt-4 pb-8">
          {/* Add Exercise */}
          {showAddInput ? (
            <View className="flex-row items-center gap-3 mb-4">
              <TextInput
                ref={exerciseInputRef}
                value={exerciseInputValue}
                onChangeText={setExerciseInputValue}
                onSubmitEditing={handleAddExercise}
                onBlur={() => {
                  if (!exerciseInputValue.trim()) {
                    setShowAddInput(false);
                  }
                }}
                placeholder="Exercise name..."
                returnKeyType="done"
                className="flex-1 bg-light-bg-cream dark:bg-dark-bg-elevated rounded-lg px-4 py-4 text-base text-light-text-primary dark:text-dark-text-primary border border-light-border-light dark:border-dark-border-medium"
                placeholderTextColor={systemColorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
              />
              <Pressable
                onPress={handleAddExercise}
                disabled={!exerciseInputValue.trim()}
                className="w-14 h-14 bg-primary-500 dark:bg-dark-primary rounded-full items-center justify-center active:opacity-80 disabled:opacity-40"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={28} color="#ffffff" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleShowAddInput}
              className="flex-row items-center justify-center gap-2 py-3 mb-3 rounded-xl border border-dashed border-light-border-medium dark:border-dark-border-medium active:opacity-70"
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={systemColorScheme === "dark" ? "#8e8e8e" : "#6b6b6b"}
              />
              <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary">
                Add exercise
              </Text>
            </Pressable>
          )}

          {/* End Session Button */}
          <Pressable
            onPress={handleConfirmEnd}
            className="w-full bg-primary-500 dark:bg-dark-primary rounded-2xl py-4 items-center justify-center active:opacity-80"
          >
            <Text className="text-lg font-bold text-white dark:text-dark-bg-primary">
              End Workout
            </Text>
          </Pressable>
        </View>

        {/* Timer Picker Bottom Sheet */}
        <TimerPicker visible={showTimerPicker} onClose={() => setShowTimerPicker(false)} />
      </View>
    </KeyboardAvoidingView>
  );
}
