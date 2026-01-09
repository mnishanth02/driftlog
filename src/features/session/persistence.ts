import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";
import type { SessionStore } from "./types";

/**
 * Storage key for persisted session state
 */
const SESSION_STORAGE_KEY = "@driftlog_active_session";

/**
 * Configuration for Zustand persist middleware
 *
 * Defines which state should be persisted and which should be omitted.
 * Used to restore session state after app restarts or crashes.
 */
export const sessionPersistConfig = {
  name: SESSION_STORAGE_KEY,
  storage: createJSONStorage(() => AsyncStorage),
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
   *
   * NOT persisted (reset on restart):
   * - autoEndTimerId: Will be recreated on restore
   * - timerWarningShown: Reset warning state on restart
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
  }),
};
