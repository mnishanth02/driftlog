import { eq } from "drizzle-orm";
import { create } from "zustand";
import { db } from "../../core/db";
import { plannedExercises, plans } from "../../core/db/schema";
import { generateId, getNowString, getWeekDates } from "../../core/utils/helpers";
import type { Plan, PlannedExercise, PlanningStore } from "./types";

export const usePlanningStore = create<PlanningStore>((set, get) => ({
  // State
  weekPlans: new Map(),
  currentWeekDates: [],
  isLoading: false,
  activeDate: null,
  activePlan: null,
  activeExercises: [],
  isDayLoading: false,

  // Actions
  loadWeek: async (weekStartDate?: Date) => {
    set({ isLoading: true });

    try {
      const weekDates = getWeekDates(weekStartDate);

      // Fetch all plans for this week
      const weekPlans = await db.query.plans.findMany({
        where: (plans, { inArray }) => inArray(plans.date, weekDates),
      });

      // Convert to Map
      const plansMap = new Map<string, Plan>();
      for (const plan of weekPlans) {
        plansMap.set(plan.date, {
          id: plan.id,
          date: plan.date,
          title: plan.title,
          notes: plan.notes,
          isRest: plan.isRest,
        });
      }

      set({
        weekPlans: plansMap,
        currentWeekDates: weekDates,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load week plans:", error);
      set({ isLoading: false });
    }
  },

  loadDay: async (date: string) => {
    set({ isDayLoading: true, activeDate: date });

    try {
      const plan = await db.query.plans.findFirst({
        where: (plans, { eq }) => eq(plans.date, date),
      });

      if (!plan) {
        set({ activePlan: null, activeExercises: [], isDayLoading: false });
        return;
      }

      const items = await db.query.plannedExercises.findMany({
        where: (plannedExercises, { eq }) => eq(plannedExercises.planId, plan.id),
        orderBy: (plannedExercises, { asc }) => [asc(plannedExercises.order)],
      });

      const mappedPlan: Plan = {
        id: plan.id,
        date: plan.date,
        title: plan.title,
        notes: plan.notes,
        isRest: plan.isRest,
      };

      const mappedItems: PlannedExercise[] = items.map((i) => ({
        id: i.id,
        planId: i.planId,
        name: i.name,
        note: i.note,
        order: i.order,
      }));

      set({ activePlan: mappedPlan, activeExercises: mappedItems, isDayLoading: false });
    } catch (error) {
      console.error("Failed to load day plan:", error);
      set({ isDayLoading: false });
    }
  },

  savePlan: async (date: string, title: string, notes: string | null, isRest: boolean) => {
    const { weekPlans } = get();
    const existingPlan = weekPlans.get(date);
    const now = getNowString();

    try {
      if (existingPlan) {
        // Update existing plan
        await db
          .update(plans)
          .set({
            title,
            notes,
            isRest,
            updatedAt: now,
          })
          .where(eq(plans.id, existingPlan.id));

        const updatedMap = new Map(weekPlans);
        updatedMap.set(date, { ...existingPlan, title, notes, isRest });
        set((state) => ({
          weekPlans: updatedMap,
          activePlan:
            state.activePlan?.date === date
              ? { ...state.activePlan, title, notes, isRest }
              : state.activePlan,
        }));

        return existingPlan.id;
      } else {
        // Create new plan
        const planId = generateId();
        await db.insert(plans).values({
          id: planId,
          date,
          title,
          notes,
          isRest,
          createdAt: now,
          updatedAt: now,
        });

        const updatedMap = new Map(weekPlans);
        updatedMap.set(date, { id: planId, date, title, notes, isRest });
        set((state) => ({
          weekPlans: updatedMap,
          activePlan:
            state.activeDate === date
              ? { id: planId, date, title, notes, isRest }
              : state.activePlan,
        }));

        return planId;
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
      throw error;
    }
  },

  replacePlannedExercises: async (planId: string, items: Omit<PlannedExercise, "planId">[]) => {
    const now = getNowString();

    try {
      await db.delete(plannedExercises).where(eq(plannedExercises.planId, planId));

      if (items.length > 0) {
        for (const item of items) {
          await db.insert(plannedExercises).values({
            id: item.id,
            planId,
            name: item.name,
            note: item.note,
            order: item.order,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      set((state) => ({
        activeExercises:
          state.activePlan?.id === planId
            ? items.map((i) => ({ ...i, planId }))
            : state.activeExercises,
      }));
    } catch (error) {
      console.error("Failed to save planned exercises:", error);
      throw error;
    }
  },

  deletePlan: async (date: string) => {
    const { weekPlans } = get();
    const existingPlan = weekPlans.get(date);

    if (!existingPlan) return;

    try {
      await db.delete(plans).where(eq(plans.id, existingPlan.id));

      const updatedMap = new Map(weekPlans);
      updatedMap.delete(date);
      set((state) => ({
        weekPlans: updatedMap,
        activePlan: state.activePlan?.date === date ? null : state.activePlan,
        activeExercises: state.activePlan?.date === date ? [] : state.activeExercises,
      }));
    } catch (error) {
      console.error("Failed to delete plan:", error);
      throw error;
    }
  },

  getPlanForDate: (date: string) => {
    const { weekPlans } = get();
    return weekPlans.get(date);
  },
}));
