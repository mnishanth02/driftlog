/**
 * Production-aware logger utility
 *
 * Provides structured logging that respects production mode:
 * - In __DEV__ mode: logs everything to console
 * - In production: suppresses debug/info, only shows warn/error
 *
 * Also provides sanitization of sensitive data from logs.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Patterns that indicate sensitive data that should be sanitized
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /apikey/i,
  /api_key/i,
  /private/i,
];

/**
 * Sanitize potentially sensitive data from log entries
 * Replaces sensitive values with [REDACTED]
 */
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Check if key matches sensitive patterns
    const isSensitiveKey = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));

    if (isSensitiveKey) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeData(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      // Handle arrays - sanitize each object element
      sanitized[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? sanitizeData(item as Record<string, unknown>)
          : item,
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const parts = [`[${entry.level.toUpperCase()}]`];

  if (entry.context) {
    parts.push(`[${entry.context}]`);
  }

  parts.push(entry.message);

  return parts.join(" ");
}

/**
 * Console colors for different log levels
 */
const LEVEL_STYLES = {
  debug: "color: #6b7280", // gray
  info: "color: #3b82f6", // blue
  warn: "color: #f59e0b", // amber
  error: "color: #ef4444", // red
} as const;

/**
 * Create a log entry and output to console if appropriate
 */
function log(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>,
): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    data: data ? sanitizeData(data) : undefined,
    timestamp: new Date().toISOString(),
  };

  // In production, only show warn and error
  if (!__DEV__ && (level === "debug" || level === "info")) {
    return;
  }

  const formattedMessage = formatLogEntry(entry);
  const style = LEVEL_STYLES[level];

  switch (level) {
    case "debug":
      if (entry.data) {
        console.debug(`%c${formattedMessage}`, style, entry.data);
      } else {
        console.debug(`%c${formattedMessage}`, style);
      }
      break;
    case "info":
      if (entry.data) {
        console.info(`%c${formattedMessage}`, style, entry.data);
      } else {
        console.info(`%c${formattedMessage}`, style);
      }
      break;
    case "warn":
      if (entry.data) {
        console.warn(`%c${formattedMessage}`, style, entry.data);
      } else {
        console.warn(`%c${formattedMessage}`, style);
      }
      break;
    case "error":
      if (entry.data) {
        console.error(`%c${formattedMessage}`, style, entry.data);
      } else {
        console.error(`%c${formattedMessage}`, style);
      }
      break;
  }
}

/**
 * Production-aware logger
 *
 * Usage:
 * ```typescript
 * import { logger } from "@/core/utils/logger";
 *
 * logger.debug("Debug message"); // Only in __DEV__
 * logger.info("Info message", "ComponentName"); // Only in __DEV__
 * logger.warn("Warning", "Context", { userId: "123" }); // Always
 * logger.error("Error occurred", "Context", { error: err }); // Always
 * ```
 */
export const logger = {
  /**
   * Debug level - only shown in development
   * Use for detailed debugging information
   */
  debug: (message: string, context?: string, data?: Record<string, unknown>) => {
    log("debug", message, context, data);
  },

  /**
   * Info level - only shown in development
   * Use for general information about app flow
   */
  info: (message: string, context?: string, data?: Record<string, unknown>) => {
    log("info", message, context, data);
  },

  /**
   * Warning level - always shown
   * Use for potential issues that don't prevent operation
   */
  warn: (message: string, context?: string, data?: Record<string, unknown>) => {
    log("warn", message, context, data);
  },

  /**
   * Error level - always shown
   * Use for errors that affect functionality
   */
  error: (message: string, context?: string, data?: Record<string, unknown>) => {
    log("error", message, context, data);
  },

  /**
   * Log an Error object with proper formatting
   * Extracts message and stack trace
   */
  logError: (error: Error, context?: string, additionalData?: Record<string, unknown>) => {
    log("error", error.message, context, {
      name: error.name,
      stack: error.stack,
      ...additionalData,
    });
  },
};

export default logger;
