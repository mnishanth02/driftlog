import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { ThemedTextInput } from "@/components/ui";
import type { PlannedExercise } from "@/features/planning/types";

interface ExerciseListProps {
  exercises: Array<Pick<PlannedExercise, "id" | "name" | "note">>;
  canEdit: boolean;
  onUpdateExercises: (exercises: Array<Pick<PlannedExercise, "id" | "name" | "note">>) => void;
}

export function ExerciseList({ exercises, canEdit, onUpdateExercises }: ExerciseListProps) {
  const colorScheme = useColorScheme();
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseNote, setNewExerciseNote] = useState("");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState("");
  const [editingExerciseNote, setEditingExerciseNote] = useState("");

  const textPrimary = colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b";
  const textSecondary = colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b";
  const textTertiary = colorScheme === "dark" ? "#8e8e8e" : "#8e8e8e";
  const borderColor = colorScheme === "dark" ? "#2f2f2f" : "#e8e4df";
  const primaryColor = colorScheme === "dark" ? "#ff9f6c" : "#f4a261";

  const handleAddExercise = () => {
    const name = newExerciseName.trim();
    if (!name) return;

    onUpdateExercises([
      ...exercises,
      {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        note: newExerciseNote.trim() || null,
      },
    ]);

    setNewExerciseName("");
    setNewExerciseNote("");
    setIsAddingExercise(false);
  };

  const handleLongPress = (exercise: Pick<PlannedExercise, "id" | "name" | "note">) => {
    if (!canEdit) return;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Edit", "Reorder", "Remove"],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setEditingExerciseId(exercise.id);
            setEditingExerciseName(exercise.name);
            setEditingExerciseNote(exercise.note || "");
          } else if (buttonIndex === 2) {
            setDraggedItemId(exercise.id);
          } else if (buttonIndex === 3) {
            handleRemoveExercise(exercise.id);
          }
        },
      );
    } else {
      Alert.alert(
        exercise.name,
        "Choose an action",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Edit",
            onPress: () => {
              setEditingExerciseId(exercise.id);
              setEditingExerciseName(exercise.name);
              setEditingExerciseNote(exercise.note || "");
            },
          },
          { text: "Reorder", onPress: () => setDraggedItemId(exercise.id) },
          {
            text: "Remove",
            onPress: () => handleRemoveExercise(exercise.id),
            style: "destructive",
          },
        ],
        { cancelable: true },
      );
    }
  };

  const handleSaveEdit = () => {
    const id = editingExerciseId;
    if (!id) return;

    const name = editingExerciseName.trim();
    if (!name) return;

    const note = editingExerciseNote.trim() || null;

    onUpdateExercises(exercises.map((e) => (e.id === id ? { ...e, name, note } : e)));
    setEditingExerciseId(null);
    setEditingExerciseName("");
    setEditingExerciseNote("");
  };

  const handleCancelEdit = () => {
    setEditingExerciseId(null);
    setEditingExerciseName("");
    setEditingExerciseNote("");
  };

  const handleRemoveExercise = (id: string) => {
    if (editingExerciseId === id) {
      handleCancelEdit();
    }
    onUpdateExercises(exercises.filter((e) => e.id !== id));
  };

  const handleReorderExercise = (id: string, direction: "up" | "down") => {
    const idx = exercises.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const nextIdx = direction === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= exercises.length) return;
    const copy = exercises.slice();
    const temp = copy[idx];
    copy[idx] = copy[nextIdx];
    copy[nextIdx] = temp;
    onUpdateExercises(copy);
  };

  return (
    <View className="gap-1">
      {/* Flat exercise list with dividers */}
      {exercises.length > 0 ? (
        <View>
          {exercises.map((exercise, idx) => {
            const isLastItem = idx === exercises.length - 1;
            const isDragging = draggedItemId === exercise.id;
            const isEditing = editingExerciseId === exercise.id;
            return (
              <View key={exercise.id}>
                <LongPressGestureHandler
                  onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === State.ACTIVE) {
                      handleLongPress(exercise);
                    }
                  }}
                  minDurationMs={500}
                >
                  <Pressable className="py-3 px-1 active:opacity-70" disabled={!canEdit}>
                    {isEditing ? (
                      <View className="gap-2">
                        <ThemedTextInput
                          value={editingExerciseName}
                          onChangeText={setEditingExerciseName}
                          placeholder="Exercise name"
                          autoFocus
                          returnKeyType="next"
                          blurOnSubmit={false}
                          maxLength={120}
                        />
                        <ThemedTextInput
                          value={editingExerciseNote}
                          onChangeText={setEditingExerciseNote}
                          placeholder="Optional note"
                          returnKeyType="done"
                          onSubmitEditing={handleSaveEdit}
                          maxLength={300}
                        />
                        <View className="flex-row justify-end gap-2">
                          <Pressable
                            onPress={handleCancelEdit}
                            className="w-9 h-9 items-center justify-center rounded-full active:opacity-70"
                            style={{ backgroundColor: borderColor }}
                            accessibilityLabel="Cancel edit"
                          >
                            <Ionicons name="close" size={18} color={textSecondary} />
                          </Pressable>
                          <Pressable
                            onPress={handleSaveEdit}
                            disabled={!editingExerciseName.trim()}
                            className="w-9 h-9 items-center justify-center rounded-full active:opacity-70 disabled:opacity-30"
                            style={{ backgroundColor: borderColor }}
                            accessibilityLabel="Save edit"
                          >
                            <Ionicons name="checkmark" size={18} color={primaryColor} />
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text
                            className="text-base font-medium"
                            style={{ color: textPrimary, lineHeight: 22 }}
                          >
                            {exercise.name}
                          </Text>
                          {exercise.note && (
                            <Text
                              className="text-sm mt-1"
                              style={{ color: textTertiary, lineHeight: 18 }}
                            >
                              {exercise.note}
                            </Text>
                          )}
                        </View>

                        {isDragging && (
                          <View className="flex-row gap-2 ml-3">
                            <Pressable
                              onPress={() => handleReorderExercise(exercise.id, "up")}
                              disabled={idx === 0}
                              className="w-8 h-8 items-center justify-center rounded-full active:opacity-70 disabled:opacity-30"
                              style={{ backgroundColor: borderColor }}
                            >
                              <Ionicons name="chevron-up" size={16} color={textSecondary} />
                            </Pressable>
                            <Pressable
                              onPress={() => handleReorderExercise(exercise.id, "down")}
                              disabled={idx === exercises.length - 1}
                              className="w-8 h-8 items-center justify-center rounded-full active:opacity-70 disabled:opacity-30"
                              style={{ backgroundColor: borderColor }}
                            >
                              <Ionicons name="chevron-down" size={16} color={textSecondary} />
                            </Pressable>
                            <Pressable
                              onPress={() => setDraggedItemId(null)}
                              className="w-8 h-8 items-center justify-center rounded-full active:opacity-70"
                              style={{ backgroundColor: borderColor }}
                            >
                              <Ionicons name="checkmark" size={16} color={primaryColor} />
                            </Pressable>
                          </View>
                        )}
                      </View>
                    )}
                  </Pressable>
                </LongPressGestureHandler>
                {!isLastItem && (
                  <View
                    className="h-px"
                    style={{ backgroundColor: borderColor, marginLeft: 4, marginRight: 4 }}
                  />
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View className="py-4">
          <Text className="text-sm text-center" style={{ color: textSecondary }}>
            No exercises added yet
          </Text>
        </View>
      )}
      {/* Add exercise inline composer */}
      {!isAddingExercise && canEdit && (
        <Pressable
          onPress={() => setIsAddingExercise(true)}
          className="py-3 px-1 active:opacity-70 mt-2"
        >
          <Text className="text-base font-medium" style={{ color: primaryColor }}>
            + Add exercise
          </Text>
        </Pressable>
      )}
      {/* Inline add form (expanded) */}
      {isAddingExercise && (
        <View
          className="gap-2 mt-2 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: borderColor }}
        >
          <ThemedTextInput
            value={newExerciseName}
            onChangeText={setNewExerciseName}
            placeholder="Exercise name"
            autoFocus
            returnKeyType="next"
            blurOnSubmit={false}
            maxLength={120}
          />
          {newExerciseName.trim() && (
            <ThemedTextInput
              value={newExerciseNote}
              onChangeText={setNewExerciseNote}
              placeholder="Optional note"
              multiline
              numberOfLines={2}
              returnKeyType="done"
              onSubmitEditing={handleAddExercise}
              maxLength={300}
            />
          )}
          <View className="flex-row gap-2 mt-1">
            <Pressable
              onPress={handleAddExercise}
              disabled={!newExerciseName.trim()}
              className="flex-1 py-3 rounded-xl items-center justify-center active:opacity-70 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              <Text className="text-base font-semibold" style={{ color: "#ffffff" }}>
                Add
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsAddingExercise(false);
                setNewExerciseName("");
                setNewExerciseNote("");
              }}
              className="flex-1 py-3 rounded-xl items-center justify-center active:opacity-70"
              style={{ backgroundColor: borderColor }}
            >
              <Text className="text-base font-semibold" style={{ color: textSecondary }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
