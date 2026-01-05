import { eachDayOfInterval, endOfWeek, format, parseISO, startOfWeek } from "date-fns";

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Get current ISO datetime string
 */
export function getNowString(): string {
  return new Date().toISOString();
}

/**
 * Format date string for display
 */
export function formatDate(dateString: string, formatString = "MMM d, yyyy"): string {
  return format(parseISO(dateString), formatString);
}

/**
 * Get week dates (Mon-Sun) for a given date
 */
export function getWeekDates(date: Date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

  return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((d) => format(d, "yyyy-MM-dd"));
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
