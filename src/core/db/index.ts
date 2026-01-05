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
      `;

      expoDb.execSync(migrationSQL);
      console.log("✓ Database migrations completed");
    } else {
      console.log("✓ Database already initialized");
    }

    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}
