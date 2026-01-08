export type Plan = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes: string | null;
  isRest: boolean;
};

export type PlannedExercise = {
  id: string;
  planId: string;
  name: string;
  note: string | null;
  order: number;
};

export type PlanningState = {
  weekPlans: Map<string, Plan>; // date -> plan
  currentWeekDates: string[];
  isLoading: boolean;
  activeDate: string | null;
  activePlan: Plan | null;
  activeExercises: PlannedExercise[];
  isDayLoading: boolean;
};

export type PlanningActions = {
  loadWeek: (weekStartDate?: Date) => Promise<void>;
  loadDay: (date: string) => Promise<void>;
  savePlan: (date: string, title: string, notes: string | null, isRest: boolean) => Promise<string>;
  replacePlannedExercises: (
    planId: string,
    items: Omit<PlannedExercise, "planId">[],
  ) => Promise<void>;
  deletePlan: (date: string) => Promise<void>;
  getPlanForDate: (date: string) => Plan | undefined;
};

export type PlanningStore = PlanningState & PlanningActions;
