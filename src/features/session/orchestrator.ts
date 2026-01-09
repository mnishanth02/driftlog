import { eq } from "drizzle-orm";
import type { Router } from "expo-router";
import { db } from "@/core/db";
import { routines } from "@/core/db/schema";
import {
  DatabaseError,
  ErrorLevel,
  logError,
  SessionError,
  showConfirmDialog,
  showErrorAlert,
  ValidationError,
} from "@/core/utils/errors";
import type { SessionDuration } from "../settings/types";
import { useSessionStore } from "./store";
import type { ExerciseLog } from "./types";

/**
 * Session Orchestration Layer
 *
 * Centralizes session lifecycle management with business logic, validation,
 * error handling, and navigation. Components should use this facade instead
 * of directly accessing the store.
 *
 * Responsibilities:
 * - Starting sessions (freestyle or from routine)
 * - Ending sessions with confirmation
 * - Exercise management (add, complete, reorder)
 * - Session validation and recovery
 * - Navigation after session lifecycle events
 */
export namespace SessionOrchestrator {
  /**
   * Start a freestyle session
   *
   * @param router - Expo router for navigation
   * @returns Session ID if successful
   * @throws SessionError if session already active
   * @throws DatabaseError if database operation fails
   */
  export async function startFreestyleSession(router: Router): Promise<string | null> {
    try {
      const { isSessionActive, startSession } = useSessionStore.getState();

      // Validate: No concurrent sessions
      if (isSessionActive) {
        throw new SessionError(
          "Cannot start session: Session already active",
          "You have a workout in progress. Please end it before starting a new one.",
          { existingSessionId: useSessionStore.getState().activeSessionId },
        );
      }

      // Start session
      const sessionId = await startSession();

      logError(
        new Error("Session started"),
        "SessionOrchestrator.startFreestyleSession",
        { sessionId },
        ErrorLevel.INFO,
      );

      // Navigate to session screen
      router.push("/session/freestyle" as never);

      return sessionId;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (error instanceof SessionError) {
        // Show user-friendly alert for session errors
        showErrorAlert(error, "SessionOrchestrator.startFreestyleSession");
        return null;
      }

      // Wrap database errors
      if (err.message.includes("database") || err.message.includes("SQL")) {
        throw new DatabaseError("Failed to start session in database", {
          originalError: err.message,
        });
      }

      throw err;
    }
  }

  /**
   * Start a session from a routine
   *
   * @param routineId - Routine ID to start from
   * @param router - Expo router for navigation
   * @returns Session ID if successful
   * @throws ValidationError if routine not found
   * @throws SessionError if session already active
   * @throws DatabaseError if database operation fails
   */
  export async function startRoutineSession(
    routineId: string,
    router: Router,
  ): Promise<string | null> {
    try {
      const { isSessionActive, startSessionFromRoutine } = useSessionStore.getState();

      // Validate: Routine exists
      const routine = await db.query.routines.findFirst({
        where: eq(routines.id, routineId),
      });

      if (!routine) {
        throw new ValidationError(
          `Routine not found: ${routineId}`,
          "This routine no longer exists. It may have been deleted.",
          { routineId },
        );
      }

      // Validate: No concurrent sessions
      if (isSessionActive) {
        throw new SessionError(
          "Cannot start session: Session already active",
          "You have a workout in progress. Please end it before starting a new one.",
          { existingSessionId: useSessionStore.getState().activeSessionId, routineId },
        );
      }

      // Start session from routine
      const sessionId = await startSessionFromRoutine(routineId);

      logError(
        new Error("Routine session started"),
        "SessionOrchestrator.startRoutineSession",
        { sessionId, routineId, routineTitle: routine.title },
        ErrorLevel.INFO,
      );

      // Navigate to session screen
      router.push(`/session/${routineId}` as never);

      return sessionId;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (error instanceof ValidationError || error instanceof SessionError) {
        showErrorAlert(error, "SessionOrchestrator.startRoutineSession");
        return null;
      }

      if (err.message.includes("database") || err.message.includes("SQL")) {
        throw new DatabaseError("Failed to start routine session in database", {
          originalError: err.message,
          routineId,
        });
      }

      throw err;
    }
  }

  /**
   * End the active session with confirmation
   *
   * @param router - Expo router for navigation
   * @param skipConfirmation - Skip confirmation dialog (default: false)
   * @returns true if session ended, false if cancelled
   */
  export async function endSession(router: Router, skipConfirmation = false): Promise<boolean> {
    try {
      const { isSessionActive, currentExercises, endSession } = useSessionStore.getState();

      // Validate: Session must be active
      if (!isSessionActive) {
        throw new SessionError(
          "Cannot end session: No active session",
          "No active workout to end.",
        );
      }

      // Calculate completion stats
      const totalExercises = currentExercises.length;
      const completedExercises = currentExercises.filter((e) => e.completedAt).length;
      const hasIncompleteExercises = totalExercises > 0 && completedExercises < totalExercises;

      // Show confirmation if user has incomplete exercises
      if (!skipConfirmation && hasIncompleteExercises) {
        return new Promise<boolean>((resolve) => {
          showConfirmDialog(
            "End workout?",
            `You've completed ${completedExercises} of ${totalExercises} exercises.`,
            async () => {
              try {
                await endSession();
                logError(
                  new Error("Session ended"),
                  "SessionOrchestrator.endSession",
                  { totalExercises, completedExercises },
                  ErrorLevel.INFO,
                );

                // Navigate back to main screen
                setTimeout(() => {
                  router.replace("/(tabs)");
                }, 100);

                resolve(true);
              } catch (error) {
                showErrorAlert(
                  error instanceof Error ? error : new Error(String(error)),
                  "SessionOrchestrator.endSession",
                );
                resolve(false);
              }
            },
            () => resolve(false), // User cancelled
            "End",
            "Continue",
            true, // Destructive action
          );
        });
      }

      // No confirmation needed - end session directly
      await endSession();

      logError(
        new Error("Session ended"),
        "SessionOrchestrator.endSession",
        { totalExercises, completedExercises },
        ErrorLevel.INFO,
      );

      // Navigate back to main screen
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (error instanceof SessionError) {
        showErrorAlert(error, "SessionOrchestrator.endSession");
        return false;
      }

      if (err.message.includes("database") || err.message.includes("SQL")) {
        const dbError = new DatabaseError("Failed to end session in database", {
          originalError: err.message,
        });
        showErrorAlert(dbError, "SessionOrchestrator.endSession");
        return false;
      }

      showErrorAlert(err, "SessionOrchestrator.endSession");
      return false;
    }
  }

  /**
   * Add an exercise to the active session
   *
   * @param exerciseName - Name of the exercise to add
   * @throws ValidationError if exercise name is invalid
   * @throws SessionError if no active session
   */
  export function addExercise(exerciseName: string): void {
    try {
      const { isSessionActive, addExercise } = useSessionStore.getState();

      // Validate: Must have active session
      if (!isSessionActive) {
        throw new SessionError(
          "Cannot add exercise: No active session",
          "Please start a session first.",
        );
      }

      // Validate: Exercise name
      const trimmedName = exerciseName.trim();

      if (!trimmedName) {
        throw new ValidationError(
          "Exercise name cannot be empty",
          "Please enter an exercise name.",
          { input: exerciseName },
        );
      }

      if (trimmedName.length > 100) {
        throw new ValidationError(
          "Exercise name too long",
          "Exercise name must be less than 100 characters.",
          { input: exerciseName, length: trimmedName.length },
        );
      }

      // Add exercise
      addExercise(trimmedName);

      logError(
        new Error("Exercise added"),
        "SessionOrchestrator.addExercise",
        { exerciseName: trimmedName },
        ErrorLevel.INFO,
      );
    } catch (error) {
      if (error instanceof ValidationError || error instanceof SessionError) {
        showErrorAlert(error, "SessionOrchestrator.addExercise");
        throw error; // Re-throw to allow caller to handle
      }

      throw error;
    }
  }

  /**
   * Toggle exercise completion status
   *
   * @param exerciseId - ID of exercise to toggle
   * @throws ValidationError if exercise not found
   * @throws SessionError if no active session
   */
  export async function toggleExerciseComplete(exerciseId: string): Promise<void> {
    try {
      const { isSessionActive, currentExercises, toggleExerciseComplete } =
        useSessionStore.getState();

      // Validate: Must have active session
      if (!isSessionActive) {
        throw new SessionError("Cannot toggle exercise: No active session", "No active workout.");
      }

      // Validate: Exercise exists
      const exercise = currentExercises.find((e) => e.id === exerciseId);
      if (!exercise) {
        throw new ValidationError(
          `Exercise not found: ${exerciseId}`,
          "Exercise not found in current session.",
          { exerciseId },
        );
      }

      // Toggle completion
      await toggleExerciseComplete(exerciseId);

      logError(
        new Error("Exercise completion toggled"),
        "SessionOrchestrator.toggleExerciseComplete",
        {
          exerciseId,
          exerciseName: exercise.name,
          newStatus: !exercise.completedAt ? "completed" : "incomplete",
        },
        ErrorLevel.INFO,
      );
    } catch (error) {
      if (error instanceof ValidationError || error instanceof SessionError) {
        showErrorAlert(error, "SessionOrchestrator.toggleExerciseComplete");
        throw error;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      if (err.message.includes("database") || err.message.includes("SQL")) {
        const dbError = new DatabaseError("Failed to update exercise in database", {
          originalError: err.message,
          exerciseId,
        });
        showErrorAlert(dbError, "SessionOrchestrator.toggleExerciseComplete");
        throw dbError;
      }

      throw err;
    }
  }

  /**
   * Reorder exercises in the active session
   *
   * @param exercises - New ordered list of exercises
   * @throws SessionError if no active session
   */
  export async function reorderExercises(exercises: ExerciseLog[]): Promise<void> {
    try {
      const { isSessionActive, reorderExercises } = useSessionStore.getState();

      // Validate: Must have active session
      if (!isSessionActive) {
        throw new SessionError("Cannot reorder exercises: No active session", "No active workout.");
      }

      // Reorder
      await reorderExercises(exercises);

      logError(
        new Error("Exercises reordered"),
        "SessionOrchestrator.reorderExercises",
        { exerciseCount: exercises.length },
        ErrorLevel.INFO,
      );
    } catch (error) {
      if (error instanceof SessionError) {
        showErrorAlert(error, "SessionOrchestrator.reorderExercises");
        throw error;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      if (err.message.includes("database") || err.message.includes("SQL")) {
        const dbError = new DatabaseError("Failed to reorder exercises in database", {
          originalError: err.message,
        });
        showErrorAlert(dbError, "SessionOrchestrator.reorderExercises");
        throw dbError;
      }

      throw err;
    }
  }

  /**
   * Update session target duration
   *
   * @param duration - New target duration in minutes
   * @param resetTimer - Whether to reset the timer to 0 (default: false)
   * @throws SessionError if no active session
   */
  export function setTargetDuration(duration: SessionDuration, resetTimer = false): void {
    try {
      const { isSessionActive, setTargetDuration, resetTimerWithDuration } =
        useSessionStore.getState();

      // Validate: Must have active session
      if (!isSessionActive) {
        throw new SessionError("Cannot set duration: No active session", "No active workout.");
      }

      // Update duration
      if (resetTimer) {
        resetTimerWithDuration(duration);
      } else {
        setTargetDuration(duration);
      }

      logError(
        new Error("Target duration updated"),
        "SessionOrchestrator.setTargetDuration",
        { duration, resetTimer },
        ErrorLevel.INFO,
      );
    } catch (error) {
      if (error instanceof SessionError) {
        showErrorAlert(error, "SessionOrchestrator.setTargetDuration");
        throw error;
      }

      throw error;
    }
  }
}
