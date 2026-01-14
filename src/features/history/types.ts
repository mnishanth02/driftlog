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
  isDeleting: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  pageSize: number;
};

export type HistoryActions = {
  loadSessions: (options?: { reset?: boolean }) => Promise<void>;
  refreshSessions: () => Promise<void>;
  loadMoreSessions: () => Promise<void>;
  loadSessionDetail: (sessionId: string) => Promise<void>;
  saveReflection: (
    sessionId: string,
    feeling: string | null,
    notes: string | null,
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  searchSessions: (query: string) => Promise<void>;
  filterByDateRange: (startDate: string, endDate: string) => Promise<void>;
};

export type HistoryStore = HistoryState & HistoryActions;
