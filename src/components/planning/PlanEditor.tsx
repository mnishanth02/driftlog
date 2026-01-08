import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { ThemedTextInput } from "@/components/ui";
import { formatDate } from "@/core/utils/helpers";
import { usePlanningStore } from "@/features/planning";
import type { PlannedExercise } from "@/features/planning/types";
import { BottomSheet } from "../ui/BottomSheet";
import { ExerciseList } from "./ExerciseList";

interface PlanEditorProps {
  visible: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
}

export function PlanEditor({ visible, onClose, date }: PlanEditorProps) {
  const {
    getPlanForDate,
    savePlan,
    deletePlan,
    replacePlannedExercises,
    activeDate,
    activeExercises,
    loadDay,
  } = usePlanningStore();
  const colorScheme = useColorScheme();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isRest, setIsRest] = useState(false);
  const [exercises, setExercises] = useState<Array<Pick<PlannedExercise, "id" | "name" | "note">>>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingPlan = getPlanForDate(date);
  const isEditing = !!existingPlan;

  // Theme colors
  const textColor = colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b";
  const secondaryTextColor = colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b";
  const separatorColor = colorScheme === "dark" ? "#3a3a3a" : "#e8e4df";

  // Load existing plan + exercises when editor opens
  useEffect(() => {
    if (visible) {
      if (activeDate !== date) {
        loadDay(date);
      }

      if (existingPlan) {
        setTitle(existingPlan.title);
        setNotes(existingPlan.notes || "");
        setIsRest(existingPlan.isRest || false);
      } else {
        setTitle("");
        setNotes("");
        setIsRest(false);
      }

      const sourceExercises = activeDate === date ? activeExercises : [];
      setExercises(
        sourceExercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((e) => ({ id: e.id, name: e.name, note: e.note })),
      );
    }
  }, [visible, existingPlan, activeDate, activeExercises, date, loadDay]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!isRest && !trimmedTitle) return;

    setIsSaving(true);
    try {
      const planId = await savePlan(
        date,
        isRest ? "Rest" : trimmedTitle,
        isRest ? null : notes.trim() || null,
        isRest,
      );

      // Persist planned exercises (only if not rest)
      if (!isRest) {
        await replacePlannedExercises(
          planId,
          exercises.map((e, idx) => ({
            id: e.id,
            name: e.name.trim(),
            note: e.note?.trim() ? e.note.trim() : null,
            order: idx,
          })),
        );
      } else {
        // Rest day: ensure exercises are cleared
        await replacePlannedExercises(planId, []);
      }

      handleClose();
    } catch (error) {
      console.error("Failed to save plan:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingPlan) return;

    setIsDeleting(true);
    try {
      await deletePlan(date);
      handleClose();
    } catch (error) {
      console.error("Failed to delete plan:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setTitle("");
    setNotes("");
    setIsRest(false);
    setExercises([]);
    onClose();
  };

  const canEditExercises = !isRest && !!title.trim();

  // Format date for display: "Mon, Jan 13"
  const dateDisplay = formatDate(date, "EEE, MMM d");

  return (
    <BottomSheet visible={visible} onClose={handleClose} height="70%">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header with Cancel and Save Actions */}
        <View
          style={{
            backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#faf4f0",
            borderBottomWidth: 1,
            borderBottomColor: separatorColor,
            paddingHorizontal: 20,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={handleClose} hitSlop={20} className="active:opacity-60">
            <Text style={{ color: secondaryTextColor, fontSize: 16, fontWeight: "500" }}>
              Cancel
            </Text>
          </Pressable>

          <View className="items-center">
            <Text
              style={{
                color: secondaryTextColor,
                fontSize: 10,
                fontWeight: "500",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Plan for
            </Text>
            <Text style={{ color: textColor, fontSize: 16, fontWeight: "700" }}>{dateDisplay}</Text>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={(!isRest && !title.trim()) || isSaving || isDeleting}
            hitSlop={20}
            className="active:opacity-60"
          >
            <Text
              style={{
                color:
                  (!isRest && !title.trim()) || isSaving || isDeleting
                    ? secondaryTextColor
                    : colorScheme === "dark"
                      ? "#ff9f6c"
                      : "#f4a261",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {isSaving ? "..." : isEditing ? "Update" : "Save"}
            </Text>
          </Pressable>
        </View>

        {/* Scrollable Form Content - Reduced padding */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-6">
            {/* Reduced from gap-8 to gap-6 */}
            {/* Rest Day Toggle Row */}
            <View
              key="rest-toggle"
              className="flex-row items-center justify-between p-4 rounded-2xl border"
              style={{
                backgroundColor: colorScheme === "dark" ? "#212121" : "#f9f5f1",
                borderColor: separatorColor,
              }}
            >
              <View className="flex-1 mr-4">
                <Text className="text-base font-semibold" style={{ color: textColor }}>
                  Rest Day
                </Text>
                <Text className="text-xs" style={{ color: secondaryTextColor }}>
                  No sessions or exercises planned
                </Text>
              </View>
              <Switch
                value={isRest}
                onValueChange={(val) => {
                  setIsRest(val);
                  if (val) {
                    setTitle("");
                    setNotes("");
                    setExercises([]);
                  }
                }}
                trackColor={{
                  false: "#d1cbc4",
                  true: colorScheme === "dark" ? "#ff9f6c" : "#f4a261",
                }}
                thumbColor={Platform.OS === "ios" ? undefined : isRest ? "#ffffff" : "#f4f3f4"}
              />
            </View>

            {/* Title Input */}
            <View className={isRest ? "opacity-30" : ""}>
              <Text className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                What's the intent?
              </Text>
              <ThemedTextInput
                value={title}
                onChangeText={setTitle}
                placeholder={isRest ? "Rest" : "e.g., Upper body strength"}
                autoFocus={!isRest && !isEditing}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isRest}
                maxLength={200}
              />
            </View>

            {/* Notes Input */}
            <View className={isRest ? "opacity-30" : ""}>
              <Text className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                Short note (optional)
              </Text>
              <ThemedTextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any specific focus for today..."
                multiline
                numberOfLines={3}
                returnKeyType="default"
                editable={!isRest}
                maxLength={500}
              />
            </View>

            {/* Exercises section - Flat list with inline composer */}
            <View className={isRest ? "opacity-30" : ""}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold" style={{ color: secondaryTextColor }}>
                  Exercises{exercises.length > 0 && !isRest ? ` (${exercises.length})` : ""}
                </Text>
              </View>

              {!canEditExercises && !isRest ? (
                <Text
                  className="text-xs text-center leading-relaxed py-4"
                  style={{ color: secondaryTextColor }}
                >
                  Enter an intent above to start adding exercises
                </Text>
              ) : (
                !isRest && (
                  <ExerciseList
                    exercises={exercises}
                    canEdit={canEditExercises}
                    onUpdateExercises={setExercises}
                  />
                )
              )}
            </View>

            {/* Delete Button at the bottom of ScrollView */}
            {isEditing && (
              <View className="mt-12 pt-8 border-t" style={{ borderTopColor: separatorColor }}>
                <Pressable
                  onPress={handleDelete}
                  disabled={isSaving || isDeleting}
                  className="py-4 items-center justify-center active:opacity-60"
                >
                  <Text className="text-red-500 font-semibold">
                    {isDeleting ? "Deleting..." : "Delete Daily Plan"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}
