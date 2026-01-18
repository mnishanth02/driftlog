import { eq } from "drizzle-orm";
import { Alert } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db, waitForDb } from "../../core/db";
import { exercises, routineExercises, routines, sessions, sets } from "../../core/db/schema";
import { generateId, getNowString, getTodayString } from "../../core/utils/helpers";
import { logger } from "../../core/utils/logger";
import { validateExerciseName } from "../../core/utils/validation";
import { useSettingsStore } from "../settings";
import { clearSessionStorage, sessionPersistConfig } from "./persistence";
import type { ExerciseLog, SessionStore } from "./types";

// Constants
const AUTO_END_MIN_TO_MS = 60000; // Convert minutes to milliseconds

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // State
      activeSessionId: null,
      currentRoutineId: null,
      currentRoutineTitle: null,
      currentExercises: [],
      activeExerciseIndex: 0,
      isSessionActive: false,
      sessionStartTime: null,
      timerStartTime: null, // Separate timer that resets when duration changes
      targetDuration: 60,
      lastActivityTimestamp: null,
      autoEndTimerId: null,
      timerWarningShown: false,
      hasHydrated: false, // Will be set to true after rehydration completes
      isResumedFromKill: false, // Set to true when app relaunches with active session

      // Timer pause/play state
      isTimerPaused: true, // Start paused by default
      pausedAt: null,
      accumulatedPausedTime: 0,

      // Actions

      startSession: async () => {
        // Wait for hydration to complete to avoid race conditions
        const waitForHydration = async () => {
          const maxWait = 1000; // 1 second max
          const startTime = Date.now();
          while (!get().hasHydrated && Date.now() - startTime < maxWait) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        };
        await waitForHydration();

        // Prevent concurrent sessions
        const currentState = get();
        if (currentState.isSessionActive) {
          logger.warn("Session already active, ignoring duplicate start request", "startSession");
          // Return existing session ID instead of creating duplicate
          if (currentState.activeSessionId) {
            return currentState.activeSessionId;
          }
          Alert.alert(
            "Session Already Active",
            "You have a workout in progress. Please end it before starting a new one.",
            [{ text: "OK" }],
          );
          throw new Error("A session is already active. End it first.");
        }

        const sessionId = generateId();
        const now = getNowString();
        const today = getTodayString();
        const { sessionDuration } = useSettingsStore.getState();

        try {
          // Wait for database to be initialized before querying
          await waitForDb();

          await db.insert(sessions).values({
            id: sessionId,
            date: today,
            startTime: now,
            endTime: null,
            isActive: true,
            routineId: null,
            targetDuration: sessionDuration,
            createdAt: now,
            updatedAt: now,
          });

          set({
            activeSessionId: sessionId,
            currentRoutineId: null,
            currentRoutineTitle: null,
            isSessionActive: true,
            currentExercises: [],
            activeExerciseIndex: 0,
            sessionStartTime: now,
            timerStartTime: null, // Don't start timer until user clicks play
            targetDuration: sessionDuration,
            lastActivityTimestamp: now,
            timerWarningShown: false,
            isTimerPaused: true, // Start paused by default
            pausedAt: null, // No pause time until timer starts
            accumulatedPausedTime: 0,
          });

          get().resetActivityTimer();
          return sessionId;
        } catch (error) {
          logger.logError(
            error instanceof Error ? error : new Error(String(error)),
            "startSession",
          );
          throw error;
        }
      },

      startSessionFromRoutine: async (routineId: string) => {
        // Wait for hydration to complete to avoid race conditions
        const waitForHydration = async () => {
          const maxWait = 1000; // 1 second max
          const startTime = Date.now();
          while (!get().hasHydrated && Date.now() - startTime < maxWait) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        };
        await waitForHydration();

        // Prevent concurrent sessions
        const currentState = get();
        if (currentState.isSessionActive) {
          logger.warn(
            "Session already active, ignoring duplicate routine start request",
            "startSessionFromRoutine",
          );
          // Return existing session ID instead of creating duplicate
          if (currentState.activeSessionId) {
            return currentState.activeSessionId;
          }
          Alert.alert(
            "Session Already Active",
            "You have a workout in progress. Please end it before starting a new one.",
            [{ text: "OK" }],
          );
          throw new Error("A session is already active. End it first.");
        }

        const sessionId = generateId();
        const now = getNowString();
        const today = getTodayString();
        const { sessionDuration } = useSettingsStore.getState();

        try {
          // Wait for database to be initialized before querying
          await waitForDb();

          const routine = await db.query.routines.findFirst({
            where: eq(routines.id, routineId),
          });

          if (!routine) {
            throw new Error("Routine not found");
          }

          const routineExercisesList = await db.query.routineExercises.findMany({
            where: eq(routineExercises.routineId, routineId),
            orderBy: (re, { asc }) => [asc(re.order)],
          });

          await db.insert(sessions).values({
            id: sessionId,
            date: today,
            startTime: now,
            endTime: null,
            isActive: true,
            routineId: routineId,
            targetDuration: sessionDuration,
            createdAt: now,
            updatedAt: now,
          });

          const exerciseLogs: ExerciseLog[] = [];
          for (const routineExercise of routineExercisesList) {
            const exerciseId = generateId();

            await db.insert(exercises).values({
              id: exerciseId,
              sessionId: sessionId,
              name: routineExercise.name,
              order: routineExercise.order,
              completedAt: null,
              createdAt: now,
              updatedAt: now,
            });

            exerciseLogs.push({
              id: exerciseId,
              name: routineExercise.name,
              sets: [],
              order: routineExercise.order,
              completedAt: null,
            });
          }

          set({
            activeSessionId: sessionId,
            currentRoutineId: routineId,
            currentRoutineTitle: routine.title,
            isSessionActive: true,
            currentExercises: exerciseLogs,
            activeExerciseIndex: 0,
            sessionStartTime: now,
            timerStartTime: null, // Don't start timer until user clicks play
            targetDuration: sessionDuration,
            lastActivityTimestamp: now,
            timerWarningShown: false,
            isTimerPaused: true, // Start paused by default
            pausedAt: null, // No pause time until timer starts
            accumulatedPausedTime: 0,
          });

          get().resetActivityTimer();
          return sessionId;
        } catch (error) {
          logger.logError(
            error instanceof Error ? error : new Error(String(error)),
            "startSessionFromRoutine",
          );
          throw error;
        }
      },

      endSession: async () => {
        const { activeSessionId, currentExercises, autoEndTimerId } = get();
        if (!activeSessionId) return;

        if (autoEndTimerId) {
          clearTimeout(autoEndTimerId);
        }

        const now = getNowString();

        try {
          // Wait for database to be initialized before querying
          await waitForDb();

          // Save any sets that might exist
          for (const exercise of currentExercises) {
            for (const setData of exercise.sets) {
              await db.insert(sets).values({
                id: setData.id,
                exerciseId: exercise.id,
                reps: setData.reps,
                weight: setData.weight,
                order: setData.order,
                timestamp: setData.timestamp,
                createdAt: now,
                updatedAt: now,
              });
            }
          }

          // Update session as completed
          await db
            .update(sessions)
            .set({
              endTime: now,
              isActive: false,
              updatedAt: now,
            })
            .where(eq(sessions.id, activeSessionId));

          // CRITICAL: Clear state FIRST (synchronous) before AsyncStorage (async)
          // This ensures navigation sees cleared state immediately
          const { sessionDuration } = useSettingsStore.getState();
          set({
            activeSessionId: null,
            currentRoutineId: null,
            currentRoutineTitle: null,
            isSessionActive: false,
            currentExercises: [],
            activeExerciseIndex: 0,
            sessionStartTime: null,
            timerStartTime: null,
            targetDuration: sessionDuration, // Reset to user's default from settings
            lastActivityTimestamp: null,
            autoEndTimerId: null,
            timerWarningShown: false,
            hasHydrated: true, // Keep hydration true to prevent re-restore
            isResumedFromKill: false, // CRITICAL: Must be false after manual end
            isTimerPaused: true,
            pausedAt: null,
            accumulatedPausedTime: 0,
          });

          // Then clear AsyncStorage to prevent rehydration on next mount
          await clearSessionStorage();
        } catch (error) {
          logger.logError(error instanceof Error ? error : new Error(String(error)), "endSession");
          throw error;
        }
      },

      clearSession: async () => {
        const { autoEndTimerId } = get();

        if (autoEndTimerId) {
          clearTimeout(autoEndTimerId);
        }

        // CRITICAL: Clear state FIRST before AsyncStorage to prevent race conditions
        // This ensures any new session creation sees cleared state immediately
        const { sessionDuration } = useSettingsStore.getState();
        set({
          activeSessionId: null,
          currentRoutineId: null,
          currentRoutineTitle: null,
          isSessionActive: false,
          currentExercises: [],
          activeExerciseIndex: 0,
          sessionStartTime: null,
          timerStartTime: null,
          targetDuration: sessionDuration, // Reset to user's default from settings
          lastActivityTimestamp: null,
          autoEndTimerId: null,
          timerWarningShown: false,
          // Keep hydration true once rehydration has occurred; avoids hydration wait loops.
          hasHydrated: true,
          isResumedFromKill: false,
          isTimerPaused: true,
          pausedAt: null,
          accumulatedPausedTime: 0,
        });

        // Then clear AsyncStorage (async operation)
        await clearSessionStorage();
      },

      addExercise: (name: string) => {
        const { currentExercises, activeSessionId, isSessionActive } = get();

        // Validate input using validation utility
        const validation = validateExerciseName(name);
        if (!validation.valid) {
          Alert.alert("Invalid Exercise Name", validation.error || "Please enter a valid name.");
          throw new Error(validation.error || "Exercise name validation failed");
        }

        if (!isSessionActive) {
          Alert.alert("No Active Session", "Please start a session first.");
          throw new Error("No active session");
        }

        // Use sanitized name from validation
        const sanitizedName = validation.sanitized || name.trim();

        const exerciseId = generateId();
        const now = getNowString();

        const newExercise: ExerciseLog = {
          id: exerciseId,
          name: sanitizedName,
          sets: [],
          order: currentExercises.length,
          completedAt: null,
        };

        if (activeSessionId) {
          db.insert(exercises)
            .values({
              id: exerciseId,
              sessionId: activeSessionId,
              name: sanitizedName,
              order: currentExercises.length,
              completedAt: null,
              createdAt: now,
              updatedAt: now,
            })
            .catch((error) =>
              logger.logError(
                error instanceof Error ? error : new Error(String(error)),
                "addExercise",
              ),
            );
        }

        set({
          currentExercises: [...currentExercises, newExercise],
        });

        get().resetActivityTimer();
      },

      toggleExerciseComplete: async (exerciseId: string) => {
        const { currentExercises, activeExerciseIndex } = get();
        const now = getNowString();

        const exerciseIndex = currentExercises.findIndex((e) => e.id === exerciseId);
        if (exerciseIndex === -1) return;

        const exercise = currentExercises[exerciseIndex];
        const newCompletedAt = exercise.completedAt ? null : now;

        try {
          // Wait for database to be initialized before querying
          await waitForDb();

          // Update DB first
          await db
            .update(exercises)
            .set({
              completedAt: newCompletedAt,
              updatedAt: now,
            })
            .where(eq(exercises.id, exerciseId));

          // Only update UI after DB confirms
          const updatedExercises = currentExercises.map((e) =>
            e.id === exerciseId ? { ...e, completedAt: newCompletedAt } : e,
          );

          let newActiveIndex = activeExerciseIndex;
          if (newCompletedAt) {
            const nextIncomplete = updatedExercises.findIndex(
              (e, idx) => idx > exerciseIndex && !e.completedAt,
            );
            if (nextIncomplete !== -1) {
              newActiveIndex = nextIncomplete;
            }
          } else {
            // If unchecking, make this the active exercise
            newActiveIndex = exerciseIndex;
          }

          set({
            currentExercises: updatedExercises,
            activeExerciseIndex: newActiveIndex,
          });

          get().resetActivityTimer();
        } catch (error) {
          logger.logError(
            error instanceof Error ? error : new Error(String(error)),
            "toggleExerciseComplete",
          );
          Alert.alert("Error", "Failed to update exercise. Please try again.");
        }
      },

      reorderExercises: async (newExercises: ExerciseLog[]) => {
        const { currentExercises, activeExerciseIndex } = get();

        // Track the currently active exercise to maintain focus after reorder
        const activeExerciseId = currentExercises[activeExerciseIndex]?.id;

        const reorderedExercises = newExercises.map((e, index) => ({
          ...e,
          order: index,
        }));

        const now = getNowString();

        try {
          // Wait for database to be initialized before querying
          await waitForDb();

          // Update all exercises in DB first (atomically)
          const updatePromises = reorderedExercises.map((exercise) =>
            db
              .update(exercises)
              .set({ order: exercise.order, updatedAt: now })
              .where(eq(exercises.id, exercise.id)),
          );

          await Promise.all(updatePromises);

          // Find new index of the active exercise after reordering
          const newActiveIndex = activeExerciseId
            ? reorderedExercises.findIndex((e) => e.id === activeExerciseId)
            : 0;

          // Only update UI after all DB operations succeed
          set({
            currentExercises: reorderedExercises,
            activeExerciseIndex: newActiveIndex >= 0 ? newActiveIndex : 0,
          });
          get().resetActivityTimer();
        } catch (error) {
          logger.logError(
            error instanceof Error ? error : new Error(String(error)),
            "reorderExercises",
          );
          Alert.alert("Error", "Failed to reorder exercises. Please try again.");
        }
      },

      setActiveExerciseIndex: (index: number) => {
        set({ activeExerciseIndex: index });
      },

      // Note: Set management functions (addSet, updateSet, removeSet) not implemented yet.
      // Sets are currently only created during session restoration.
      // These will be added when set logging UI is implemented.

      setTargetDuration: (duration) => {
        // Always reset timer when duration changes (per requirements)
        const { activeSessionId, isTimerPaused } = get();
        const now = getNowString();

        set({
          targetDuration: duration,
          timerStartTime: isTimerPaused ? null : now, // If paused, don't set start time; if playing, reset to now
          timerWarningShown: false,
          accumulatedPausedTime: 0, // Clear accumulated pause time when changing duration
        });

        if (activeSessionId) {
          db.update(sessions)
            .set({ targetDuration: duration, updatedAt: now })
            .where(eq(sessions.id, activeSessionId))
            .catch((error) =>
              logger.logError(
                error instanceof Error ? error : new Error(String(error)),
                "setTargetDuration",
              ),
            );
        }
      },

      resetTimerWithDuration: (duration) => {
        const { activeSessionId, isTimerPaused } = get();
        const now = getNowString();

        // Reset the timer: clear accumulated pause time and reset start time
        set({
          targetDuration: duration,
          timerStartTime: isTimerPaused ? null : now, // If paused, don't set start time; if playing, reset to now
          timerWarningShown: false,
          accumulatedPausedTime: 0, // Clear accumulated pause time on reset
          pausedAt: isTimerPaused ? null : null, // Clear pause timestamp
        });

        if (activeSessionId) {
          db.update(sessions)
            .set({ targetDuration: duration, updatedAt: now })
            .where(eq(sessions.id, activeSessionId))
            .catch((error) =>
              logger.logError(
                error instanceof Error ? error : new Error(String(error)),
                "resetTimerWithDuration",
              ),
            );
        }
      },

      resetActivityTimer: () => {
        const { autoEndTimerId, isSessionActive } = get();
        const { autoEndSession, autoEndTimeout } = useSettingsStore.getState();

        if (autoEndTimerId) {
          clearTimeout(autoEndTimerId);
          set({ autoEndTimerId: null });
        }

        if (isSessionActive && autoEndSession) {
          const timeoutMs = autoEndTimeout * AUTO_END_MIN_TO_MS;
          const timerId = setTimeout(() => {
            get().endSession();
          }, timeoutMs);

          set({
            lastActivityTimestamp: getNowString(),
            autoEndTimerId: timerId,
          });
        }
      },

      setTimerWarningShown: (shown: boolean) => {
        set({ timerWarningShown: shown });
      },

      pauseTimer: () => {
        const { isTimerPaused, isSessionActive, timerStartTime } = get();

        if (!isSessionActive || isTimerPaused || !timerStartTime) return;

        const now = getNowString();
        set({
          isTimerPaused: true,
          pausedAt: now,
        });
      },

      resumeTimer: () => {
        const { isTimerPaused, pausedAt, accumulatedPausedTime, isSessionActive, timerStartTime } =
          get();

        if (!isSessionActive || !isTimerPaused) return;

        const now = getNowString();

        // First play - timer hasn't been started yet
        if (!timerStartTime) {
          set({
            isTimerPaused: false,
            pausedAt: null,
            timerStartTime: now, // Start the timer now
            accumulatedPausedTime: 0,
          });
          return;
        }

        // Resume after pause - calculate pause duration
        if (pausedAt) {
          const nowDate = new Date();
          const pausedAtDate = new Date(pausedAt);
          const pauseDurationMs = nowDate.getTime() - pausedAtDate.getTime();
          const pauseDurationSeconds = Math.floor(pauseDurationMs / 1000);

          set({
            isTimerPaused: false,
            pausedAt: null,
            accumulatedPausedTime: accumulatedPausedTime + pauseDurationSeconds,
          });
        } else {
          // Edge case: paused but no pausedAt timestamp
          set({
            isTimerPaused: false,
            pausedAt: null,
          });
        }
      },

      toggleTimerPause: () => {
        const { isTimerPaused } = get();

        if (isTimerPaused) {
          get().resumeTimer();
        } else {
          get().pauseTimer();
        }
      },

      dismissResumedFromKillBanner: () => {
        set({ isResumedFromKill: false });
      },
    }),
    sessionPersistConfig,
  ),
);
