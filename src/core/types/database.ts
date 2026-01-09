// Database schema for DriftLog
export type Database = {
  sessions: Session[];
  exercises: Exercise[];
  sets: Set[];
  reflections: Reflection[];
  routines: Routine[];
  routineExercises: RoutineExercise[];
};

export type Session = {
  id: string;
  date: string; // ISO date string
  startTime: string; // ISO datetime string
  endTime: string | null;
  isActive: boolean;
  routineId: string | null; // Reference to routine used for this session
  targetDuration: number | null; // Target duration in minutes (15, 30, 60, 90)
  createdAt: string;
  updatedAt: string;
};

export type Exercise = {
  id: string;
  sessionId: string;
  name: string;
  order: number; // For display ordering
  completedAt: string | null; // ISO datetime when marked complete
  createdAt: string;
  updatedAt: string;
};

export type Set = {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number | null; // Optional weight
  order: number; // Set number
  timestamp: string; // When this set was logged
  createdAt: string;
  updatedAt: string;
};

export type Reflection = {
  id: string;
  sessionId: string;
  feeling: string | null; // "How did this feel?"
  notes: string | null; // "Anything to note?"
  createdAt: string;
  updatedAt: string;
};

export type Routine = {
  id: string;
  title: string;
  notes: string | null;
  plannedDate: string | null; // ISO date string
  createdAt: string;
  updatedAt: string;
};

export type RoutineExercise = {
  id: string;
  routineId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};
