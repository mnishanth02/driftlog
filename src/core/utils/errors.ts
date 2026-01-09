import { Alert } from "react-native";

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly userMessage: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation errors (user input, state validation)
 */
export class ValidationError extends AppError {
  constructor(message: string, userMessage: string, context?: Record<string, unknown>) {
    super(message, userMessage, "VALIDATION_ERROR", context);
  }
}

/**
 * Database operation errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "Database operation failed. Please try again.", "DATABASE_ERROR", context);
  }
}

/**
 * Session-related errors (lifecycle, state management)
 */
export class SessionError extends AppError {
  constructor(message: string, userMessage: string, context?: Record<string, unknown>) {
    super(message, userMessage, "SESSION_ERROR", context);
  }
}

/**
 * Error logging levels
 */
export enum ErrorLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

/**
 * Log error to console with context
 * In production, this could be replaced with a logging service (Sentry, etc.)
 *
 * @param error - Error to log
 * @param context - Additional context (component name, user action, etc.)
 * @param metadata - Additional metadata (user id, session id, etc.)
 * @param level - Error severity level
 */
export function logError(
  error: Error | AppError,
  context: string,
  metadata?: Record<string, unknown>,
  level: ErrorLevel = ErrorLevel.ERROR,
): void {
  const timestamp = new Date().toISOString();

  const _logEntry = {
    timestamp,
    level,
    context,
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...(error instanceof AppError && {
      code: error.code,
      userMessage: error.userMessage,
      errorContext: error.context,
    }),
    metadata,
  };

  // Console logging with colors
  const levelColors = {
    [ErrorLevel.INFO]: "color: #3b82f6",
    [ErrorLevel.WARNING]: "color: #f59e0b",
    [ErrorLevel.ERROR]: "color: #ef4444",
    [ErrorLevel.CRITICAL]: "color: #dc2626; font-weight: bold",
  };

  console.group(`%c[${level}] ${context}`, levelColors[level]);
  console.error(error);
  if (metadata) {
    console.log("Metadata:", metadata);
  }
  if (error instanceof AppError && error.context) {
    console.log("Error Context:", error.context);
  }
  console.groupEnd();

  // TODO: In production, send to error tracking service
  // Example: Sentry.captureException(error, { contexts: { custom: logEntry } });
}

/**
 * Show user-friendly error alert
 *
 * @param error - Error to display
 * @param context - Context where error occurred (for logging)
 * @param metadata - Additional metadata for logging
 * @param onDismiss - Callback when alert is dismissed
 */
export function showErrorAlert(
  error: Error | AppError,
  context: string,
  metadata?: Record<string, unknown>,
  onDismiss?: () => void,
): void {
  // Log error first
  logError(error, context, metadata);

  // Determine user-facing message
  const userMessage =
    error instanceof AppError
      ? error.userMessage
      : "An unexpected error occurred. Please try again.";

  // Show alert
  Alert.alert("Error", userMessage, [{ text: "OK", onPress: onDismiss }]);
}

/**
 * Show user-friendly warning alert (non-error scenarios)
 *
 * @param title - Alert title
 * @param message - Alert message
 * @param onDismiss - Callback when dismissed
 */
export function showWarningAlert(title: string, message: string, onDismiss?: () => void): void {
  Alert.alert(title, message, [{ text: "OK", onPress: onDismiss }]);
}

/**
 * Show confirmation dialog
 *
 * @param title - Confirmation title
 * @param message - Confirmation message
 * @param onConfirm - Callback when confirmed
 * @param onCancel - Callback when cancelled
 * @param confirmText - Text for confirm button (default: "Confirm")
 * @param cancelText - Text for cancel button (default: "Cancel")
 * @param destructive - Whether confirm action is destructive (default: false)
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
): void {
  Alert.alert(title, message, [
    { text: cancelText, style: "cancel", onPress: onCancel },
    {
      text: confirmText,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}

/**
 * Wrap async function with error handling
 * Useful for event handlers and callbacks
 *
 * @param fn - Async function to wrap
 * @param context - Context for error logging
 * @param onError - Optional custom error handler
 * @returns Wrapped function
 */
export function withErrorHandling<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  context: string,
  onError?: (error: Error) => void,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (onError) {
        onError(err);
      } else {
        showErrorAlert(err, context);
      }
    }
  }) as T;
}

/**
 * Assert condition and throw ValidationError if false
 *
 * @param condition - Condition to assert
 * @param message - Developer message
 * @param userMessage - User-facing message
 * @param context - Additional context
 */
export function assert(
  condition: boolean,
  message: string,
  userMessage: string,
  context?: Record<string, unknown>,
): asserts condition {
  if (!condition) {
    throw new ValidationError(message, userMessage, context);
  }
}
