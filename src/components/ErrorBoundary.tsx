import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error("ErrorBoundary caught error:", error, errorInfo);

    // In production, you could send to error tracking service
    // Example: Sentry.captureException(error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <View className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary items-center justify-center px-8">
      <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-8 items-center border border-light-border-light dark:border-dark-border-medium max-w-md">
        <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-6">
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
        </View>

        <Text className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 text-center">
          Something went wrong
        </Text>

        <Text className="text-base text-light-text-secondary dark:text-dark-text-secondary mb-6 text-center leading-relaxed">
          {error.message || "An unexpected error occurred"}
        </Text>

        <Pressable
          onPress={resetError}
          className="w-full bg-primary-500 dark:bg-dark-primary rounded-xl py-4 px-6 active:opacity-80"
        >
          <Text className="text-base font-bold text-white dark:text-dark-bg-primary text-center">
            Try Again
          </Text>
        </Pressable>

        {__DEV__ && (
          <View className="mt-6 p-4 bg-light-bg-cream dark:bg-dark-bg-secondary rounded-lg w-full">
            <Text className="text-xs font-mono text-light-text-tertiary dark:text-dark-text-tertiary">
              {error.stack?.substring(0, 200)}...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
