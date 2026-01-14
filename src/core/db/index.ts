import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Open the database
const expoDb = openDatabaseSync("driftlog.db", { enableChangeListener: true });

// Create drizzle instance
export const db = drizzle(expoDb, { schema });

// Database initialization state - prevents race conditions
let dbInitPromise: Promise<boolean> | null = null;
let isDbReady = false;

/**
 * Wait for the database to be initialized.
 * Use this before any database operations to prevent race conditions.
 * Safe to call multiple times - will only initialize once.
 */
export async function waitForDb(): Promise<void> {
  if (isDbReady) return;

  if (!dbInitPromise) {
    dbInitPromise = initDatabase();
  }

  const success = await dbInitPromise;
  if (!success) {
    throw new Error("Database initialization failed");
  }
}

/**
 * Check if the database is ready (synchronous check).
 * Use this for conditional rendering without async.
 */
export function isDbInitialized(): boolean {
  return isDbReady;
}

// Initialize database (run migrations if needed)
export async function initDatabase(): Promise<boolean> {
  // If already initialized, return immediately
  if (isDbReady) return true;

  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      await runMigrations();
      isDbReady = true;
      console.log("✅ Database initialized successfully");
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
          expoDb.execSync("ALTER TABLE plans ADD COLUMN is_rest integer DEFAULT 0;");
          expoDb.execSync("UPDATE plans SET is_rest = 0 WHERE is_rest IS NULL;");
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
          expoDb.execSync("ALTER TABLE routines ADD COLUMN planned_date text;");
        }
      } catch (error) {
        console.warn("Database migration for routines.planned_date failed (non-fatal):", error);
      }
    };

    const ensureReflectionsTable = () => {
      try {
        const existing = expoDb.getFirstSync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='reflections'",
        );

        if (!existing) {
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
        }
      } catch (error) {
        console.warn("Database migration for reflections failed (non-fatal):", error);
      }
    };

    const ensureSessionsColumns = () => {
      try {
        // First check if sessions table exists
        if (!tableExists("sessions")) return;

        const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(sessions)");
        const columnNames = columns.map((c) => c.name);

        // Check if critical columns are missing - if so, table is corrupt and needs recreation
        const criticalColumns = ["start_time", "date"];
        const missingCritical = criticalColumns.filter((col) => !columnNames.includes(col));

        if (missingCritical.length > 0) {
          console.warn(
            `Sessions table is missing critical columns: ${missingCritical.join(", ")}. Recreating table.`,
          );
          // Drop and recreate table (data loss acceptable for corrupt schema)
          expoDb.execSync("DROP TABLE IF EXISTS sessions;");
          expoDb.execSync(`
            CREATE TABLE sessions (
              id text PRIMARY KEY NOT NULL,
              date text NOT NULL,
              start_time text NOT NULL,
              end_time text,
              is_active integer DEFAULT 1 NOT NULL,
              routine_id text,
              target_duration integer,
              plan_id text,
              created_at text NOT NULL,
              updated_at text NOT NULL
            );
          `);
          return;
        }

        // Ensure optional columns exist (safe to add with defaults)
        if (!columnNames.includes("end_time")) {
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN end_time text;");
        }
        if (!columnNames.includes("created_at")) {
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN created_at text;");
        }
        if (!columnNames.includes("updated_at")) {
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN updated_at text;");
        }
        if (!columnNames.includes("is_active")) {
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN is_active integer DEFAULT 1 NOT NULL;");
        }
        if (!columnNames.includes("routine_id")) {
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN routine_id text;");
        }
        if (!columnNames.includes("target_duration")) {
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN target_duration integer;");
        }
        if (!columnNames.includes("plan_id")) {
          expoDb.execSync("ALTER TABLE sessions ADD COLUMN plan_id text;");
        }
      } catch (error) {
        console.warn("Database migration for sessions columns failed (non-fatal):", error);
      }
    };

    const ensureExercisesTable = () => {
      try {
        if (tableExists("exercises")) return;

        expoDb.execSync(`
          CREATE TABLE IF NOT EXISTS exercises (
            id text PRIMARY KEY NOT NULL,
            session_id text NOT NULL,
            name text NOT NULL,
            "order" integer NOT NULL,
            completed_at text,
            created_at text NOT NULL,
            updated_at text NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE cascade
          );
        `);
      } catch (error) {
        console.warn("Database migration for exercises table failed (non-fatal):", error);
      }
    };

    const ensureSetsTable = () => {
      try {
        if (tableExists("sets")) return;

        expoDb.execSync(`
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
        `);
      } catch (error) {
        console.warn("Database migration for sets table failed (non-fatal):", error);
      }
    };

    const ensureExercisesColumns = () => {
      try {
        // First check if exercises table exists
        if (!tableExists("exercises")) return;

        const columns = expoDb.getAllSync<{ name: string }>("PRAGMA table_info(exercises)");
        const columnNames = columns.map((c) => c.name);

        // Ensure completed_at column exists
        if (!columnNames.includes("completed_at")) {
          expoDb.execSync("ALTER TABLE exercises ADD COLUMN completed_at text;");
        }
      } catch (error) {
        console.warn("Database migration for exercises columns failed (non-fatal):", error);
      }
    };

    // Check if tables exist
    const result = expoDb.getFirstSync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'",
    );

    if (!result) {
      // Run migration SQL - create all tables with complete schema
      const migrationSQL = `
        CREATE TABLE IF NOT EXISTS sessions (
          id text PRIMARY KEY NOT NULL,
          date text NOT NULL,
          start_time text NOT NULL,
          end_time text,
          is_active integer DEFAULT 1 NOT NULL,
          routine_id text,
          target_duration integer,
          plan_id text,
          created_at text NOT NULL,
          updated_at text NOT NULL,
          FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE no action ON DELETE no action
        );
        
        CREATE TABLE IF NOT EXISTS exercises (
          id text PRIMARY KEY NOT NULL,
          session_id text NOT NULL,
          name text NOT NULL,
          "order" integer NOT NULL,
          completed_at text,
          created_at text NOT NULL,
          updated_at text NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE cascade
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

      ensurePlansTable();
      ensurePlansIsRestColumn();
      ensurePlannedExercisesTable();
      ensureRoutinesTables();
      ensureRoutinesPlannedDate();
      ensureReflectionsTable();
      ensureSessionsColumns();
      ensureExercisesTable();
      ensureSetsTable();
      ensureExercisesColumns();
    } else {
      // Sessions table exists - ensure all core tables exist FIRST
      // (critical: exercises/sets tables may be missing in partial migration state)
      ensureExercisesTable();
      ensureSetsTable();

      // Then ensure all columns are present
      ensureSessionsColumns();
      ensureExercisesColumns();

      // Then ensure other tables exist
      ensurePlansTable();
      ensurePlansIsRestColumn();
      ensurePlannedExercisesTable();
      ensureRoutinesTables();
      ensureRoutinesPlannedDate();
      ensureReflectionsTable();

      // Add performance indexes AFTER all tables and columns are ensured
      createPerformanceIndexes();
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error; // Re-throw to trigger retry in initDatabase
  }
}

/**
 * Helper to check if a column exists in a table
 */
function columnExists(tableName: string, columnName: string): boolean {
  try {
    const columns = expoDb.getAllSync<{ name: string }>(`PRAGMA table_info(${tableName})`);
    return columns.some((c) => c.name === columnName);
  } catch {
    return false;
  }
}

/**
 * Helper to check if a table exists
 */
function tableExists(tableName: string): boolean {
  try {
    const result = expoDb.getFirstSync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
    );
    return !!result;
  } catch {
    return false;
  }
}

function createPerformanceIndexes() {
  try {
    // Index for finding active sessions quickly (only if column exists)
    if (tableExists("sessions") && columnExists("sessions", "is_active")) {
      expoDb.execSync(
        "CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active) WHERE is_active = 1;",
      );
    }

    // Index for session date lookups
    if (tableExists("sessions") && columnExists("sessions", "date")) {
      expoDb.execSync("CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);");
    }

    // Compound index for date range queries (optimizes history filtering)
    if (
      tableExists("sessions") &&
      columnExists("sessions", "date") &&
      columnExists("sessions", "start_time")
    ) {
      expoDb.execSync(
        "CREATE INDEX IF NOT EXISTS idx_sessions_date_range ON sessions(date, start_time);",
      );
    }

    // Index for exercises by session
    if (tableExists("exercises") && columnExists("exercises", "session_id")) {
      expoDb.execSync(
        "CREATE INDEX IF NOT EXISTS idx_exercises_session_id ON exercises(session_id);",
      );
    }

    // Index for sets by exercise
    if (tableExists("sets") && columnExists("sets", "exercise_id")) {
      expoDb.execSync("CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id);");
    }

    // Index for routines by planned date
    if (tableExists("routines") && columnExists("routines", "planned_date")) {
      expoDb.execSync(
        "CREATE INDEX IF NOT EXISTS idx_routines_planned_date ON routines(planned_date) WHERE planned_date IS NOT NULL;",
      );
    }

    // Index for routine exercises by routine
    if (tableExists("routine_exercises") && columnExists("routine_exercises", "routine_id")) {
      expoDb.execSync(
        "CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON routine_exercises(routine_id);",
      );
    }
  } catch (error) {
    console.warn("⚠️ Failed to create some indexes (non-fatal):", error);
  }
}
