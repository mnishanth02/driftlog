import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

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

/**
 * Initialize database (run migrations if needed)
 * Uses exponential backoff for retries on failure
 */
export async function initDatabase(): Promise<boolean> {
  if (isDbReady) return true;

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      runMigrations();
      isDbReady = true;
      console.log("✅ Database initialized successfully");
      return true;
    } catch (error) {
      console.error(`Database initialization failed (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt >= maxRetries) {
        console.error("❌ Database initialization failed after max retries");
        return false;
      }

      // Exponential backoff: 200ms, 400ms, 800ms...
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }

  return false;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a table exists in the database
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

/**
 * Get all column names for a table
 */
function getColumnNames(tableName: string): string[] {
  try {
    const columns = expoDb.getAllSync<{ name: string }>(`PRAGMA table_info(${tableName})`);
    return columns.map((c) => c.name);
  } catch {
    return [];
  }
}

/**
 * Check if a column exists in a table
 */
function columnExists(tableName: string, columnName: string): boolean {
  return getColumnNames(tableName).includes(columnName);
}

/**
 * Add a column to a table if it doesn't exist
 * Returns true if column was added, false if it already existed
 */
function addColumnIfMissing(tableName: string, columnName: string, columnDef: string): boolean {
  if (columnExists(tableName, columnName)) return false;

  try {
    expoDb.execSync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef};`);
    return true;
  } catch (error) {
    console.warn(`Failed to add column ${columnName} to ${tableName}:`, error);
    return false;
  }
}

// =============================================================================
// TABLE DEFINITIONS - Complete schema for each table
// =============================================================================

const TABLE_SCHEMAS = {
  sessions: `
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
    )`,

  exercises: `
    CREATE TABLE IF NOT EXISTS exercises (
      id text PRIMARY KEY NOT NULL,
      session_id text NOT NULL,
      name text NOT NULL,
      "order" integer NOT NULL,
      completed_at text,
      created_at text NOT NULL,
      updated_at text NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE cascade
    )`,

  sets: `
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
    )`,

  plans: `
    CREATE TABLE IF NOT EXISTS plans (
      id text PRIMARY KEY NOT NULL,
      date text NOT NULL,
      title text NOT NULL,
      notes text,
      is_rest integer DEFAULT 0 NOT NULL,
      created_at text NOT NULL,
      updated_at text NOT NULL
    )`,

  planned_exercises: `
    CREATE TABLE IF NOT EXISTS planned_exercises (
      id text PRIMARY KEY NOT NULL,
      plan_id text NOT NULL,
      name text NOT NULL,
      note text,
      "order" integer NOT NULL,
      created_at text NOT NULL,
      updated_at text NOT NULL,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE no action ON DELETE cascade
    )`,

  reflections: `
    CREATE TABLE IF NOT EXISTS reflections (
      id text PRIMARY KEY NOT NULL,
      session_id text NOT NULL,
      feeling text,
      notes text,
      created_at text NOT NULL,
      updated_at text NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE cascade
    )`,

  routines: `
    CREATE TABLE IF NOT EXISTS routines (
      id text PRIMARY KEY NOT NULL,
      title text NOT NULL,
      notes text,
      planned_date text,
      created_at text NOT NULL,
      updated_at text NOT NULL
    )`,

  routine_exercises: `
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id text PRIMARY KEY NOT NULL,
      routine_id text NOT NULL,
      name text NOT NULL,
      "order" integer NOT NULL,
      created_at text NOT NULL,
      updated_at text NOT NULL,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON UPDATE no action ON DELETE cascade
    )`,
} as const;

// =============================================================================
// COLUMN VERIFICATION - Required columns for each table
// =============================================================================

interface ColumnDefinition {
  name: string;
  definition: string;
  critical?: boolean; // If true, missing column requires table recreation
}

const TABLE_COLUMNS: Record<string, ColumnDefinition[]> = {
  sessions: [
    { name: "id", definition: "text PRIMARY KEY NOT NULL", critical: true },
    { name: "date", definition: "text NOT NULL", critical: true },
    { name: "start_time", definition: "text NOT NULL", critical: true },
    { name: "end_time", definition: "text" },
    { name: "is_active", definition: "integer DEFAULT 1 NOT NULL" },
    { name: "routine_id", definition: "text" },
    { name: "target_duration", definition: "integer" },
    { name: "plan_id", definition: "text" },
    { name: "created_at", definition: "text" },
    { name: "updated_at", definition: "text" },
  ],
  exercises: [
    { name: "id", definition: "text PRIMARY KEY NOT NULL", critical: true },
    { name: "session_id", definition: "text NOT NULL", critical: true },
    { name: "name", definition: "text NOT NULL", critical: true },
    { name: "order", definition: "integer NOT NULL", critical: true },
    { name: "completed_at", definition: "text" },
    { name: "created_at", definition: "text" },
    { name: "updated_at", definition: "text" },
  ],
  sets: [
    { name: "id", definition: "text PRIMARY KEY NOT NULL", critical: true },
    { name: "exercise_id", definition: "text NOT NULL", critical: true },
    { name: "reps", definition: "integer NOT NULL", critical: true },
    { name: "weight", definition: "real" },
    { name: "order", definition: "integer NOT NULL", critical: true },
    { name: "timestamp", definition: "text NOT NULL", critical: true },
    { name: "created_at", definition: "text" },
    { name: "updated_at", definition: "text" },
  ],
  plans: [
    { name: "id", definition: "text PRIMARY KEY NOT NULL", critical: true },
    { name: "date", definition: "text NOT NULL", critical: true },
    { name: "title", definition: "text NOT NULL", critical: true },
    { name: "notes", definition: "text" },
    { name: "is_rest", definition: "integer DEFAULT 0" },
    { name: "created_at", definition: "text" },
    { name: "updated_at", definition: "text" },
  ],
  planned_exercises: [
    { name: "id", definition: "text PRIMARY KEY NOT NULL", critical: true },
    { name: "plan_id", definition: "text NOT NULL", critical: true },
    { name: "name", definition: "text NOT NULL", critical: true },
    { name: "note", definition: "text" },
    { name: "order", definition: "integer NOT NULL", critical: true },
    { name: "created_at", definition: "text" },
    { name: "updated_at", definition: "text" },
  ],
  reflections: [
    { name: "id", definition: "text PRIMARY KEY NOT NULL", critical: true },
    { name: "session_id", definition: "text NOT NULL", critical: true },
    { name: "feeling", definition: "text" },
    { name: "notes", definition: "text" },
    { name: "created_at", definition: "text" },
    { name: "updated_at", definition: "text" },
  ],
  routines: [
    { name: "id", definition: "text PRIMARY KEY NOT NULL", critical: true },
    { name: "title", definition: "text NOT NULL", critical: true },
    { name: "notes", definition: "text" },
    { name: "planned_date", definition: "text" },
    { name: "created_at", definition: "text" },
    { name: "updated_at", definition: "text" },
  ],
  routine_exercises: [
    { name: "id", definition: "text PRIMARY KEY NOT NULL", critical: true },
    { name: "routine_id", definition: "text NOT NULL", critical: true },
    { name: "name", definition: "text NOT NULL", critical: true },
    { name: "order", definition: "integer NOT NULL", critical: true },
    { name: "created_at", definition: "text" },
    { name: "updated_at", definition: "text" },
  ],
};

// =============================================================================
// MIGRATION LOGIC
// =============================================================================

/**
 * Ensure a table exists and has all required columns
 * If critical columns are missing, recreates the table
 */
function ensureTable(tableName: keyof typeof TABLE_SCHEMAS): void {
  const schema = TABLE_SCHEMAS[tableName];
  const columns = TABLE_COLUMNS[tableName];

  if (!tableExists(tableName)) {
    // Table doesn't exist - create it fresh
    expoDb.execSync(schema);
    return;
  }

  // Table exists - verify columns
  const existingColumns = getColumnNames(tableName);
  const criticalMissing = columns
    .filter((col) => col.critical && !existingColumns.includes(col.name))
    .map((col) => col.name);

  if (criticalMissing.length > 0) {
    // Critical columns missing - table is corrupt, recreate it
    console.warn(
      `Table "${tableName}" missing critical columns: ${criticalMissing.join(", ")}. Recreating...`,
    );
    expoDb.execSync(`DROP TABLE IF EXISTS ${tableName};`);
    expoDb.execSync(schema);
    return;
  }

  // Add any missing non-critical columns
  for (const col of columns) {
    if (!col.critical && !existingColumns.includes(col.name)) {
      addColumnIfMissing(tableName, col.name, col.definition);
    }
  }
}

/**
 * Create all performance indexes
 */
function createIndexes(): void {
  const indexes = [
    // Session indexes
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active) WHERE is_active = 1",
      requires: { table: "sessions", column: "is_active" },
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date)",
      requires: { table: "sessions", column: "date" },
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_sessions_date_range ON sessions(date, start_time)",
      requires: { table: "sessions", column: "start_time" },
    },
    // Exercise indexes
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_exercises_session_id ON exercises(session_id)",
      requires: { table: "exercises", column: "session_id" },
    },
    // Set indexes
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id)",
      requires: { table: "sets", column: "exercise_id" },
    },
    // Routine indexes
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_routines_planned_date ON routines(planned_date) WHERE planned_date IS NOT NULL",
      requires: { table: "routines", column: "planned_date" },
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON routine_exercises(routine_id)",
      requires: { table: "routine_exercises", column: "routine_id" },
    },
    // Plan indexes
    {
      sql: "CREATE UNIQUE INDEX IF NOT EXISTS plans_date_unique ON plans(date)",
      requires: { table: "plans", column: "date" },
    },
    {
      sql: "CREATE INDEX IF NOT EXISTS planned_exercises_plan_id_idx ON planned_exercises(plan_id)",
      requires: { table: "planned_exercises", column: "plan_id" },
    },
    // Reflection indexes
    {
      sql: "CREATE UNIQUE INDEX IF NOT EXISTS reflections_session_id_unique ON reflections(session_id)",
      requires: { table: "reflections", column: "session_id" },
    },
  ];

  for (const index of indexes) {
    try {
      if (
        tableExists(index.requires.table) &&
        columnExists(index.requires.table, index.requires.column)
      ) {
        expoDb.execSync(index.sql);
      }
    } catch (error) {
      // Index creation failures are non-fatal
      console.warn(`Failed to create index: ${error}`);
    }
  }
}

/**
 * Run all database migrations
 * Ensures all tables exist with correct schema and indexes
 */
function runMigrations(): void {
  try {
    // Order matters for foreign key dependencies:
    // 1. Plans (referenced by sessions)
    // 2. Sessions (referenced by exercises, reflections)
    // 3. Exercises (referenced by sets)
    // 4. Sets
    // 5. Other tables

    ensureTable("plans");
    ensureTable("planned_exercises");
    ensureTable("routines");
    ensureTable("routine_exercises");
    ensureTable("sessions");
    ensureTable("exercises");
    ensureTable("sets");
    ensureTable("reflections");

    // Create all indexes after tables are ready
    createIndexes();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}
