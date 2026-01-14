import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExerciseDetailCard, ReflectionSection, SessionMetadata } from "@/components/history";
import { BottomSheet, Button, Card, DatePicker, Skeleton } from "@/components/ui";
import { useTheme } from "@/core/contexts/ThemeContext";
import { useHistoryStore } from "@/features/history";
import { useRoutineStore } from "@/features/routines";

// Main screen component follows below...

export default function SessionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  const sessionId = Array.isArray(id) ? id[0] : id;

  const { currentSession, isLoading, loadSessionDetail, saveReflection } = useHistoryStore();
  const { createRoutineFromSession } = useRoutineStore();

  // TODO: Add weightUnit to settings store in future phase
  const weightUnit = "lbs"; // Hardcoded for now

  // Local state for reflection editor
  const [isReflectionSheetOpen, setIsReflectionSheetOpen] = useState(false);
  const [reflectionFeeling, setReflectionFeeling] = useState("");
  const [reflectionNotes, setReflectionNotes] = useState("");
  const [isSavingReflection, setIsSavingReflection] = useState(false);

  // Local state for date assignment
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load session detail on mount
  useEffect(() => {
    if (sessionId) {
      loadSessionDetail(sessionId);
    }
  }, [sessionId, loadSessionDetail]);

  // Update reflection form when session loads
  useEffect(() => {
    if (currentSession?.reflection) {
      setReflectionFeeling(currentSession.reflection.feeling || "");
      setReflectionNotes(currentSession.reflection.notes || "");
    }
  }, [currentSession?.reflection]);

  // Handlers
  const handleBack = () => {
    router.back();
  };

  const handleAssignToDate = () => {
    setShowDatePicker(true);
  };

  const handleDateSelected = async (date: string) => {
    if (!sessionId) return;

    try {
      const routineId = await createRoutineFromSession(sessionId, date);
      Alert.alert("Routine Created", `A new routine has been assigned to ${date}`, [
        { text: "OK" },
        {
          text: "View Routine",
          onPress: () => router.push(`/routines/${routineId}` as never),
        },
      ]);
    } catch (_error) {
      Alert.alert("Error", "Failed to create routine. Please try again.");
    }
  };

  const handleOpenReflectionEditor = () => {
    // Initialize form with existing data
    if (currentSession?.reflection) {
      setReflectionFeeling(currentSession.reflection.feeling || "");
      setReflectionNotes(currentSession.reflection.notes || "");
    } else {
      setReflectionFeeling("");
      setReflectionNotes("");
    }
    setIsReflectionSheetOpen(true);
  };

  const handleCloseReflectionEditor = () => {
    setIsReflectionSheetOpen(false);
  };

  const handleSaveReflection = async () => {
    if (!sessionId) return;

    setIsSavingReflection(true);

    try {
      await saveReflection(
        sessionId,
        reflectionFeeling.trim() || null,
        reflectionNotes.trim() || null,
      );
      setIsReflectionSheetOpen(false);
    } catch (_error) {
      Alert.alert("Error", "Failed to save reflection. Please try again.");
    } finally {
      setIsSavingReflection(false);
    }
  };

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

        {/* Header */}
        <View style={{ paddingTop: insets.top }}>
          <View className="shadow-sm dark:shadow-dark-sm will-change-variable">
            <View className="h-13 px-4 flex-row items-center justify-between">
              <Pressable
                onPress={handleBack}
                hitSlop={16}
                className="min-w-17.5 h-full justify-center items-start active:opacity-60"
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b"}
                />
              </Pressable>

              <Text className="text-[17px] font-bold text-light-text-primary dark:text-dark-text-primary">
                Session Details
              </Text>

              <View className="min-w-17.5" />
            </View>
          </View>
        </View>

        {/* Skeleton content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Card className="mb-6">
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Skeleton className="h-5 w-60 rounded-md" />
              </View>
              <View className="flex-row items-center gap-3">
                <Skeleton className="h-4 w-40 rounded-md" />
              </View>
              <View className="flex-row items-center gap-3">
                <Skeleton className="h-4 w-32 rounded-md" />
              </View>
            </View>
          </Card>

          <View className="mb-4">
            <Skeleton className="h-6 w-32 rounded-md" />
          </View>

          <Card className="mb-3">
            <Skeleton className="h-5 w-44 rounded-md" />
            <View className="mt-3">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md mt-2" />
            </View>
          </Card>

          <Card className="mb-3">
            <Skeleton className="h-5 w-40 rounded-md" />
            <View className="mt-3">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/6 rounded-md mt-2" />
            </View>
          </Card>

          <View className="items-center mt-6">
            <ActivityIndicator
              size="small"
              color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
            />
            <Text className="text-light-text-secondary dark:text-dark-text-secondary mt-3">
              Loading session...
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Error state - missing/invalid id
  if (!sessionId) {
    return (
      <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

        {/* Header */}
        <View style={{ paddingTop: insets.top }}>
          <View className="shadow-sm dark:shadow-dark-sm will-change-variable">
            <View className="h-13 px-4 flex-row items-center justify-between">
              <Pressable
                onPress={handleBack}
                hitSlop={16}
                className="min-w-17.5 h-full justify-center items-start active:opacity-60"
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b"}
                />
              </Pressable>

              <Text className="text-[17px] font-bold text-light-text-primary dark:text-dark-text-primary">
                Session Details
              </Text>

              <View className="min-w-17.5" />
            </View>
          </View>
        </View>

        {/* Error message */}
        <View className="flex-1 items-center justify-center px-5">
          <View className="items-center">
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mt-4">
              Session Not Found
            </Text>
            <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary text-center mt-2">
              This session may have been deleted or doesn't exist.
            </Text>
            <Button title="Go Back" onPress={handleBack} variant="primary" className="mt-6" />
          </View>
        </View>
      </View>
    );
  }

  // Error state - session not found (e.g., deleted)
  if (!currentSession) {
    return (
      <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

        {/* Header */}
        <View style={{ paddingTop: insets.top }}>
          <View className="shadow-sm dark:shadow-dark-sm will-change-variable">
            <View className="h-13 px-4 flex-row items-center justify-between">
              <Pressable
                onPress={handleBack}
                hitSlop={16}
                className="min-w-17.5 h-full justify-center items-start active:opacity-60"
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b"}
                />
              </Pressable>

              <Text className="text-[17px] font-bold text-light-text-primary dark:text-dark-text-primary">
                Session Details
              </Text>

              <View className="min-w-17.5" />
            </View>
          </View>
        </View>

        {/* Error message */}
        <View className="flex-1 items-center justify-center px-5">
          <View className="items-center">
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mt-4">
              Session Not Found
            </Text>
            <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary text-center mt-2">
              This session may have been deleted or doesn't exist.
            </Text>
            <Button title="Go Back" onPress={handleBack} variant="primary" className="mt-6" />
          </View>
        </View>
      </View>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <View className="shadow-sm dark:shadow-dark-sm will-change-variable">
          <View className="h-13 px-4 flex-row items-center justify-between">
            {/* Back Button */}
            <Pressable
              onPress={handleBack}
              hitSlop={16}
              className="min-w-17.5 h-full justify-center items-start active:opacity-60"
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color={colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b"}
              />
            </Pressable>

            {/* Title */}
            <Text className="text-[17px] font-bold text-light-text-primary dark:text-dark-text-primary">
              Session Details
            </Text>

            {/* Assign to Date Button */}
            <Pressable
              onPress={handleAssignToDate}
              hitSlop={16}
              accessibilityRole="button"
              accessibilityLabel="Create routine from session"
              accessibilityHint="Opens calendar to assign this workout as a routine"
              className="min-w-17.5 h-full justify-center items-end active:opacity-60"
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Metadata Card */}
        <SessionMetadata
          date={currentSession.date}
          startTime={currentSession.startTime}
          endTime={currentSession.endTime}
          planTitle={currentSession.planTitle}
        />

        {/* Exercises Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Exercises
          </Text>

          {currentSession.exercises.length === 0 ? (
            <Card>
              <Text className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary italic text-center">
                No exercises logged in this session
              </Text>
            </Card>
          ) : (
            currentSession.exercises.map((exercise) => (
              <ExerciseDetailCard key={exercise.id} exercise={exercise} weightUnit={weightUnit} />
            ))
          )}
        </View>

        {/* Reflection Section */}
        <ReflectionSection
          feeling={currentSession.reflection?.feeling || null}
          notes={currentSession.reflection?.notes || null}
          onEdit={handleOpenReflectionEditor}
        />
      </ScrollView>

      {/* Date Picker Modal (for assign to date) */}
      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelected}
      />

      {/* Reflection Editor Bottom Sheet */}
      <BottomSheet
        visible={isReflectionSheetOpen}
        onClose={handleCloseReflectionEditor}
        title="Reflection"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-5 pb-5">
              {/* Feeling Input */}
              <View>
                <Text className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  How did this feel?
                </Text>
                <TextInput
                  value={reflectionFeeling}
                  onChangeText={setReflectionFeeling}
                  placeholder="Great, tough, easy, etc."
                  className="bg-light-bg-cream dark:bg-dark-bg-elevated rounded-xl px-4 py-4 text-base text-light-text-primary dark:text-dark-text-primary border border-light-border-light dark:border-dark-border-medium"
                  placeholderTextColor={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
                  autoCapitalize="sentences"
                />
              </View>

              {/* Notes Input */}
              <View>
                <Text className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Anything to note?
                </Text>
                <TextInput
                  value={reflectionNotes}
                  onChangeText={setReflectionNotes}
                  placeholder="Any observations, adjustments, or thoughts..."
                  className="bg-light-bg-cream dark:bg-dark-bg-elevated rounded-xl px-4 py-4 text-base text-light-text-primary dark:text-dark-text-primary border border-light-border-light dark:border-dark-border-medium"
                  placeholderTextColor={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                  autoCapitalize="sentences"
                />
              </View>

              {/* Action Buttons */}
              <View className="gap-3">
                <Button
                  title={isSavingReflection ? "Saving..." : "Save Reflection"}
                  onPress={handleSaveReflection}
                  variant="primary"
                  disabled={isSavingReflection}
                />
                <Button
                  title="Cancel"
                  onPress={handleCloseReflectionEditor}
                  variant="secondary"
                  disabled={isSavingReflection}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>
    </View>
  );
}
