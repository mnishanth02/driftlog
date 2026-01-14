import type { RoutineExercise as DBRoutineExercise, Routine } from "@/core/types/database";

// In-memory draft exercise (before saved to DB)
export type DraftExercise = {
  id: string;
  name: string;
  order: number;
};

// DB types re-exported for convenience
export type { Routine, DBRoutineExercise };

export type RoutineWithExercises = Routine & {
  exercises: DBRoutineExercise[];
};

export type RoutineState = {
  routines: RoutineWithExercises[];
  isLoading: boolean;
  // Draft state for Create/Edit screen
  draftRoutine: {
    id: string | null; // null for new routine, string for edit
    title: string;
    notes: string | null;
    exercises: DraftExercise[];
    plannedDate: string | null; // ISO date string for when this routine is planned
  } | null;
};

export type RoutineActions = {
  loadRoutines: () => Promise<void>;
  loadRoutine: (id: string) => Promise<RoutineWithExercises | null>;
  createRoutine: (
    title: string,
    notes: string | null,
    exercises: DraftExercise[],
    plannedDate: string | null,
  ) => Promise<string>;
  updateRoutine: (
    id: string,
    title: string,
    notes: string | null,
    exercises: DraftExercise[],
    plannedDate: string | null,
  ) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  createRoutineFromSession: (sessionId: string, targetDate: string) => Promise<string>;
  // Draft management
  startDraft: (routineId?: string, plannedDate?: string) => Promise<void>;
  updateDraftTitle: (title: string) => void;
  updateDraftNotes: (notes: string | null) => void;
  addDraftExercise: (name: string) => void;
  updateDraftExercise: (id: string, name: string) => void;
  removeDraftExercise: (id: string) => void;
  reorderDraftExercises: (exercises: DraftExercise[]) => void;
  clearDraft: () => void;
};

export type RoutineStore = RoutineState & RoutineActions;
