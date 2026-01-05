export type SessionState = {
  activeSessionId: string | null;
  currentExercises: ExerciseLog[];
  isSessionActive: boolean;
};

export type ExerciseLog = {
  id: string;
  name: string;
  sets: SetLog[];
  order: number;
};

export type SetLog = {
  id: string;
  reps: number;
  weight: number | null;
  order: number;
  timestamp: string;
};

export type SessionActions = {
  startSession: () => Promise<string>;
  endSession: () => Promise<void>;
  addExercise: (name: string) => void;
  addSet: (exerciseId: string, reps: number, weight: number | null) => void;
  updateSet: (exerciseId: string, setId: string, reps: number, weight: number | null) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  clearSession: () => void;
};

export type SessionStore = SessionState & SessionActions;
