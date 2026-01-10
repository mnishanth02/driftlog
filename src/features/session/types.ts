import type { SessionDuration } from "../settings/types";

export type ExerciseStatus = "pending" | "active" | "completed";

export type SessionState = {
  activeSessionId: string | null;
  currentRoutineId: string | null;
  currentRoutineTitle: string | null;
  currentExercises: ExerciseLog[];
  activeExerciseIndex: number; // Index of currently focused exercise
  isSessionActive: boolean;
  sessionStartTime: string | null;
  timerStartTime: string | null; // Separate from sessionStartTime - resets when duration changes
  targetDuration: SessionDuration; // Target duration for this session
  lastActivityTimestamp: string | null;
  autoEndTimerId: ReturnType<typeof setTimeout> | null;
  timerWarningShown: boolean; // Whether we've shown the time's up warning
  hasHydrated: boolean; // Tracks if Zustand has finished rehydrating from AsyncStorage
  isResumedFromKill: boolean; // True only when app relaunches with active session (not tab navigation)

  // Timer pause/play state
  isTimerPaused: boolean; // Whether timer is currently paused
  pausedAt: string | null; // ISO datetime when timer was paused
  accumulatedPausedTime: number; // Total seconds paused (accumulates across multiple pause/resume cycles)
};

export type ExerciseLog = {
  id: string;
  name: string;
  sets: SetLog[];
  order: number;
  completedAt: string | null; // ISO datetime when completed
};

export type SetLog = {
  id: string;
  reps: number;
  weight: number | null;
  order: number;
  timestamp: string;
};

export type SessionActions = {
  // Session lifecycle
  startSession: () => Promise<string>;
  startSessionFromRoutine: (routineId: string) => Promise<string>;
  endSession: () => Promise<void>;
  clearSession: () => Promise<void>;

  // Exercise management
  addExercise: (name: string) => void;
  toggleExerciseComplete: (exerciseId: string) => Promise<void>;
  reorderExercises: (exercises: ExerciseLog[]) => void;
  setActiveExerciseIndex: (index: number) => void;

  // Note: Set management functions will be added when set logging UI is implemented

  // Timer management
  setTargetDuration: (duration: SessionDuration) => void;
  resetTimerWithDuration: (duration: SessionDuration) => void; // Resets timer completely with new duration
  resetActivityTimer: () => void;
  setTimerWarningShown: (shown: boolean) => void;

  // Timer pause/play
  pauseTimer: () => void;
  resumeTimer: () => void;
  toggleTimerPause: () => void;

  // App lifecycle
  dismissResumedFromKillBanner: () => void;
};

export type SessionStore = SessionState & SessionActions;
