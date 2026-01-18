import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";
import { logger } from "../../core/utils/logger";
import { secureStorage } from "../../core/utils/secureStorage";
import type { SessionStore } from "./types";

/**
 * Storage key for persisted session state
 * Note: SecureStore only allows alphanumeric, ".", "-", and "_" characters
 */
const SESSION_STORAGE_KEY = "driftlog_active_session";

/**
 * Flag to determine if we should use secure storage
 * Set to true when expo-secure-store is installed and working
 */
const USE_SECURE_STORAGE = true;

/**
 * Utility function to clear session storage
 * Use this BEFORE navigating to a new session to prevent race conditions
 */
export async function clearSessionStorage(): Promise<void> {
  try {
    if (USE_SECURE_STORAGE) {
      await secureStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (error) {
    logger.error("Failed to clear session storage", "sessionPersistence", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Configuration for Zustand persist middleware
 *
 * Defines which state should be persisted and which should be omitted.
 * Used to restore session state after app restarts or crashes.
 *
 * Uses secure storage (expo-secure-store) when available to protect
 * session data at rest. Falls back to AsyncStorage if secure storage
 * is not available.
 */
export const sessionPersistConfig = {
  name: SESSION_STORAGE_KEY,
  storage: createJSONStorage(() => (USE_SECURE_STORAGE ? secureStorage : AsyncStorage)),
  /**
   * Partition state into persisted and non-persisted parts
   *
   * Persisted:
   * - activeSessionId: Need to know if there's an active session
   * - currentRoutineId: To restore routine association
   * - currentRoutineTitle: For display
   * - currentExercises: User's workout data
   * - activeExerciseIndex: To restore focus
   * - isSessionActive: Session status
   * - sessionStartTime: For timer calculation
   * - timerStartTime: For timer display
   * - targetDuration: Session goal
   * - lastActivityTimestamp: For auto-end timer calculation
   * - isTimerPaused: Timer pause state
   * - pausedAt: When timer was paused
   * - accumulatedPausedTime: Total paused time accumulation
   *
   * NOT persisted (reset on restart):
   * - autoEndTimerId: Will be recreated on restore
   * - timerWarningShown: Reset warning state on restart
   * - hasHydrated: Internal tracking flag
   */
  partialize: (state: SessionStore) => ({
    activeSessionId: state.activeSessionId,
    currentRoutineId: state.currentRoutineId,
    currentRoutineTitle: state.currentRoutineTitle,
    currentExercises: state.currentExercises,
    activeExerciseIndex: state.activeExerciseIndex,
    isSessionActive: state.isSessionActive,
    sessionStartTime: state.sessionStartTime,
    timerStartTime: state.timerStartTime,
    targetDuration: state.targetDuration,
    lastActivityTimestamp: state.lastActivityTimestamp,
    isTimerPaused: state.isTimerPaused,
    pausedAt: state.pausedAt,
    accumulatedPausedTime: state.accumulatedPausedTime,
  }),
  /**
   * Track when rehydration completes to prevent race conditions
   * Sets hasHydrated flag after AsyncStorage data is loaded
   * If an active session is found, sets isResumedFromKill flag (app was killed/restarted)
   */
  onRehydrateStorage: () => (state: SessionStore | undefined) => {
    if (state) {
      state.hasHydrated = true;
      // Set isResumedFromKill ONLY if there's an active session being restored
      if (state.isSessionActive && state.activeSessionId) {
        state.isResumedFromKill = true;
      }
    }
  },
};
