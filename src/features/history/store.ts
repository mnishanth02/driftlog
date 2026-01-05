import { asc, desc, eq } from "drizzle-orm";
import { create } from "zustand";
import { db } from "../../core/db";
import { exercises, reflections, sessions, sets } from "../../core/db/schema";
import { generateId, getNowString } from "../../core/utils/helpers";
import type { HistoryStore } from "./types";

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  isLoading: false,

  // Actions
  loadSessions: async () => {
    set({ isLoading: true });

    try {
      // Fetch all sessions with their related data
      const allSessions = await db.query.sessions.findMany({
        orderBy: [desc(sessions.date), desc(sessions.startTime)],
        with: {
          exercises: true,
          reflection: true,
          plan: true,
        },
      });

      const historySessions = allSessions.map((session) => ({
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        planTitle: session.plan?.title ?? null,
        exerciseCount: session.exercises?.length ?? 0,
        hasReflection: !!session.reflection,
      }));

      set({ sessions: historySessions, isLoading: false });
    } catch (error) {
      console.error("Failed to load sessions:", error);
      set({ isLoading: false });
    }
  },

  loadSessionDetail: async (sessionId: string) => {
    set({ isLoading: true });

    try {
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
          plan: true,
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
        planTitle: session.plan?.title ?? null,
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
}));
