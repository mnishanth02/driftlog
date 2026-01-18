import { eq } from "drizzle-orm";
import { create } from "zustand";
import { db, waitForDb } from "@/core/db";
import { routineExercises, routines, sessions } from "@/core/db/schema";
import { formatDate, generateId, getNowString } from "@/core/utils/helpers";
import type { DraftExercise, RoutineStore } from "./types";

export const useRoutineStore = create<RoutineStore>((set, get) => ({
  // State
  routines: [],
  isLoading: false,
  draftRoutine: null,

  // Actions
  loadRoutines: async () => {
    set({ isLoading: true });

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      const allRoutines = await db.query.routines.findMany({
        with: {
          exercises: {
            orderBy: (exercises, { asc }) => [asc(exercises.order)],
          },
        },
        // Prefer recently updated routines at the top.
        orderBy: (routines, { desc }) => [desc(routines.updatedAt)],
      });

      set({ routines: allRoutines, isLoading: false });
    } catch (error) {
      console.error("Failed to load routines:", error);
      set({ isLoading: false });
    }
  },

  loadRoutine: async (id: string) => {
    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      const routine = await db.query.routines.findFirst({
        where: (routines, { eq }) => eq(routines.id, id),
        with: {
          exercises: {
            orderBy: (exercises, { asc }) => [asc(exercises.order)],
          },
        },
      });

      return routine || null;
    } catch (error) {
      console.error("Failed to load routine:", error);
      return null;
    }
  },

  createRoutine: async (
    title: string,
    notes: string | null,
    exercises: DraftExercise[],
    plannedDate: string | null,
  ) => {
    const now = getNowString();
    const routineId = generateId();
    const normalizedTitle = title.trim();
    const normalizedNotes = notes?.trim() ? notes.trim() : null;

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      // Insert routine
      await db.insert(routines).values({
        id: routineId,
        // Title is optional in UX; store empty string rather than persisting a placeholder.
        title: normalizedTitle,
        notes: normalizedNotes,
        plannedDate,
        createdAt: now,
        updatedAt: now,
      });

      // Batch insert exercises if any exist
      if (exercises.length > 0) {
        await db.insert(routineExercises).values(
          exercises.map((exercise) => ({
            id: exercise.id,
            routineId,
            name: exercise.name.trim(),
            order: exercise.order,
            createdAt: now,
            updatedAt: now,
          })),
        );
      }

      await get().loadRoutines();
      return routineId;
    } catch (error) {
      console.error("Failed to create routine:", error);
      throw error;
    }
  },

  updateRoutine: async (
    id: string,
    title: string,
    notes: string | null,
    exercises: DraftExercise[],
    plannedDate: string | null,
  ) => {
    const now = getNowString();
    const normalizedTitle = title.trim();
    const normalizedNotes = notes?.trim() ? notes.trim() : null;

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      // Update routine metadata
      await db
        .update(routines)
        .set({
          title: normalizedTitle,
          notes: normalizedNotes,
          plannedDate,
          updatedAt: now,
        })
        .where(eq(routines.id, id));

      // Simplest v1 approach: rewrite children.
      await db.delete(routineExercises).where(eq(routineExercises.routineId, id));

      // Batch insert all exercises at once
      if (exercises.length > 0) {
        await db.insert(routineExercises).values(
          exercises.map((exercise) => ({
            id: exercise.id,
            routineId: id,
            name: exercise.name.trim(),
            order: exercise.order,
            createdAt: now,
            updatedAt: now,
          })),
        );
      }

      await get().loadRoutines();
    } catch (error) {
      console.error("Failed to update routine:", error);
      throw error;
    }
  },

  deleteRoutine: async (id: string) => {
    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      await db.delete(routines).where(eq(routines.id, id));

      set((state) => ({
        routines: state.routines.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete routine:", error);
      throw error;
    }
  },

  createRoutineFromSession: async (sessionId: string, targetDate: string) => {
    const now = getNowString();
    const routineId = generateId();

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      // Fetch session with exercises
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: {
          exercises: {
            orderBy: (exercises, { asc }) => [asc(exercises.order)],
          },
          routine: true,
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // Generate title: "Original Title - Jan 6" or "Session - Jan 6"
      const baseTitle = session.routine?.title || "Session";
      const formattedDate = formatDate(targetDate, "MMM d");
      const title = `${baseTitle} - ${formattedDate}`;

      // Create routine
      await db.insert(routines).values({
        id: routineId,
        title,
        notes: session.routine?.notes || null,
        plannedDate: targetDate,
        createdAt: now,
        updatedAt: now,
      });

      // Batch insert all exercises at once
      const sessionExercises = session.exercises || [];
      if (sessionExercises.length > 0) {
        await db.insert(routineExercises).values(
          sessionExercises.map((exercise) => ({
            id: generateId(),
            routineId,
            name: exercise.name,
            order: exercise.order,
            createdAt: now,
            updatedAt: now,
          })),
        );
      }

      await get().loadRoutines();
      return routineId;
    } catch (error) {
      console.error("Failed to create routine from session:", error);
      throw error;
    }
  },

  startDraft: async (routineId?: string, plannedDate?: string) => {
    if (routineId) {
      const routine = await get().loadRoutine(routineId);
      if (routine) {
        set({
          draftRoutine: {
            id: routine.id,
            title: routine.title,
            notes: routine.notes,
            exercises: routine.exercises.map((e) => ({
              id: e.id,
              name: e.name,
              order: e.order,
            })),
            plannedDate: plannedDate || routine.plannedDate || null,
          },
        });
        return;
      }
    }

    // Default: start fresh draft (also used when routineId is missing or not found)
    set({
      draftRoutine: {
        id: null,
        title: "",
        notes: null,
        exercises: [],
        plannedDate: plannedDate || null,
      },
    });
  },

  updateDraftTitle: (title: string) => {
    set((state) =>
      state.draftRoutine ? { draftRoutine: { ...state.draftRoutine, title } } : state,
    );
  },

  updateDraftNotes: (notes: string | null) => {
    set((state) =>
      state.draftRoutine ? { draftRoutine: { ...state.draftRoutine, notes } } : state,
    );
  },

  addDraftExercise: (name: string) => {
    const { draftRoutine } = get();
    if (!draftRoutine) return;

    const newExercise: DraftExercise = {
      id: generateId(),
      name,
      order: draftRoutine.exercises.length,
    };

    set({
      draftRoutine: {
        ...draftRoutine,
        exercises: [...draftRoutine.exercises, newExercise],
      },
    });
  },

  updateDraftExercise: (id: string, name: string) => {
    const { draftRoutine } = get();
    if (!draftRoutine) return;

    set({
      draftRoutine: {
        ...draftRoutine,
        exercises: draftRoutine.exercises.map((e) => (e.id === id ? { ...e, name } : e)),
      },
    });
  },

  removeDraftExercise: (id: string) => {
    const { draftRoutine } = get();
    if (!draftRoutine) return;

    const filteredExercises = draftRoutine.exercises.filter((e) => e.id !== id);
    const reordered = filteredExercises.map((e, index) => ({ ...e, order: index }));

    set({
      draftRoutine: {
        ...draftRoutine,
        exercises: reordered,
      },
    });
  },

  reorderDraftExercises: (exercises: DraftExercise[]) => {
    const { draftRoutine } = get();
    if (!draftRoutine) return;

    const reordered = exercises.map((e, index) => ({ ...e, order: index }));

    set({
      draftRoutine: {
        ...draftRoutine,
        exercises: reordered,
      },
    });
  },

  clearDraft: () => {
    set({ draftRoutine: null });
  },
}));
