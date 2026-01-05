import { eq } from "drizzle-orm";
import { create } from "zustand";
import { db } from "../../core/db";
import { plans } from "../../core/db/schema";
import { generateId, getNowString, getWeekDates } from "../../core/utils/helpers";
import type { Plan, PlanningStore } from "./types";

export const usePlanningStore = create<PlanningStore>((set, get) => ({
  // State
  weekPlans: new Map(),
  currentWeekDates: [],
  isLoading: false,

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

  savePlan: async (date: string, title: string, notes: string | null) => {
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
            updatedAt: now,
          })
          .where(eq(plans.id, existingPlan.id));

        const updatedMap = new Map(weekPlans);
        updatedMap.set(date, { ...existingPlan, title, notes });
        set({ weekPlans: updatedMap });
      } else {
        // Create new plan
        const planId = generateId();
        await db.insert(plans).values({
          id: planId,
          date,
          title,
          notes,
          createdAt: now,
          updatedAt: now,
        });

        const updatedMap = new Map(weekPlans);
        updatedMap.set(date, { id: planId, date, title, notes });
        set({ weekPlans: updatedMap });
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
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
      set({ weekPlans: updatedMap });
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
