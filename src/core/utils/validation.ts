/**
 * Input validation utilities for DriftLog
 *
 * Provides validation and sanitization for user inputs to prevent:
 * - Script injection
 * - Invalid data entry
 * - Excessive input lengths
 */

import { logger } from "./logger";

// Constants for validation limits
const MAX_EXERCISE_NAME_LENGTH = 100;
const MAX_NOTES_LENGTH = 1000;
const MAX_REFLECTION_FEELING_LENGTH = 200;
const MAX_ROUTINE_TITLE_LENGTH = 100;

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Dangerous patterns that could indicate injection attempts
 * These are patterns commonly used in XSS or script injection
 */
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
  /javascript:/gi, // JavaScript protocol
  /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)
  /<iframe\b/gi, // Iframe tags
  /<object\b/gi, // Object tags
  /<embed\b/gi, // Embed tags
  /<link\b/gi, // Link tags (could load external resources)
  /data:/gi, // Data URIs (could contain scripts)
  /vbscript:/gi, // VBScript protocol
  /expression\s*\(/gi, // CSS expressions
  /url\s*\(/gi, // CSS url() - could be used for data exfiltration
];

/**
 * Characters that should be escaped or removed for safety
 */
const ESCAPE_CHARS: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
  "'": "&#x27;",
};

/**
 * Sanitize text by removing dangerous patterns and escaping special characters
 *
 * @param text - Input text to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text safe for storage and display
 */
export function sanitizeText(
  text: string,
  options: {
    escapeHtml?: boolean;
    removeControlChars?: boolean;
    trimWhitespace?: boolean;
  } = {},
): string {
  const { escapeHtml = true, removeControlChars = true, trimWhitespace = true } = options;

  let sanitized = text;

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      logger.warn("Dangerous pattern detected and removed during sanitization", "validation", {
        pattern: pattern.toString(),
      });
      sanitized = sanitized.replace(pattern, "");
    }
  }

  // Remove control characters (except newlines and tabs)
  if (removeControlChars) {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally removing control characters for sanitization
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  }

  // Escape HTML special characters
  if (escapeHtml) {
    sanitized = sanitized.replace(/[<>&"']/g, (char) => ESCAPE_CHARS[char] || char);
  }

  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }

  return sanitized;
}

/**
 * Validate and sanitize exercise name
 *
 * @param name - Exercise name to validate
 * @returns Validation result with sanitized name if valid
 */
export function validateExerciseName(name: string): ValidationResult {
  // Check for empty input
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: "Exercise name cannot be empty",
    };
  }

  // Sanitize the input
  const sanitized = sanitizeText(name);

  // Check length after sanitization
  if (sanitized.length === 0) {
    return {
      valid: false,
      error: "Exercise name contains only invalid characters",
    };
  }

  if (sanitized.length > MAX_EXERCISE_NAME_LENGTH) {
    return {
      valid: false,
      error: `Exercise name must be ${MAX_EXERCISE_NAME_LENGTH} characters or less`,
    };
  }

  // Check for minimum meaningful length
  if (sanitized.length < 2) {
    return {
      valid: false,
      error: "Exercise name must be at least 2 characters",
    };
  }

  return {
    valid: true,
    sanitized,
  };
}

/**
 * Validate and sanitize notes text
 *
 * @param notes - Notes text to validate
 * @returns Validation result with sanitized notes if valid
 */
export function validateNotes(notes: string): ValidationResult {
  // Empty notes are valid (optional field)
  if (!notes || notes.trim().length === 0) {
    return {
      valid: true,
      sanitized: "",
    };
  }

  // Sanitize the input (preserve newlines for notes)
  const sanitized = sanitizeText(notes, {
    escapeHtml: true,
    removeControlChars: true,
    trimWhitespace: true,
  });

  // Check length after sanitization
  if (sanitized.length > MAX_NOTES_LENGTH) {
    return {
      valid: false,
      error: `Notes must be ${MAX_NOTES_LENGTH} characters or less`,
    };
  }

  return {
    valid: true,
    sanitized,
  };
}

/**
 * Validate and sanitize reflection feeling text
 *
 * @param feeling - Feeling text to validate
 * @returns Validation result with sanitized feeling if valid
 */
export function validateReflectionFeeling(feeling: string): ValidationResult {
  // Empty feeling is valid (optional field)
  if (!feeling || feeling.trim().length === 0) {
    return {
      valid: true,
      sanitized: "",
    };
  }

  // Sanitize the input
  const sanitized = sanitizeText(feeling);

  // Check length after sanitization
  if (sanitized.length > MAX_REFLECTION_FEELING_LENGTH) {
    return {
      valid: false,
      error: `Feeling must be ${MAX_REFLECTION_FEELING_LENGTH} characters or less`,
    };
  }

  return {
    valid: true,
    sanitized,
  };
}

/**
 * Validate and sanitize routine title
 *
 * @param title - Routine title to validate
 * @returns Validation result with sanitized title if valid
 */
export function validateRoutineTitle(title: string): ValidationResult {
  // Check for empty input
  if (!title || title.trim().length === 0) {
    return {
      valid: false,
      error: "Routine title cannot be empty",
    };
  }

  // Sanitize the input
  const sanitized = sanitizeText(title);

  // Check length after sanitization
  if (sanitized.length === 0) {
    return {
      valid: false,
      error: "Routine title contains only invalid characters",
    };
  }

  if (sanitized.length > MAX_ROUTINE_TITLE_LENGTH) {
    return {
      valid: false,
      error: `Routine title must be ${MAX_ROUTINE_TITLE_LENGTH} characters or less`,
    };
  }

  // Check for minimum meaningful length
  if (sanitized.length < 2) {
    return {
      valid: false,
      error: "Routine title must be at least 2 characters",
    };
  }

  return {
    valid: true,
    sanitized,
  };
}

/**
 * Validate numeric input (reps, weight, etc.)
 *
 * @param value - Numeric value to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateNumericInput(
  value: number | string,
  options: {
    min?: number;
    max?: number;
    allowDecimal?: boolean;
    fieldName?: string;
  } = {},
): ValidationResult {
  const { min = 0, max = 10000, allowDecimal = true, fieldName = "Value" } = options;

  // Convert string to number if needed
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value;

  // Check for valid number
  if (Number.isNaN(numValue)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  // Check for integer if decimals not allowed
  if (!allowDecimal && !Number.isInteger(numValue)) {
    return {
      valid: false,
      error: `${fieldName} must be a whole number`,
    };
  }

  // Check range
  if (numValue < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  if (numValue > max) {
    return {
      valid: false,
      error: `${fieldName} must be no more than ${max}`,
    };
  }

  return {
    valid: true,
    sanitized: numValue.toString(),
  };
}

/**
 * Validation constants export for use in UI components
 */
export const VALIDATION_LIMITS = {
  MAX_EXERCISE_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_REFLECTION_FEELING_LENGTH,
  MAX_ROUTINE_TITLE_LENGTH,
} as const;
