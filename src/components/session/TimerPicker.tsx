import { Pressable, Text, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useSessionStore } from "@/features/session";
import type { SessionDuration } from "@/features/settings/types";

interface TimerPickerProps {
  visible: boolean;
  onClose: () => void;
}

const DURATION_OPTIONS: { value: SessionDuration; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
];

export function TimerPicker({ visible, onClose }: TimerPickerProps) {
  const { targetDuration, resetTimerWithDuration } = useSessionStore();

  const handleSelect = (duration: SessionDuration) => {
    // Reset timer completely with new duration
    resetTimerWithDuration(duration);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Session Duration" height={380}>
      <View
        className="gap-3 pb-6"
        accessibilityRole="radiogroup"
        accessibilityLabel="Session duration options"
      >
        {DURATION_OPTIONS.map((option) => {
          const isSelected = targetDuration === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              android_ripple={{
                color: isSelected ? "rgba(255, 255, 255, 0.3)" : "rgba(244, 162, 97, 0.3)",
              }}
              className={`py-5 px-6 rounded-2xl border ${
                isSelected
                  ? "bg-primary-500 dark:bg-dark-primary border-primary-500 dark:border-dark-primary"
                  : "bg-light-surface dark:bg-dark-surface border-light-border-light dark:border-dark-border-medium"
              } active:opacity-70`}
              accessibilityRole="radio"
              accessibilityLabel={`${option.value} minutes`}
              accessibilityHint="Select session duration and reset timer"
              accessibilityState={{ checked: isSelected }}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text
                className={`text-xl text-center font-bold ${
                  isSelected ? "text-white" : "text-light-text-primary dark:text-dark-text-primary"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}
