import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Open the database
const expoDb = openDatabaseSync("driftlog.db", { enableChangeListener: true });

// Create drizzle instance
export const db = drizzle(expoDb, { schema });

// Initialize database (run migrations if needed)
export async function initDatabase() {
  try {
    const ensurePlansTable = () => {
      try {
        const existing = expoDb.getFirstSync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='plans'",
        );

        if (!existing) {
          console.log("Migrating database: creating plans table...");
          expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS plans (
              id text PRIMARY KEY NOT NULL,
              date text NOT NULL,
              title text NOT NULL,
              notes text,
              is_rest integer DEFAULT 0 NOT NULL,
              created_at text NOT NULL,
              updated_at text NOT NULL
            );
            CREATE UNIQUE INDEX IF NOT EXISTS plans_date_unique ON plans (date);
          `);
          console.log("✓ Created plans table");
        }
      } catch (error) {
        console.warn("Database migration for plans table failed:", error);
      }
    };

    const ensurePlansIsRestColumn = () => {
      try {
        // Intentionally keep this idempotent: existing installs won't have new columns.
        const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(plans)");
        const hasIsRest = columns.some((c) => c.name === "is_rest");

        if (!hasIsRest) {
          console.log("Migrating database: adding plans.is_rest...");
          expoDb.execSync("ALTER TABLE plans ADD COLUMN is_rest integer DEFAULT 0;");
          expoDb.execSync("UPDATE plans SET is_rest = 0 WHERE is_rest IS NULL;");
          console.log("✓ Added plans.is_rest");
        }
      } catch (error) {
        // If anything goes wrong here, leave the DB as-is; the app can still run.
        console.warn("Database migration for plans.is_rest failed (non-fatal):", error);
      }
    };

    const ensurePlannedExercisesTable = () => {
      try {
        const existing = expoDb.getFirstSync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='planned_exercises'",
        );

        if (!existing) {
          console.log("Migrating database: creating planned_exercises table...");
          expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS planned_exercises (
              id text PRIMARY KEY NOT NULL,
              plan_id text NOT NULL,
              name text NOT NULL,
              note text,
              "order" integer NOT NULL,
              created_at text NOT NULL,
              updated_at text NOT NULL,
              FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE no action ON DELETE cascade
            );
            CREATE INDEX IF NOT EXISTS planned_exercises_plan_id_idx ON planned_exercises (plan_id);
          `);
          console.log("✓ Created planned_exercises");
        }
      } catch (error) {
        console.warn("Database migration for planned_exercises failed (non-fatal):", error);
      }
    };

    const ensureRoutinesTables = () => {
      try {
        const existing = expoDb.getFirstSync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='routines'",
        );

        if (!existing) {
          console.log("Migrating database: creating routines and routine_exercises tables...");
          expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS routines (
              id text PRIMARY KEY NOT NULL,
              title text NOT NULL,
              notes text,
              planned_date text,
              created_at text NOT NULL,
              updated_at text NOT NULL
            );

            CREATE TABLE IF NOT EXISTS routine_exercises (
              id text PRIMARY KEY NOT NULL,
              routine_id text NOT NULL,
              name text NOT NULL,
              "order" integer NOT NULL,
              created_at text NOT NULL,
              updated_at text NOT NULL,
              FOREIGN KEY (routine_id) REFERENCES routines(id) ON UPDATE no action ON DELETE cascade
            );
          `);
          console.log("✓ Created routines and routine_exercises");
        }
      } catch (error) {
        console.warn("Database migration for routines failed (non-fatal):", error);
      }
    };

    const ensureRoutinesPlannedDate = () => {
      try {
        const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(routines)");
        const hasPlannedDate = columns.some((c) => c.name === "planned_date");

        if (!hasPlannedDate) {
          console.log("Migrating database: adding routines.planned_date...");
          expoDb.execSync("ALTER TABLE routines ADD COLUMN planned_date text;");
          console.log("✓ Added routines.planned_date");
        }
      } catch (error) {
        console.warn("Database migration for routines.planned_date failed (non-fatal):", error);
      }
    };

    const ensureSessionsPlanId = () => {
      try {
        const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(sessions)");
        const hasPlanId = columns.some((c) => c.name === "plan_id");

        if (!hasPlanId) {
          console.log("Migrating database: adding sessions.plan_id...");
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN plan_id text;");
          console.log("✓ Added sessions.plan_id");
        }
      } catch (error) {
        console.warn("Database migration for sessions.plan_id failed (non-fatal):", error);
      }
    };

    const ensureReflectionsTable = () => {
      try {
        const existing = expoDb.getFirstSync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='reflections'",
        );

        if (!existing) {
          console.log("Migrating database: creating reflections table...");
          expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS reflections (
              id text PRIMARY KEY NOT NULL,
              session_id text NOT NULL,
              feeling text,
              notes text,
              created_at text NOT NULL,
              updated_at text NOT NULL,
              FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE cascade
            );
            CREATE UNIQUE INDEX IF NOT EXISTS reflections_session_id_unique ON reflections (session_id);
          `);
          console.log("✓ Created reflections table");
        }
      } catch (error) {
        console.warn("Database migration for reflections failed (non-fatal):", error);
      }
    };

    // Check if tables exist
    const result = expoDb.getFirstSync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'",
    );

    if (!result) {
      console.log("Running database migrations...");

      // Run migration SQL
      const migrationSQL = `
        CREATE TABLE IF NOT EXISTS exercises (
          id text PRIMARY KEY NOT NULL,
          session_id text NOT NULL,
          name text NOT NULL,
          "order" integer NOT NULL,
          created_at text NOT NULL,
          updated_at text NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE cascade
        );
        
        CREATE TABLE IF NOT EXISTS plans (
          id text PRIMARY KEY NOT NULL,
          date text NOT NULL,
          title text NOT NULL,
          notes text,
          is_rest integer DEFAULT 0 NOT NULL,
          created_at text NOT NULL,
          updated_at text NOT NULL
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS plans_date_unique ON plans (date);
        
        CREATE TABLE IF NOT EXISTS reflections (
          id text PRIMARY KEY NOT NULL,
          session_id text NOT NULL,
          feeling text,
          notes text,
          created_at text NOT NULL,
          updated_at text NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE cascade
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS reflections_session_id_unique ON reflections (session_id);
        
        CREATE TABLE IF NOT EXISTS sessions (
          id text PRIMARY KEY NOT NULL,
          date text NOT NULL,
          start_time text NOT NULL,
          end_time text,
          is_active integer DEFAULT 1 NOT NULL,
          plan_id text,
          created_at text NOT NULL,
          updated_at text NOT NULL,
          FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE no action ON DELETE no action
        );
        
        CREATE TABLE IF NOT EXISTS sets (
          id text PRIMARY KEY NOT NULL,
          exercise_id text NOT NULL,
          reps integer NOT NULL,
          weight real,
          "order" integer NOT NULL,
          timestamp text NOT NULL,
          created_at text NOT NULL,
          updated_at text NOT NULL,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON UPDATE no action ON DELETE cascade
        );

        CREATE TABLE IF NOT EXISTS planned_exercises (
          id text PRIMARY KEY NOT NULL,
          plan_id text NOT NULL,
          name text NOT NULL,
          note text,
          "order" integer NOT NULL,
          created_at text NOT NULL,
          updated_at text NOT NULL,
          FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE no action ON DELETE cascade
        );

        CREATE INDEX IF NOT EXISTS planned_exercises_plan_id_idx ON planned_exercises (plan_id);
      `;

      expoDb.execSync(migrationSQL);
      console.log("✓ Database migrations completed");

      ensurePlansTable();
      ensurePlansIsRestColumn();
      ensurePlannedExercisesTable();
      ensureRoutinesTables();
      ensureRoutinesPlannedDate();
      ensureSessionsPlanId();
      ensureReflectionsTable();
    } else {
      console.log("✓ Database already initialized");

      ensurePlansTable();
      ensurePlansIsRestColumn();
      ensurePlannedExercisesTable();
      ensureRoutinesTables();
      ensureRoutinesPlannedDate();
      ensureSessionsPlanId();
      ensureReflectionsTable();
    }

    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}
