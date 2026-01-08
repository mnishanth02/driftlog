import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  startTime: text("start_time").notNull(), // ISO datetime
  endTime: text("end_time"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  planId: text("plan_id").references(() => plans.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  plan: one(plans, {
    fields: [sessions.planId],
    references: [plans.id],
  }),
  exercises: many(exercises),
  reflection: one(reflections),
}));

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  session: one(sessions, {
    fields: [exercises.sessionId],
    references: [sessions.id],
  }),
  sets: many(sets),
}));

export const sets = sqliteTable("sets", {
  id: text("id").primaryKey(),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  reps: integer("reps").notNull(),
  weight: real("weight"),
  order: integer("order").notNull(),
  timestamp: text("timestamp").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const setsRelations = relations(sets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [sets.exerciseId],
    references: [exercises.id],
  }),
}));

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(), // One plan per day
  title: text("title").notNull(),
  notes: text("notes"),
  isRest: integer("is_rest", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const plannedExercises = sqliteTable("planned_exercises", {
  id: text("id").primaryKey(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  note: text("note"),
  order: integer("order").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const plansRelations = relations(plans, ({ many }) => ({
  sessions: many(sessions),
  plannedExercises: many(plannedExercises),
}));

export const plannedExercisesRelations = relations(plannedExercises, ({ one }) => ({
  plan: one(plans, {
    fields: [plannedExercises.planId],
    references: [plans.id],
  }),
}));

export const reflections = sqliteTable("reflections", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" })
    .unique(), // One reflection per session
  feeling: text("feeling"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const reflectionsRelations = relations(reflections, ({ one }) => ({
  session: one(sessions, {
    fields: [reflections.sessionId],
    references: [sessions.id],
  }),
}));

export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  notes: text("notes"),
  plannedDate: text("planned_date"), // ISO date string - when this routine is planned
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const routineExercises = sqliteTable("routine_exercises", {
  id: text("id").primaryKey(),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const routinesRelations = relations(routines, ({ many }) => ({
  exercises: many(routineExercises),
}));

export const routineExercisesRelations = relations(routineExercises, ({ one }) => ({
  routine: one(routines, {
    fields: [routineExercises.routineId],
    references: [routines.id],
  }),
}));
