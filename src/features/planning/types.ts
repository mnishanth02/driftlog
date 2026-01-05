export type Plan = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes: string | null;
};

export type PlanningState = {
  weekPlans: Map<string, Plan>; // date -> plan
  currentWeekDates: string[];
  isLoading: boolean;
};

export type PlanningActions = {
  loadWeek: (weekStartDate?: Date) => Promise<void>;
  savePlan: (date: string, title: string, notes: string | null) => Promise<void>;
  deletePlan: (date: string) => Promise<void>;
  getPlanForDate: (date: string) => Plan | undefined;
};

export type PlanningStore = PlanningState & PlanningActions;
