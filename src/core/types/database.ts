// Database schema for DriftLog
export type Database = {
  sessions: Session[];
  exercises: Exercise[];
  sets: Set[];
  plans: Plan[];
  reflections: Reflection[];
};

export type Session = {
  id: string;
  date: string; // ISO date string
  startTime: string; // ISO datetime string
  endTime: string | null;
  isActive: boolean;
  planId: string | null; // Reference to plan if exists
  createdAt: string;
  updatedAt: string;
};

export type Exercise = {
  id: string;
  sessionId: string;
  name: string;
  order: number; // For display ordering
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

export type Plan = {
  id: string;
  date: string; // ISO date string
  title: string; // Free-text intent
  notes: string | null; // Optional short note
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
