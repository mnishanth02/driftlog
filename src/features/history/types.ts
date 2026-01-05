export type HistorySession = {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  planTitle: string | null;
  exerciseCount: number;
  hasReflection: boolean;
};

export type SessionDetail = {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  planTitle: string | null;
  exercises: ExerciseDetail[];
  reflection: ReflectionDetail | null;
};

export type ExerciseDetail = {
  id: string;
  name: string;
  sets: SetDetail[];
};

export type SetDetail = {
  id: string;
  reps: number;
  weight: number | null;
  order: number;
};

export type ReflectionDetail = {
  feeling: string | null;
  notes: string | null;
};

export type HistoryState = {
  sessions: HistorySession[];
  currentSession: SessionDetail | null;
  isLoading: boolean;
};

export type HistoryActions = {
  loadSessions: () => Promise<void>;
  loadSessionDetail: (sessionId: string) => Promise<void>;
  saveReflection: (
    sessionId: string,
    feeling: string | null,
    notes: string | null,
  ) => Promise<void>;
};

export type HistoryStore = HistoryState & HistoryActions;
