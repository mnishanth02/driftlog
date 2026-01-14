import { eachDayOfInterval, endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { DATE_FORMATS } from "./dateFormats";

// Re-export date formats for convenience
export { DATE_FORMATS } from "./dateFormats";

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return format(new Date(), DATE_FORMATS.ISO_DATE);
}

/**
 * Get current ISO datetime string
 */
export function getNowString(): string {
  return new Date().toISOString();
}

/**
 * Format date string for display
 * @param dateString ISO date string (YYYY-MM-DD)
 * @param formatString date-fns format string (defaults to SHORT_DATE)
 */
export function formatDate(
  dateString: string,
  formatString: string = DATE_FORMATS.SHORT_DATE,
): string {
  return format(parseISO(dateString), formatString);
}

/**
 * Get week dates (Mon-Sun) for a given date
 */
export function getWeekDates(date: Date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

  return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((d) =>
    format(d, DATE_FORMATS.ISO_DATE),
  );
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if two dates are in the same week (Monday to Sunday)
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const week1Start = startOfWeek(date1, { weekStartsOn: 1 });
  const week2Start = startOfWeek(date2, { weekStartsOn: 1 });
  return format(week1Start, DATE_FORMATS.ISO_DATE) === format(week2Start, DATE_FORMATS.ISO_DATE);
}

/**
 * Get week offset from current week
 * Returns: 0 for current week, -1 for previous, 1 for next, etc.
 */
export function getWeekOffset(date: Date): number {
  const today = new Date();
  const todayWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const dateWeekStart = startOfWeek(date, { weekStartsOn: 1 });

  const diffTime = dateWeekStart.getTime() - todayWeekStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.round(diffDays / 7);
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Calculate elapsed time in seconds since session start
 * Accounts for accumulated paused time
 * @param startTime ISO datetime when session/timer started
 * @param accumulatedPausedTime Total seconds the timer was paused
 * @returns Total elapsed seconds
 */
export function calculateElapsedSeconds(
  startTime: string,
  accumulatedPausedTime: number = 0,
): number {
  const now = new Date();
  const start = new Date(startTime);
  const wallClockElapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
  // Subtract paused time to get actual active time
  return Math.max(0, wallClockElapsed - accumulatedPausedTime);
}

/**
 * Format elapsed seconds into human-readable duration (e.g., "30 min", "1h 15m")
 */
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes} min`;
}
