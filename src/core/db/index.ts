import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Open the database
const expoDb = openDatabaseSync("driftlog.db", { enableChangeListener: true });

// Create drizzle instance
export const db = drizzle(expoDb, { schema });

// Initialize database (run migrations if needed)
export async function initDatabase(): Promise<boolean> {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      await runMigrations();
      return true;
    } catch (error) {
      retryCount++;
      console.error(`Database initialization failed (attempt ${retryCount}/${maxRetries}):`, error);

      if (retryCount >= maxRetries) {
        console.error("❌ Database initialization failed after max retries");
        return false;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** retryCount));
    }
  }

  return false;
}

async function runMigrations() {
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
        console.error("❌ Database migration for plans table failed:", error);
        throw error; // Re-throw to trigger retry
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

    const ensureSessionsRoutineId = () => {
      try {
        const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(sessions)");
        const hasRoutineId = columns.some((c) => c.name === "routine_id");

        if (!hasRoutineId) {
          console.log("Migrating database: adding sessions.routine_id...");
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN routine_id text;");
          console.log("✓ Added sessions.routine_id");
        }
      } catch (error) {
        console.warn("Database migration for sessions.routine_id failed (non-fatal):", error);
      }
    };

    const ensureSessionsTargetDuration = () => {
      try {
        const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(sessions)");
        const hasTargetDuration = columns.some((c) => c.name === "target_duration");

        if (!hasTargetDuration) {
          console.log("Migrating database: adding sessions.target_duration...");
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN target_duration integer;");
          console.log("✓ Added sessions.target_duration");
        }
      } catch (error) {
        console.warn("Database migration for sessions.target_duration failed (non-fatal):", error);
      }
    };

    const ensureExercisesCompletedAt = () => {
      try {
        const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(exercises)");
        const hasCompletedAt = columns.some((c) => c.name === "completed_at");

        if (!hasCompletedAt) {
          console.log("Migrating database: adding exercises.completed_at...");
          expoDb.execSync("ALTER TABLE exercises ADD COLUMN completed_at text;");
          console.log("✓ Added exercises.completed_at");
        }
      } catch (error) {
        console.warn("Database migration for exercises.completed_at failed (non-fatal):", error);
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
      ensureSessionsRoutineId();
      ensureSessionsTargetDuration();
      ensureExercisesCompletedAt();
      ensureReflectionsTable();
    } else {
      console.log("✓ Database already initialized");

      ensurePlansTable();
      ensurePlansIsRestColumn();
      ensurePlannedExercisesTable();
      ensureRoutinesTables();
      ensureRoutinesPlannedDate();
      ensureSessionsRoutineId();
      ensureSessionsTargetDuration();
      ensureExercisesCompletedAt();
      ensureReflectionsTable();

      // Add performance indexes
      console.log("Creating performance indexes...");
      createPerformanceIndexes();
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error; // Re-throw to trigger retry in initDatabase
  }
}

function createPerformanceIndexes() {
  try {
    // Index for finding active sessions quickly
    expoDb.execSync(
      "CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active) WHERE is_active = 1;",
    );

    // Index for session date lookups
    expoDb.execSync("CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);");

    // Index for exercises by session
    expoDb.execSync(
      "CREATE INDEX IF NOT EXISTS idx_exercises_session_id ON exercises(session_id);",
    );

    // Index for sets by exercise
    expoDb.execSync("CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id);");

    // Index for routines by planned date
    expoDb.execSync(
      "CREATE INDEX IF NOT EXISTS idx_routines_planned_date ON routines(planned_date) WHERE planned_date IS NOT NULL;",
    );

    // Index for routine exercises by routine
    expoDb.execSync(
      "CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON routine_exercises(routine_id);",
    );

    console.log("✓ Performance indexes created");
  } catch (error) {
    console.warn("⚠️ Failed to create some indexes (non-fatal):", error);
  }
}
