import { useEffect } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function BottomSheet({ visible, onClose, children, height = "60%" }: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const colorScheme = useColorScheme();

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
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, backdropOpacity, translateY]);

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
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor,
            },
            typeof height === "number" ? { height } : undefined,
          ]}
        >
          {/* Handle Bar */}
          <View className="items-center py-3">
            <View
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: colorScheme === "dark" ? "#3a3a3a" : "#d1cbc4" }}
            />
          </View>

          {/* Content */}
          <View className="flex-1">{children}</View>
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
    elevation: 8,
  },
});
