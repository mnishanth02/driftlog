export type HistorySession = {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  planTitle: string | null;
  exerciseCount: number;
  completedExercisesCount: number;
  hasReflection: boolean;
  isActive: boolean;
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
  /** Completed sessions (isActive=false, endTime set, has completed exercises) */
  sessions: HistorySession[];
  /** In-progress sessions (isActive=true) */
  inProgressSessions: HistorySession[];
  currentSession: SessionDetail | null;
  isLoading: boolean;
  isLoadingInProgress: boolean;
  isDeleting: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  pageSize: number;
};

export type HistoryActions = {
  loadSessions: (options?: { reset?: boolean }) => Promise<void>;
  loadInProgressSessions: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  loadMoreSessions: () => Promise<void>;
  loadSessionDetail: (sessionId: string) => Promise<void>;
  saveReflection: (
    sessionId: string,
    feeling: string | null,
    notes: string | null,
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  /** Discard an in-progress session (hard delete) */
  discardSession: (sessionId: string) => Promise<void>;
  searchSessions: (query: string) => Promise<void>;
  filterByDateRange: (startDate: string, endDate: string) => Promise<void>;
  /** Check if a routine has a completed session for a specific date */
  checkRoutineCompletedForDate: (routineId: string, date: string) => Promise<boolean>;
  /** Get set of completed routine IDs for a specific date (batch query) */
  getCompletedRoutineIdsForDate: (date: string) => Promise<Set<string>>;
};

export type HistoryStore = HistoryState & HistoryActions;
