import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Animated, View, type ViewProps } from "react-native";

interface SkeletonProps extends ViewProps {
  className?: string;
  /** Disable shimmer animation (useful for reduced motion) */
  disableAnimation?: boolean;
}

export function Skeleton({ className = "", disableAnimation = false, ...props }: SkeletonProps) {
  const { colorScheme } = useColorScheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (disableAnimation) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnim, disableAnimation]);

  // Theme-aware colors
  const baseColor = colorScheme === "dark" ? "#2f2f2f" : "#e8e4df";
  const highlightColor = colorScheme === "dark" ? "#3a3a3a" : "#f5f1ed";

  const animatedStyle = {
    backgroundColor: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [baseColor, highlightColor],
    }),
  };

  if (disableAnimation) {
    return (
      <View
        className={ `bg-light-border-light dark:bg-dark-border-light opacity-60 ${className}` }
        { ...props }
      />
    );
  }

  return (
    <Animated.View
      className={ `rounded-lg overflow-hidden ${className}` }
      style={ [animatedStyle, props.style] }
      { ...props }
    />
  );
}
