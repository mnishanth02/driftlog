/**
 * Centralized date format strings for consistent date formatting across the app
 * Used with date-fns format() function
 */
export const DATE_FORMATS = {
  /** Full date with weekday: "Monday, January 12, 2026" */
  FULL_DATE: "EEEE, MMMM d, yyyy",
  /** Short date: "Jan 12" */
  SHORT_DATE: "MMM d",
  /** Month and day: "January 12" */
  MONTH_DAY: "MMMM d",
  /** Weekday and month/day: "Monday, January 12" */
  WEEKDAY_MONTH_DAY: "EEEE, MMMM d",
  /** 12-hour time: "3:45 PM" */
  TIME_12H: "h:mm a",
  /** ISO date for database: "2026-01-12" */
  ISO_DATE: "yyyy-MM-dd",
} as const;
