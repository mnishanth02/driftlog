import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { ExerciseRow, SessionHeader, TimerPicker } from "@/components/session";
import { useTheme } from "@/core/contexts/ThemeContext";
import { Navigation } from "@/core/utils/navigation";
import { type ExerciseLog, useSessionStore } from "@/features/session";

export default function ActiveSessionScreen() {
  const { routineId } = useLocalSearchParams<{ routineId?: string | string[] }>();
  const { colorScheme } = useTheme();

  const actualRoutineId = Array.isArray(routineId) ? routineId[0] : routineId;
  const isFreestyle = !actualRoutineId || actualRoutineId === "freestyle";
  const isResumingActive = actualRoutineId === "active"; // Resuming existing session

  // Use selectors to prevent unnecessary re-renders
  const isSessionActive = useSessionStore((state) => state.isSessionActive);
  const currentExercises = useSessionStore((state) => state.currentExercises);
  const activeExerciseIndex = useSessionStore((state) => state.activeExerciseIndex);
  const sessionStartTime = useSessionStore((state) => state.sessionStartTime);
  const targetDuration = useSessionStore((state) => state.targetDuration);
  const timerWarningShown = useSessionStore((state) => state.timerWarningShown);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const timerStartTime = useSessionStore((state) => state.timerStartTime);
  const isTimerPaused = useSessionStore((state) => state.isTimerPaused);

  // Actions don't change, so can destructure from store
  const {
    startSession,
    startSessionFromRoutine,
    endSession,
    addExercise,
    toggleExerciseComplete,
    reorderExercises,
    pauseTimer,
    resumeTimer,
  } = useSessionStore();

  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [exerciseInputValue, setExerciseInputValue] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const exerciseInputRef = useRef<TextInput>(null);

  // CRITICAL: Track ending state to prevent re-initialization during cleanup
  // This ref persists across renders and prevents race conditions
  const isEndingRef = useRef(false);

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

  // Android back button handler - prevent accidental exit during active session
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isSessionActive) {
        Alert.alert("End Workout?", "Your workout is in progress. Are you sure you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "End Workout", onPress: handleEndSessionRef.current, style: "destructive" },
        ]);
        return true; // Prevent default back
      }
      return false; // Allow default back
    });
    return () => backHandler.remove();
  }, [isSessionActive]);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      // CRITICAL: Don't initialize if we're ending the session
      // This prevents race conditions during cleanup
      if (isEndingRef.current) {
        return;
      }

      // Skip initialization if resuming active session or if session already active
      if (isResumingActive || isSessionActive) {
        return;
      }

      // Only initialize if no session is active
      try {
        if (isFreestyle) {
          await startSession();
        } else if (actualRoutineId) {
          await startSessionFromRoutine(actualRoutineId);
        }
      } catch (error) {
        console.error("Failed to start session:", error);
        Alert.alert("Error", "Failed to start session", [
          { text: "OK", onPress: () => Navigation.goBack() },
        ]);
      }
    };

    initSession();
  }, [
    actualRoutineId,
    isFreestyle,
    isResumingActive,
    isSessionActive,
    startSession,
    startSessionFromRoutine,
  ]);

  // If user navigates to /session/active but there's nothing to resume, go back.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isResumingActive) return;
    if (isSessionActive) return;

    Alert.alert("No active workout", "There isn't an active workout to resume.", [
      { text: "OK", onPress: () => Navigation.goBack() },
    ]);
  }, [hasHydrated, isResumingActive, isSessionActive]);

  const handleEndSession = useCallback(async () => {
    // CRITICAL: Set ending flag immediately (synchronous)
    // This prevents re-initialization during async cleanup
    isEndingRef.current = true;

    try {
      await endSession();

      // Navigate after session cleanup completes
      // Use endSessionAndGoHome() which uses replace() to fix corrupted navigation stack
      Navigation.endSessionAndGoHome();
    } catch (error) {
      console.error("Failed to end session:", error);
      Alert.alert("Error", "Failed to end session");
      // Reset flag on error so user can retry
      isEndingRef.current = false;
    }
  }, [endSession]);

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

    // Always show confirmation with context-aware message
    const message =
      totalCount === 0
        ? "Are you sure you want to end this workout? No exercises were logged."
        : completedCount === totalCount
          ? "Great work! Ready to end your workout?"
          : `You've completed ${completedCount} of ${totalCount} exercises. End workout?`;

    Alert.alert("End Workout", message, [
      { text: "Continue", style: "cancel" },
      { text: "End Workout", style: "destructive", onPress: handleEndSession },
    ]);
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
          exercise={ item }
          isActive={ isActiveExercise }
          onPress={ () => handleExercisePress(item.id) }
          onLongPress={ drag }
          isDragging={ isActive }
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
      behavior={ Platform.OS === "ios" ? "padding" : "height" }
      className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary"
    >
      <View className="flex-1">
        <StatusBar style={ colorScheme === "dark" ? "light" : "dark" } />

        {/* Session Header with Timer */ }
        <SessionHeader onTimerPress={ () => setShowTimerPicker(true) } />

        {/* Exercise List */ }
        <View className="flex-1">
          { currentExercises.length === 0 ? (
            <View className="flex-1 items-center justify-center px-5">
              <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-12 items-center shadow-sm dark:shadow-dark-sm border border-light-border-light dark:border-dark-border-medium max-w-xs">
                <View className="w-20 h-20 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center mb-4">
                  <Ionicons
                    name="fitness-outline"
                    size={ 40 }
                    color={ colorScheme === "dark" ? "#ff9f6c" : "#f4a261" }
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
              data={ currentExercises }
              onDragEnd={ ({ data }) => reorderExercises(data) }
              keyExtractor={ (item) => item.id }
              renderItem={ renderExerciseItem }
              contentContainerStyle={ { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16 } }
              showsVerticalScrollIndicator={ false }
            />
          ) }
        </View>

        {/* Footer - Add Exercise & End Session */ }
        <View className="bg-light-surface dark:bg-dark-surface border-t border-light-border-light dark:border-dark-border-medium px-4 pt-4 pb-8">
          {/* Add Exercise - Only show when timer not running (idle or paused) */ }
          { !timerStartTime || isTimerPaused ? (
            showAddInput ? (
              <View className="flex-row items-center gap-3 mb-4">
                <TextInput
                  ref={ exerciseInputRef }
                  value={ exerciseInputValue }
                  onChangeText={ setExerciseInputValue }
                  onSubmitEditing={ handleAddExercise }
                  onBlur={ () => {
                    if (!exerciseInputValue.trim()) {
                      setShowAddInput(false);
                    }
                  } }
                  placeholder="Exercise name..."
                  returnKeyType="done"
                  selectionColor={ colorScheme === "dark" ? "#ff9f6c" : "#f4a261" }
                  underlineColorAndroid="transparent"
                  className="flex-1 bg-light-bg-cream dark:bg-dark-bg-elevated rounded-lg px-4 py-4 text-base text-light-text-primary dark:text-dark-text-primary border border-light-border-light dark:border-dark-border-medium"
                  placeholderTextColor={ colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5" }
                />
                <Pressable
                  onPress={ handleAddExercise }
                  android_ripple={ { color: "rgba(255, 255, 255, 0.3)" } }
                  disabled={ !exerciseInputValue.trim() }
                  className="w-14 h-14 bg-primary-500 dark:bg-dark-primary rounded-full items-center justify-center active:opacity-80 disabled:opacity-40"
                  accessibilityRole="button"
                  accessibilityLabel="Add exercise"
                  accessibilityHint="Add the exercise to your workout"
                  accessibilityState={ { disabled: !exerciseInputValue.trim() } }
                  hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
                >
                  <Ionicons name="add" size={ 28 } color="#ffffff" accessible={ false } />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={ handleShowAddInput }
                android_ripple={ { color: "rgba(244, 162, 97, 0.3)" } }
                className="flex-row items-center justify-center gap-2 py-3 mb-3 rounded-xl border border-dashed border-light-border-medium dark:border-dark-border-medium active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Add exercise"
                accessibilityHint="Opens input to add a new exercise"
                hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={ 22 }
                  color={ colorScheme === "dark" ? "#8e8e8e" : "#6b6b6b" }
                  accessible={ false }
                />
                <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary">
                  Add exercise
                </Text>
              </Pressable>
            )
          ) : null }

          {/* Session Controls - State-dependent */ }
          { !timerStartTime ? (
            // STATE 1: IDLE - Timer not started yet, show primary "Start" action
            <Pressable
              onPress={ resumeTimer }
              android_ripple={ { color: "rgba(255, 255, 255, 0.3)" } }
              className="w-full bg-primary-500 dark:bg-dark-primary rounded-2xl py-5 flex-row items-center justify-center gap-2 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Start workout"
              accessibilityHint="Begin workout timer"
              hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
            >
              <Ionicons name="play" size={ 24 } color="#ffffff" accessible={ false } />
              <Text className="text-lg font-bold text-white dark:text-dark-bg-primary">
                Start Workout
              </Text>
            </Pressable>
          ) : isTimerPaused ? (
            // STATE 3: PAUSED - Timer paused, show Resume (primary) + End (secondary)
            <View className="gap-3">
              <Pressable
                onPress={ resumeTimer }
                android_ripple={ { color: "rgba(255, 255, 255, 0.3)" } }
                className="w-full bg-primary-500 dark:bg-dark-primary rounded-2xl py-5 flex-row items-center justify-center gap-2 active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel="Resume workout"
                accessibilityHint="Continue workout timer"
                hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
              >
                <Ionicons name="play" size={ 24 } color="#ffffff" accessible={ false } />
                <Text className="text-lg font-bold text-white dark:text-dark-bg-primary">
                  Resume Workout
                </Text>
              </Pressable>
              <Pressable
                onPress={ handleConfirmEnd }
                android_ripple={ { color: "rgba(0, 0, 0, 0.1)" } }
                className="w-full bg-light-bg-cream dark:bg-dark-bg-elevated border border-light-border-medium dark:border-dark-border-medium rounded-2xl py-4 items-center justify-center active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="End workout"
                accessibilityHint="Stop and save your workout session"
                hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
              >
                <Text className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                  End Workout
                </Text>
              </Pressable>
            </View>
          ) : (
            // STATE 2: RUNNING - Timer active, show Pause action (secondary styling - less alarming)
            <Pressable
              onPress={ pauseTimer }
              android_ripple={ { color: "rgba(244, 162, 97, 0.3)" } }
              className="w-full bg-light-bg-cream dark:bg-dark-bg-elevated border border-light-border-medium dark:border-dark-border-medium rounded-2xl py-5 flex-row items-center justify-center gap-2 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Pause workout"
              accessibilityHint="Pause workout timer"
              hitSlop={ { top: 8, bottom: 8, left: 8, right: 8 } }
            >
              <Ionicons
                name="pause"
                size={ 24 }
                color={ colorScheme === "dark" ? "#ff9f6c" : "#f4a261" }
                accessible={ false }
              />
              <Text className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Pause Workout
              </Text>
            </Pressable>
          ) }
        </View>

        {/* Timer Picker Bottom Sheet */ }
        <TimerPicker visible={ showTimerPicker } onClose={ () => setShowTimerPicker(false) } />
      </View>
    </KeyboardAvoidingView>
  );
}
