import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { formatDate } from "@/core/utils/helpers";
import { usePlanningStore } from "@/features/planning";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";

interface PlanEditorProps {
  visible: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
}

export function PlanEditor({ visible, onClose, date }: PlanEditorProps) {
  const { getPlanForDate, savePlan, deletePlan } = usePlanningStore();
  const colorScheme = useColorScheme();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingPlan = getPlanForDate(date);
  const isEditing = !!existingPlan;

  // Theme colors
  const textColor = colorScheme === "dark" ? "#f5f5f5" : "#2b2b2b";
  const secondaryTextColor = colorScheme === "dark" ? "#b5b5b5" : "#6b6b6b";
  const inputBgColor = colorScheme === "dark" ? "#212121" : "#f9f5f1";
  const borderColor = colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4";
  const separatorColor = colorScheme === "dark" ? "#3a3a3a" : "#e8e4df";

  // Load existing plan data when editor opens
  useEffect(() => {
    if (visible) {
      if (existingPlan) {
        setTitle(existingPlan.title);
        setNotes(existingPlan.notes || "");
      } else {
        setTitle("");
        setNotes("");
      }
    }
  }, [visible, existingPlan]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setIsSaving(true);
    try {
      await savePlan(date, trimmedTitle, notes.trim() || null);
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
    onClose();
  };

  // Format date for display: "Mon, Jan 13"
  const dateDisplay = formatDate(date, "EEE, MMM d");

  return (
    <BottomSheet visible={visible} onClose={handleClose} height="70%">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={100}
      >
        {/* Enhanced Header with Date */}
        <View
          style={{
            backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#faf4f0",
            borderBottomWidth: 1,
            borderBottomColor: separatorColor,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          {/* Subtitle */}
          <Text
            style={{
              color: secondaryTextColor,
              fontSize: 12,
              fontWeight: "500",
              marginBottom: 4,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Plan for
          </Text>

          {/* Date Display */}
          <Text
            style={{
              color: textColor,
              fontSize: 24,
              fontWeight: "700",
              letterSpacing: -0.5,
            }}
          >
            {dateDisplay}
          </Text>
        </View>

        {/* Scrollable Form Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5">
            {/* Title Input */}
            <View>
              <Text className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                What's the intent?
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Upper body strength"
                placeholderTextColor="#8e8e8e"
                className="rounded-xl text-base"
                style={{
                  backgroundColor: inputBgColor,
                  color: textColor,
                  borderWidth: 2,
                  borderColor: borderColor,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  minHeight: 52,
                }}
                autoFocus
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            {/* Notes Input */}
            <View>
              <Text className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                Short note (optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any specific notes..."
                placeholderTextColor="#8e8e8e"
                multiline
                numberOfLines={4}
                className="rounded-xl text-base"
                style={{
                  backgroundColor: inputBgColor,
                  color: textColor,
                  borderWidth: 2,
                  borderColor: borderColor,
                  paddingHorizontal: 16,
                  paddingTop: 14,
                  paddingBottom: 14,
                  minHeight: 120,
                  textAlignVertical: "top",
                }}
                returnKeyType="default"
              />
            </View>
          </View>
        </ScrollView>

        {/* Fixed Actions at Bottom */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: separatorColor,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
            gap: 12,
          }}
        >
          {/* Save Button */}
          <Button
            title={isSaving ? "Saving..." : isEditing ? "Update Plan" : "Save Plan"}
            onPress={handleSave}
            variant="primary"
            disabled={!title.trim() || isSaving || isDeleting}
          />

          {/* Delete Button (only if editing) */}
          {isEditing && (
            <Button
              title={isDeleting ? "Deleting..." : "Delete Plan"}
              onPress={handleDelete}
              variant="ghost"
              disabled={isSaving || isDeleting}
            />
          )}

          {/* Cancel Button */}
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="secondary"
            disabled={isSaving || isDeleting}
          />
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}
