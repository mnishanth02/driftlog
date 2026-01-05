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
    // In production, you'd run migrations here
    // For now, tables will be created via Drizzle Kit
    console.log("Database initialized");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}
