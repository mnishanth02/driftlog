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

/**
 * Check if two dates are in the same week (Monday to Sunday)
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const week1Start = startOfWeek(date1, { weekStartsOn: 1 });
  const week2Start = startOfWeek(date2, { weekStartsOn: 1 });
  return format(week1Start, "yyyy-MM-dd") === format(week2Start, "yyyy-MM-dd");
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
