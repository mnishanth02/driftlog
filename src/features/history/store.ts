import { asc, desc, eq } from "drizzle-orm";
import { create } from "zustand";
import { db, waitForDb } from "../../core/db";
import { exercises, reflections, sessions, sets } from "../../core/db/schema";
import { generateId, getNowString } from "../../core/utils/helpers";
import type { HistoryStore } from "./types";

const DEFAULT_PAGE_SIZE = 20;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  isLoading: false,
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

      const page = await db.query.sessions.findMany({
        orderBy: [desc(sessions.date), desc(sessions.startTime)],
        limit: pageSize,
        offset,
        with: {
          routine: true,
          exercises: true,
          reflection: true,
        },
      });

      const historySessions = page.map((session) => ({
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        planTitle: session.routine?.title ?? null,
        exerciseCount: session.exercises?.length ?? 0,
        hasReflection: !!session.reflection,
      }));

      set((state) => {
        if (reset) {
          // Replace entire list atomically - no intermediate empty state
          return {
            sessions: historySessions,
            isLoading: false,
            hasMore: historySessions.length === pageSize,
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
          hasMore: historySessions.length === pageSize,
        };
      });
    } catch (error) {
      console.error("Failed to load sessions:", error);
      set({ isLoading: false });
    }
  },

  refreshSessions: async () => {
    await get().loadSessions({ reset: true });
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

      // Search matches: routine title OR exercise names
      // Note: We fetch all with relations and filter in-memory for exercise names
      // since Drizzle doesn't support nested relation filtering easily
      const allSessions = await db.query.sessions.findMany({
        orderBy: [desc(sessions.date), desc(sessions.startTime)],
        with: {
          exercises: true,
          reflection: true,
          routine: true,
        },
      });

      // Filter in-memory (acceptable tradeoff: search is less frequent than browsing)
      const filtered = allSessions.filter((session) => {
        // Match routine title
        if (session.routine?.title?.toLowerCase().includes(trimmedQuery)) {
          return true;
        }
        // Match any exercise name
        return session.exercises?.some((ex) => ex.name.toLowerCase().includes(trimmedQuery));
      });

      const historySessions = filtered.map((session) => ({
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        planTitle: session.routine?.title ?? null,
        exerciseCount: session.exercises?.length ?? 0,
        hasReflection: !!session.reflection,
      }));

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

      // Use database-level filtering for better performance
      const filtered = await db.query.sessions.findMany({
        where: (sessions, { and, gte, lte }) =>
          and(gte(sessions.date, startDate), lte(sessions.date, endDate)),
        orderBy: [desc(sessions.date), desc(sessions.startTime)],
        with: {
          routine: true,
          exercises: true,
          reflection: true,
        },
      });

      const historySessions = filtered.map((session) => ({
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        planTitle: session.routine?.title ?? null,
        exerciseCount: session.exercises?.length ?? 0,
        hasReflection: !!session.reflection,
      }));

      set({ sessions: historySessions, isLoading: false });
      set({ hasMore: false });
    } catch (error) {
      console.error("Failed to filter sessions:", error);
      set({ isLoading: false });
    }
  },
}));
