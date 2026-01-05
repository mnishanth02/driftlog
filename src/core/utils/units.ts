/**
 * Unit utilities for DriftLog
 * Following "store as-entered" principle - no conversion, just display
 */

/**
 * Format weight with unit suffix for display
 * @param weight - The weight value (nullable)
 * @param unit - The unit to display ("kg" or "lb")
 * @returns Formatted string or empty string if weight is null
 */
export function formatWeight(weight: number | null, unit: "kg" | "lb"): string {
  if (weight === null) return "";
  return `${weight} ${unit}`;
}

/**
 * Get weight placeholder text based on unit
 * @param unit - The unit ("kg" or "lb")
 * @returns Placeholder text for weight input
 */
export function getWeightPlaceholder(unit: "kg" | "lb"): string {
  return unit === "kg" ? "Weight (kg)" : "Weight (lb)";
}
