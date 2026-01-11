import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/core/contexts/ThemeContext";
import { type DraftExercise, useRoutineStore } from "@/features/routines";

export default function RoutineEditScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams<{ id?: string | string[]; date?: string | string[] }>();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  const routineId = Array.isArray(id) ? id[0] : id;
  const plannedDate = (Array.isArray(date) ? date[0] : date) || null;
  const isCreateMode = !routineId || routineId === "new";

  const {
    draftRoutine,
    startDraft,
    updateDraftTitle,
    addDraftExercise,
    updateDraftExercise,
    removeDraftExercise,
    reorderDraftExercises,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    clearDraft,
  } = useRoutineStore();

  const [exerciseInputValue, setExerciseInputValue] = useState("");
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState("");
  const exerciseInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isCreateMode && routineId) {
      startDraft(routineId, plannedDate || undefined);
      return () => {
        clearDraft();
      };
    }

    startDraft(undefined, plannedDate || undefined);

    return () => {
      clearDraft();
    };
  }, [isCreateMode, routineId, plannedDate, startDraft, clearDraft]);

  const handleCancel = () => {
    clearDraft();
    router.back();
  };

  const handleSave = async () => {
    if (!draftRoutine) return;

    // Validate that title is not empty
    if (!draftRoutine.title.trim()) {
      Alert.alert("Title Required", "Please enter a routine name before saving.");
      return;
    }

    try {
      if (draftRoutine.id) {
        await updateRoutine(
          draftRoutine.id,
          draftRoutine.title,
          draftRoutine.notes,
          draftRoutine.exercises,
          draftRoutine.plannedDate,
        );
      } else {
        await createRoutine(
          draftRoutine.title,
          draftRoutine.notes,
          draftRoutine.exercises,
          draftRoutine.plannedDate,
        );
      }

      clearDraft();
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save routine");
      console.error(error);
    }
  };

  const handleAddExercise = () => {
    if (exerciseInputValue.trim()) {
      addDraftExercise(exerciseInputValue.trim());
      setExerciseInputValue("");
      exerciseInputRef.current?.focus();
    }
  };

  const handleStartEdit = (exercise: DraftExercise) => {
    setEditingExerciseId(exercise.id);
    setEditingExerciseName(exercise.name);
  };

  const handleSaveEdit = () => {
    if (editingExerciseId && editingExerciseName.trim()) {
      updateDraftExercise(editingExerciseId, editingExerciseName.trim());
    }
    setEditingExerciseId(null);
    setEditingExerciseName("");
  };

  const handleCancelEdit = () => {
    setEditingExerciseId(null);
    setEditingExerciseName("");
  };

  const handleDelete = (exerciseId: string) => {
    removeDraftExercise(exerciseId);
  };

  const handleDeleteRoutine = () => {
    if (!draftRoutine?.id) return;

    Alert.alert("Delete routine?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const idToDelete = draftRoutine.id;
            if (!idToDelete) return;

            await deleteRoutine(idToDelete);
            clearDraft();
            router.back();
          } catch (error) {
            Alert.alert("Error", "Failed to delete routine");
            console.error(error);
          }
        },
      },
    ]);
  };

  const renderExerciseItem = ({ item, drag, isActive }: RenderItemParams<DraftExercise>) => {
    const isEditing = editingExerciseId === item.id;

    return (
      <ScaleDecorator>
        <View
          className="bg-light-surface dark:bg-dark-surface rounded-2xl mb-3 border border-light-border-light dark:border-dark-border-medium overflow-hidden"
          style={{
            opacity: isActive ? 0.6 : 1,
            transform: [{ scale: isActive ? 1.02 : 1 }],
          }}
        >
          <View className="flex-row items-center">
            {/* Drag handle - Hamburger icon */}
            <Pressable
              onLongPress={drag}
              className="px-4 py-5 active:opacity-70"
              accessibilityLabel="Long press to reorder"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View className="gap-1">
                <View className="w-4 h-0.5 rounded-full bg-light-text-secondary dark:bg-dark-text-secondary" />
                <View className="w-4 h-0.5 rounded-full bg-light-text-secondary dark:bg-dark-text-secondary" />
                <View className="w-4 h-0.5 rounded-full bg-light-text-secondary dark:bg-dark-text-secondary" />
              </View>
            </Pressable>

            {/* Exercise name or input */}
            {isEditing ? (
              <View className="flex-1 flex-row items-center gap-2 pr-4 py-5">
                <TextInput
                  value={editingExerciseName}
                  onChangeText={setEditingExerciseName}
                  autoFocus
                  className="flex-1 text-base text-light-text-primary dark:text-dark-text-primary px-2 py-1"
                  placeholderTextColor={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
                />
                <Pressable
                  onPress={handleSaveEdit}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1 active:opacity-70"
                >
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
                  />
                </Pressable>
                <Pressable
                  onPress={handleCancelEdit}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1 active:opacity-70"
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={colorScheme === "dark" ? "#8e8e8e" : "#6b6b6b"}
                  />
                </Pressable>
              </View>
            ) : (
              <View className="flex-1 flex-row items-center gap-3 pr-4 py-5">
                <Text className="flex-1 text-base font-medium text-light-text-primary dark:text-dark-text-primary">
                  {item.name}
                </Text>
                <Pressable
                  onPress={() => handleStartEdit(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1 active:opacity-70"
                  accessibilityLabel="Edit exercise"
                >
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={colorScheme === "dark" ? "#8e8e8e" : "#6b6b6b"}
                  />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1 active:opacity-70"
                  accessibilityLabel="Delete exercise"
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colorScheme === "dark" ? "#ef4444" : "#dc2626"}
                  />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  if (!draftRoutine) {
    return (
      <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary items-center justify-center">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary">Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

          {/* Header - Redesigned for better visibility */}
          <View
            className="bg-light-surface dark:bg-dark-surface border-b border-light-border-light dark:border-dark-border-medium shadow-sm dark:shadow-dark-sm z-10"
            style={{ paddingTop: insets.top }}
          >
            <View className="h-13 px-4 flex-row items-center justify-between">
              {/* Cancel Button */}
              <Pressable
                onPress={handleCancel}
                hitSlop={16}
                className="min-w-17.5 h-full justify-center items-start active:opacity-60"
              >
                <Text className="text-[17px] text-light-text-secondary dark:text-dark-text-secondary font-normal">
                  Cancel
                </Text>
              </Pressable>

              {/* Title */}
              <View className="flex-1 items-center justify-center px-2">
                <Text
                  className="text-[17px] font-bold text-light-text-primary dark:text-dark-text-primary text-center"
                  numberOfLines={1}
                >
                  {isCreateMode ? "New Routine" : "Edit Routine"}
                </Text>
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleSave}
                hitSlop={16}
                className="min-w-17.5 h-full justify-center items-end active:opacity-60"
                disabled={!draftRoutine.title.trim()}
              >
                <Text
                  className={`text-[17px] font-bold ${
                    !draftRoutine.title.trim()
                      ? "text-light-text-light dark:text-dark-text-light opacity-50"
                      : "text-primary-600 dark:text-dark-primary"
                  }`}
                >
                  Save
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Routine Title Input - Fixed padding and height */}
          <View className="mx-5 my-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border-light dark:border-dark-border-medium overflow-hidden">
            <TextInput
              value={draftRoutine.title}
              onChangeText={updateDraftTitle}
              placeholder="Routine name (e.g., Upper Body)"
              className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary px-4 py-4"
              placeholderTextColor={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
              autoCapitalize="words"
              returnKeyType="done"
              blurOnSubmit
            />
          </View>

          {/* Exercise List - Scrollable with proper centering for empty state */}
          <View className="flex-1">
            {draftRoutine.exercises.length === 0 ? (
              <View className="flex-1 items-center justify-center px-5">
                <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-12 items-center shadow-sm dark:shadow-dark-sm border border-light-border-light dark:border-dark-border-medium max-w-xs">
                  <View className="w-20 h-20 rounded-full bg-light-bg-cream dark:bg-dark-bg-elevated items-center justify-center mb-4">
                    <Ionicons
                      name="barbell-outline"
                      size={40}
                      color={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
                    />
                  </View>
                  <Text className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2 text-center">
                    Start Building
                  </Text>
                  <Text className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
                    Add exercises below to create your routine
                  </Text>
                </View>
              </View>
            ) : (
              <DraggableFlatList
                data={draftRoutine.exercises}
                onDragEnd={({ data }) => reorderDraftExercises(data)}
                keyExtractor={(item) => item.id}
                renderItem={renderExerciseItem}
                contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              />
            )}
          </View>

          {/* Footer - Add Exercise Input (Fixed at bottom with safe area) */}
          <View
            className="bg-light-surface dark:bg-dark-surface border-t border-light-border-light dark:border-dark-border-medium px-4 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            {/* Add Exercise Input */}
            <View className="flex-row items-center gap-2 px-4 mb-2">
              <TextInput
                ref={exerciseInputRef}
                value={exerciseInputValue}
                onChangeText={setExerciseInputValue}
                onSubmitEditing={handleAddExercise}
                placeholder="Add exercise..."
                returnKeyType="done"
                className="flex-1 bg-light-bg-cream dark:bg-dark-bg-elevated rounded-xl px-4 py-4 text-base text-light-text-primary dark:text-dark-text-primary border border-light-border-light dark:border-dark-border-medium"
                placeholderTextColor={colorScheme === "dark" ? "#8e8e8e" : "#b5b5b5"}
                autoCapitalize="words"
                blurOnSubmit={false}
              />
              <Pressable
                onPress={handleAddExercise}
                disabled={!exerciseInputValue.trim()}
                className="w-14 h-14 bg-primary-500 dark:bg-dark-primary rounded-full items-center justify-center active:opacity-80 disabled:opacity-40 shadow-md dark:shadow-dark-md"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={28} color="#ffffff" />
              </Pressable>
            </View>

            {/* Delete Routine Button (Edit Mode Only) */}
            {draftRoutine.id && (
              <Pressable
                onPress={handleDeleteRoutine}
                className="w-full rounded-2xl py-4 mb-2 items-center justify-center active:opacity-80 border-2 border-red-300 dark:border-red-300"
              >
                <Text className="text-base font-bold text-red-500 dark:text-red-400">
                  Delete Routine
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
