import { useEffect, useState } from "react";
import { formatTime } from "@/core/utils/helpers";

export interface UseSessionTimerOptions {
  /** ISO datetime string when timer started */
  startTime: string | null;
  /** Target duration in minutes */
  targetDuration: number;
  /** Callback when target time is reached (called once) */
  onTimeUp?: () => void;
  /** Whether timer is active (pauses when false) */
  isActive?: boolean;
}

export interface UseSessionTimerResult {
  /** Total elapsed seconds since start */
  elapsedSeconds: number;
  /** Seconds remaining until target (negative if overtime) */
  remainingSeconds: number;
  /** Whether timer has exceeded target duration */
  isOvertime: boolean;
  /** Formatted time string (MM:SS) for remaining time */
  formattedRemaining: string;
  /** Formatted time string (MM:SS) for elapsed time */
  formattedElapsed: string;
  /** Elapsed minutes (for display) */
  elapsedMinutes: number;
  /** Target time in seconds */
  targetSeconds: number;
}

/**
 * Custom hook for session timer management
 *
 * Handles countdown/countup timer logic with automatic updates every second.
 * Tracks elapsed time, remaining time, and overtime status.
 *
 * @param options - Timer configuration
 * @returns Timer state and formatted values
 *
 * @example
 * ```tsx
 * const { elapsedSeconds, remainingSeconds, isOvertime, formattedRemaining } = useSessionTimer({
 *   startTime: session.startTime,
 *   targetDuration: 60,
 *   onTimeUp: () => console.log("Time's up!"),
 * });
 * ```
 */
export function useSessionTimer({
  startTime,
  targetDuration,
  onTimeUp,
  isActive = true,
}: UseSessionTimerOptions): UseSessionTimerResult {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasCalledTimeUp, setHasCalledTimeUp] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime || !isActive) {
      setElapsedSeconds(0);
      setHasCalledTimeUp(false);
      return;
    }

    const startTimeMs = new Date(startTime).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeMs) / 1000);
      setElapsedSeconds(elapsed);
    };

    // Update immediately
    updateElapsed();

    // Then update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  // Calculate derived values
  const targetSeconds = targetDuration * 60;
  const remainingSeconds = targetSeconds - elapsedSeconds;
  const isOvertime = remainingSeconds < 0;
  const elapsedMinutes = elapsedSeconds / 60;

  // Call onTimeUp callback once when time runs out
  useEffect(() => {
    if (isOvertime && !hasCalledTimeUp && onTimeUp) {
      setHasCalledTimeUp(true);
      onTimeUp();
    }

    // Reset if user extends time (remaining becomes positive again)
    if (!isOvertime && hasCalledTimeUp) {
      setHasCalledTimeUp(false);
    }
  }, [isOvertime, hasCalledTimeUp, onTimeUp]);

  // Format time strings
  const displaySeconds = Math.abs(remainingSeconds);
  const formattedRemaining = formatTime(displaySeconds);
  const formattedElapsed = formatTime(elapsedSeconds);

  return {
    elapsedSeconds,
    remainingSeconds,
    isOvertime,
    formattedRemaining,
    formattedElapsed,
    elapsedMinutes,
    targetSeconds,
  };
}
