import { eq } from "drizzle-orm";
import { create } from "zustand";
import { db } from "../../core/db";
import { exercises, sessions, sets } from "../../core/db/schema";
import { generateId, getNowString, getTodayString } from "../../core/utils/helpers";
import { useSettingsStore } from "../settings";
import type { ExerciseLog, SessionStore, SetLog } from "./types";

export const useSessionStore = create<SessionStore>((set, get) => ({
  // State
  activeSessionId: null,
  currentExercises: [],
  isSessionActive: false,
  lastActivityTimestamp: null,
  autoEndTimerId: null,

  // Actions
  startSession: async () => {
    const sessionId = generateId();
    const now = getNowString();
    const today = getTodayString();

    try {
      // Insert session into database
      await db.insert(sessions).values({
        id: sessionId,
        date: today,
        startTime: now,
        endTime: null,
        isActive: true,
        planId: null,
        createdAt: now,
        updatedAt: now,
      });

      set({
        activeSessionId: sessionId,
        isSessionActive: true,
        currentExercises: [],
        lastActivityTimestamp: now,
      });

      // Start auto-end timer if enabled
      get().resetActivityTimer();

      return sessionId;
    } catch (error) {
      console.error("Failed to start session:", error);
      throw error;
    }
  },

  resetActivityTimer: () => {
    const { autoEndTimerId, isSessionActive } = get();
    const { autoEndSession, autoEndTimeout } = useSettingsStore.getState();

    // Clear existing timer
    if (autoEndTimerId) {
      clearTimeout(autoEndTimerId);
      set({ autoEndTimerId: null });
    }

    // Only set new timer if session is active and auto-end is enabled
    if (isSessionActive && autoEndSession) {
      const timeoutMs = autoEndTimeout * 60 * 1000; // Convert minutes to milliseconds
      const timerId = setTimeout(() => {
        console.log("Auto-ending session due to inactivity");
        get().endSession();
      }, timeoutMs);

      set({
        lastActivityTimestamp: getNowString(),
        autoEndTimerId: timerId,
      });
    }
  },

  endSession: async () => {
    const { activeSessionId, currentExercises, autoEndTimerId } = get();
    if (!activeSessionId) return;

    // Clear auto-end timer
    if (autoEndTimerId) {
      clearTimeout(autoEndTimerId);
    }

    const now = getNowString();

    try {
      // Save all exercises and sets to database
      for (const exercise of currentExercises) {
        // Insert exercise
        await db.insert(exercises).values({
          id: exercise.id,
          sessionId: activeSessionId,
          name: exercise.name,
          order: exercise.order,
          createdAt: now,
          updatedAt: now,
        });

        // Insert sets for this exercise
        for (const set of exercise.sets) {
          await db.insert(sets).values({
            id: set.id,
            exerciseId: exercise.id,
            reps: set.reps,
            weight: set.weight,
            order: set.order,
            timestamp: set.timestamp,
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

      set({
        activeSessionId: null,
        isSessionActive: false,
        currentExercises: [],
        lastActivityTimestamp: null,
        autoEndTimerId: null,
      });
    } catch (error) {
      console.error("Failed to end session:", error);
      throw error;
    }
  },

  addExercise: (name: string) => {
    const { currentExercises } = get();
    const exerciseId = generateId();

    const newExercise: ExerciseLog = {
      id: exerciseId,
      name,
      sets: [],
      order: currentExercises.length,
    };

    set({
      currentExercises: [...currentExercises, newExercise],
    });

    // Reset activity timer on user action
    get().resetActivityTimer();
  },

  addSet: (exerciseId: string, reps: number, weight: number | null) => {
    const { currentExercises } = get();
    const setId = generateId();

    const updatedExercises = currentExercises.map((exercise) => {
      if (exercise.id === exerciseId) {
        const newSet: SetLog = {
          id: setId,
          reps,
          weight,
          order: exercise.sets.length,
          timestamp: getNowString(),
        };
        return {
          ...exercise,
          sets: [...exercise.sets, newSet],
        };
      }
      return exercise;
    });

    set({ currentExercises: updatedExercises });

    // Reset activity timer on user action
    get().resetActivityTimer();
  },

  updateSet: (exerciseId: string, setId: string, reps: number, weight: number | null) => {
    const { currentExercises } = get();

    const updatedExercises = currentExercises.map((exercise) => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map((set) => (set.id === setId ? { ...set, reps, weight } : set)),
        };
      }
      return exercise;
    });

    set({ currentExercises: updatedExercises });

    // Reset activity timer on user action
    get().resetActivityTimer();
  },

  removeSet: (exerciseId: string, setId: string) => {
    const { currentExercises } = get();

    const updatedExercises = currentExercises.map((exercise) => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.filter((set) => set.id !== setId),
        };
      }
      return exercise;
    });

    set({ currentExercises: updatedExercises });

    // Reset activity timer on user action
    get().resetActivityTimer();
  },

  clearSession: () => {
    const { autoEndTimerId } = get();

    // Clear timer when clearing session
    if (autoEndTimerId) {
      clearTimeout(autoEndTimerId);
    }

    set({
      activeSessionId: null,
      isSessionActive: false,
      currentExercises: [],
      lastActivityTimestamp: null,
      autoEndTimerId: null,
    });
  },
}));
