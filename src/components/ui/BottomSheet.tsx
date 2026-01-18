import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/core/contexts/ThemeContext";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | string;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  height = "60%",
}: BottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useSharedValue(windowHeight);
  const backdropOpacity = useSharedValue(0);
  const { colorScheme } = useTheme();

  // Define actual color values based on theme
  const backgroundColor = colorScheme === "dark" ? "#252525" : "#ffffff";

  useEffect(() => {
    if (visible) {
      // Animate in with subtle spring
      translateY.value = withSpring(0, {
        damping: 30, // Increased from 20 for less bounce
        stiffness: 300, // Increased from 200 for snappier feel
        mass: 0.8, // Added mass for smoother movement
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      // Animate out
      translateY.value = withTiming(windowHeight, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, backdropOpacity, translateY, windowHeight]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
            android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
            accessibilityRole="button"
            accessibilityLabel="Close bottom sheet"
            accessibilityHint="Tap to close this dialog"
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor,
            },
            height ? { height: typeof height === "number" ? height : undefined } : undefined,
          ]}
        >
          {/* Handle Bar */}
          <View className="items-center py-3">
            <View className="w-12 h-1 rounded-full bg-light-border-medium dark:bg-dark-border-medium" />
          </View>

          {/* Title */}
          {title && (
            <View className="px-5 pb-4">
              <Text className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary text-center">
                {title}
              </Text>
            </View>
          )}

          {/* Content */}
          <View className="flex-1 px-5">{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Increased from 0.5 for better contrast
  },
  sheet: {
    minHeight: "60%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
});
