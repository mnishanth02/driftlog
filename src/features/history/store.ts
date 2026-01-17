import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { create } from "zustand";
import { db, waitForDb } from "../../core/db";
import { exercises, reflections, sessions, sets } from "../../core/db/schema";
import { generateId, getNowString } from "../../core/utils/helpers";
import type { HistoryStore } from "./types";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Transform a raw session row (with relations) to a HistorySession.
 * Computes completedExercisesCount from exercises with completedAt set.
 */
function toHistorySession(session: {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
  routine?: { title: string } | null;
  exercises?: Array<{ completedAt: string | null }> | null;
  reflection?: unknown | null;
}) {
  const exercisesList = session.exercises ?? [];
  return {
    id: session.id,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    isActive: session.isActive,
    planTitle: session.routine?.title ?? null,
    exerciseCount: exercisesList.length,
    completedExercisesCount: exercisesList.filter((e) => e.completedAt !== null).length,
    hasReflection: !!session.reflection,
  };
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  // State
  sessions: [],
  inProgressSessions: [],
  currentSession: null,
  isLoading: false,
  isLoadingInProgress: false,
  isDeleting: false,
  isLoadingMore: false,
  hasMore: true,
  pageSize: DEFAULT_PAGE_SIZE,

  // Actions
  loadSessions: async (options) => {
    const { reset = false } = options ?? {};
    const { pageSize, isLoading, isLoadingMore } = get();

    // Prevent concurrent loads to avoid race conditions
    if (reset && isLoading) return;
    if (!reset && isLoadingMore) return;

    const hasExistingSessions = get().sessions.length > 0;

    // IMPORTANT: Don't clear sessions immediately on reset - this causes flicker.
    // Only set isLoading, let the data replacement happen atomically with the response.
    if (reset) {
      set({ isLoading: true, hasMore: true });
    } else if (!hasExistingSessions) {
      // Only show the full-screen loading state when there is nothing rendered yet.
      set({ isLoading: true });
    }

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      const offset = reset ? 0 : get().sessions.length;

      // Two-Tier History: Only fetch COMPLETED sessions
      // Criteria: isActive=false AND endTime IS NOT NULL
      const page = await db.query.sessions.findMany({
        where: and(eq(sessions.isActive, false), isNotNull(sessions.endTime)),
        orderBy: [desc(sessions.date), desc(sessions.startTime)],
        limit: pageSize,
        offset,
        with: {
          routine: true,
          exercises: true,
          reflection: true,
        },
      });

      // Filter to only sessions with at least one completed exercise
      // This prevents "empty ended" sessions from appearing in history
      const completedSessions = page.filter((session) => {
        const completedCount = (session.exercises ?? []).filter(
          (e) => e.completedAt !== null,
        ).length;
        return completedCount > 0;
      });

      const historySessions = completedSessions.map(toHistorySession);

      set((state) => {
        if (reset) {
          // Replace entire list atomically - no intermediate empty state
          return {
            sessions: historySessions,
            isLoading: false,
            hasMore: page.length === pageSize, // Use original page length for pagination
          };
        }

        // De-dupe by id when appending (helps if something changed in DB mid-scroll)
        const seen = new Set(state.sessions.map((s) => s.id));
        const merged = [...state.sessions];
        for (const s of historySessions) {
          if (!seen.has(s.id)) merged.push(s);
        }

        return {
          sessions: merged,
          isLoading: false,
          hasMore: page.length === pageSize,
        };
      });
    } catch (error) {
      console.error("Failed to load sessions:", error);
      set({ isLoading: false });
    }
  },

  refreshSessions: async () => {
    await get().loadSessions({ reset: true });
    await get().loadInProgressSessions();
  },

  loadInProgressSessions: async () => {
    set({ isLoadingInProgress: true });

    try {
      await waitForDb();

      // Fetch all in-progress sessions (isActive=true)
      const inProgress = await db.query.sessions.findMany({
        where: eq(sessions.isActive, true),
        orderBy: [desc(sessions.date), desc(sessions.startTime)],
        with: {
          routine: true,
          exercises: true,
          reflection: true,
        },
      });

      const inProgressSessions = inProgress.map(toHistorySession);

      set({ inProgressSessions, isLoadingInProgress: false });
    } catch (error) {
      console.error("Failed to load in-progress sessions:", error);
      set({ isLoadingInProgress: false });
    }
  },

  loadMoreSessions: async () => {
    const { isLoadingMore, isLoading, hasMore } = get();
    if (isLoading || isLoadingMore || !hasMore) return;

    set({ isLoadingMore: true });
    try {
      await get().loadSessions({ reset: false });
    } finally {
      set({ isLoadingMore: false });
    }
  },

  loadSessionDetail: async (sessionId: string) => {
    set({ isLoading: true });

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: {
          exercises: {
            with: {
              sets: {
                orderBy: [asc(sets.order)],
              },
            },
            orderBy: [asc(exercises.order)],
          },
          reflection: true,
          routine: true,
        },
      });

      if (!session) {
        set({ currentSession: null, isLoading: false });
        return;
      }

      const sessionDetail = {
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        planTitle: session.routine?.title ?? null,
        exercises:
          session.exercises?.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            sets:
              exercise.sets?.map((set) => ({
                id: set.id,
                reps: set.reps,
                weight: set.weight,
                order: set.order,
              })) ?? [],
          })) ?? [],
        reflection: session.reflection
          ? {
              feeling: session.reflection.feeling,
              notes: session.reflection.notes,
            }
          : null,
      };

      set({ currentSession: sessionDetail, isLoading: false });
    } catch (error) {
      console.error("Failed to load session detail:", error);
      set({ isLoading: false });
    }
  },

  saveReflection: async (sessionId: string, feeling: string | null, notes: string | null) => {
    const now = getNowString();

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      // Check if reflection exists
      const existing = await db.query.reflections.findFirst({
        where: eq(reflections.sessionId, sessionId),
      });

      if (existing) {
        // Update existing reflection
        await db
          .update(reflections)
          .set({
            feeling,
            notes,
            updatedAt: now,
          })
          .where(eq(reflections.id, existing.id));
      } else {
        // Create new reflection
        const reflectionId = generateId();
        await db.insert(reflections).values({
          id: reflectionId,
          sessionId,
          feeling,
          notes,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Reload current session to update UI
      if (get().currentSession?.id === sessionId) {
        await get().loadSessionDetail(sessionId);
      }
    } catch (error) {
      console.error("Failed to save reflection:", error);
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    set({ isDeleting: true });

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      // Check if session is active before deleting
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
      });

      if (session?.isActive) {
        set({ isDeleting: false });
        throw new Error("Cannot delete active session");
      }

      // Delete cascades to exercises, sets, and reflection via foreign keys
      await db.delete(sessions).where(eq(sessions.id, sessionId));

      // Remove from local state
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        isDeleting: false,
      }));
    } catch (error) {
      console.error("Failed to delete session:", error);
      set({ isDeleting: false });
      throw error;
    }
  },

  discardSession: async (sessionId: string) => {
    set({ isDeleting: true });

    try {
      await waitForDb();

      // Verify the session exists and is in-progress
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
      });

      if (!session) {
        set({ isDeleting: false });
        throw new Error("Session not found");
      }

      // Hard delete the in-progress session (cascades to exercises, sets, reflection)
      await db.delete(sessions).where(eq(sessions.id, sessionId));

      // Remove from local in-progress state
      set((state) => ({
        inProgressSessions: state.inProgressSessions.filter((s) => s.id !== sessionId),
        isDeleting: false,
      }));
    } catch (error) {
      console.error("Failed to discard session:", error);
      set({ isDeleting: false });
      throw error;
    }
  },

  searchSessions: async (query: string) => {
    set({ isLoading: true });

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      const trimmedQuery = query.trim().toLowerCase();

      if (!trimmedQuery) {
        await get().loadSessions({ reset: true });
        return;
      }

      // Search only completed sessions (same criteria as loadSessions)
      // Note: We fetch all completed with relations and filter in-memory for exercise names
      // since Drizzle doesn't support nested relation filtering easily
      const allSessions = await db.query.sessions.findMany({
        where: and(eq(sessions.isActive, false), isNotNull(sessions.endTime)),
        orderBy: [desc(sessions.date), desc(sessions.startTime)],
        with: {
          exercises: true,
          reflection: true,
          routine: true,
        },
      });

      // Filter in-memory for search query AND completedExercisesCount > 0
      const filtered = allSessions.filter((session) => {
        // First: require at least one completed exercise
        const completedCount = (session.exercises ?? []).filter(
          (e) => e.completedAt !== null,
        ).length;
        if (completedCount === 0) return false;

        // Then: match routine title OR exercise names
        if (session.routine?.title?.toLowerCase().includes(trimmedQuery)) {
          return true;
        }
        return session.exercises?.some((ex) => ex.name.toLowerCase().includes(trimmedQuery));
      });

      const historySessions = filtered.map(toHistorySession);

      set({ sessions: historySessions, isLoading: false });
      set({ hasMore: false });
    } catch (error) {
      console.error("Failed to search sessions:", error);
      set({ isLoading: false });
    }
  },

  filterByDateRange: async (startDate: string, endDate: string) => {
    set({ isLoading: true });

    try {
      // Wait for database to be initialized before querying
      await waitForDb();

      // Filter completed sessions by date range
      const allInRange = await db.query.sessions.findMany({
        where: (s, { and: andOp, gte, lte }) =>
          andOp(
            eq(s.isActive, false),
            isNotNull(s.endTime),
            gte(s.date, startDate),
            lte(s.date, endDate),
          ),
        orderBy: [desc(sessions.date), desc(sessions.startTime)],
        with: {
          routine: true,
          exercises: true,
          reflection: true,
        },
      });

      // Filter to only sessions with at least one completed exercise
      const filtered = allInRange.filter((session) => {
        const completedCount = (session.exercises ?? []).filter(
          (e) => e.completedAt !== null,
        ).length;
        return completedCount > 0;
      });

      const historySessions = filtered.map(toHistorySession);

      set({ sessions: historySessions, isLoading: false });
      set({ hasMore: false });
    } catch (error) {
      console.error("Failed to filter sessions:", error);
      set({ isLoading: false });
    }
  },

  /**
   * Check if a routine has a completed session for a specific date
   *
   * @param routineId - Routine ID to check
   * @param date - ISO date string (YYYY-MM-DD)
   * @returns true if routine has completed session with completed exercises
   */
  checkRoutineCompletedForDate: async (routineId: string, date: string): Promise<boolean> => {
    try {
      await waitForDb();

      const session = await db.query.sessions.findFirst({
        where: and(
          eq(sessions.routineId, routineId),
          eq(sessions.date, date),
          eq(sessions.isActive, false),
          isNotNull(sessions.endTime),
        ),
        with: {
          exercises: true,
        },
      });

      if (!session) return false;

      // Require at least one completed exercise
      const completedCount = (session.exercises ?? []).filter((e) => e.completedAt !== null).length;

      return completedCount > 0;
    } catch (error) {
      console.error("Failed to check routine completion:", error);
      return false;
    }
  },

  /**
   * Get set of completed routine IDs for a specific date (batch query)
   *
   * @param date - ISO date string (YYYY-MM-DD)
   * @returns Set of routine IDs that have completed sessions
   */
  getCompletedRoutineIdsForDate: async (date: string): Promise<Set<string>> => {
    try {
      await waitForDb();

      const completedSessions = await db.query.sessions.findMany({
        where: and(
          eq(sessions.date, date),
          eq(sessions.isActive, false),
          isNotNull(sessions.endTime),
          isNotNull(sessions.routineId), // Only sessions with routines
        ),
        with: {
          exercises: true,
        },
      });

      const completedRoutineIds = new Set<string>();

      for (const session of completedSessions) {
        if (!session.routineId) continue;

        const hasCompletedExercises = (session.exercises ?? []).some((e) => e.completedAt !== null);

        if (hasCompletedExercises) {
          completedRoutineIds.add(session.routineId);
        }
      }

      return completedRoutineIds;
    } catch (error) {
      console.error("Failed to get completed routine IDs:", error);
      return new Set();
    }
  },

  /**
   * Get session count per date for a date range (for weekly calendar indicators)
   *
   * @param startDate - Start date (inclusive, YYYY-MM-DD)
   * @param endDate - End date (inclusive, YYYY-MM-DD)
   * @returns Map of date -> count of completed sessions (sessions with endTime set)
   */
  getSessionsCountByDate: async (
    startDate: string,
    endDate: string,
  ): Promise<Map<string, number>> => {
    try {
      await waitForDb();

      const sessionsInRange = await db.query.sessions.findMany({
        where: (s, { and: andOp, gte, lte }) =>
          andOp(
            eq(s.isActive, false),
            isNotNull(s.endTime),
            gte(s.date, startDate),
            lte(s.date, endDate),
          ),
      });

      const countMap = new Map<string, number>();

      for (const session of sessionsInRange) {
        // Count all sessions with endTime set (completed sessions)
        const currentCount = countMap.get(session.date) || 0;
        countMap.set(session.date, currentCount + 1);
      }

      return countMap;
    } catch (error) {
      console.error("Failed to get sessions count by date:", error);
      return new Map();
    }
  },
}));
