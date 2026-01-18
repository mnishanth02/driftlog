/**
 * Secure deletion utilities for DriftLog
 *
 * Provides methods to securely delete data by running VACUUM
 * after deletion to prevent data recovery.
 *
 * Note: This is a LOW priority security feature. SQLite VACUUM
 * rebuilds the database file, removing freed pages that might
 * contain deleted data.
 */

import { openDatabaseSync } from "expo-sqlite";
import { logger } from "./logger";

/**
 * Run VACUUM on the database to reclaim space and overwrite deleted data
 *
 * This should be called after sensitive deletions (sessions, reflections)
 * to ensure deleted data is not recoverable.
 *
 * CAUTION: VACUUM can be slow on large databases and blocks other operations.
 * Use sparingly, ideally when app is backgrounded or on explicit user action.
 *
 * @returns Promise<boolean> - True if VACUUM succeeded
 */
export async function vacuumDatabase(): Promise<boolean> {
  try {
    const db = openDatabaseSync("driftlog.db");
    db.execSync("VACUUM");
    logger.debug("Database VACUUM completed successfully", "secureDelete");
    return true;
  } catch (error) {
    logger.error("Database VACUUM failed", "secureDelete", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Schedule a VACUUM to run after a delay
 *
 * This allows the deletion operation to complete and return to the user
 * quickly, while still ensuring data is securely removed.
 *
 * @param delayMs - Delay in milliseconds before running VACUUM (default 5 seconds)
 */
export function scheduleVacuum(delayMs = 5000): void {
  setTimeout(() => {
    vacuumDatabase().catch(() => {
      // Error already logged in vacuumDatabase
    });
  }, delayMs);
}

/**
 * Wrapper for deletion operations that includes secure cleanup
 *
 * @param deleteOperation - Async function that performs the deletion
 * @param immediate - If true, runs VACUUM immediately; if false, schedules it
 * @returns Promise resolving to the result of the delete operation
 */
export async function secureDelete<T>(
  deleteOperation: () => Promise<T>,
  immediate = false,
): Promise<T> {
  try {
    const result = await deleteOperation();

    if (immediate) {
      await vacuumDatabase();
    } else {
      // Schedule VACUUM to run after a delay to avoid blocking the UI
      scheduleVacuum();
    }

    return result;
  } catch (error) {
    logger.error("Secure delete operation failed", "secureDelete", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Check if the database needs optimization
 *
 * This checks the fragmentation level of the database.
 * Can be used to decide whether to run VACUUM.
 *
 * @returns Promise<{ needsVacuum: boolean; freePages: number }>
 */
export async function checkDatabaseHealth(): Promise<{
  needsVacuum: boolean;
  freePages: number;
  pageSize: number;
  totalPages: number;
}> {
  try {
    const db = openDatabaseSync("driftlog.db");

    // Get database statistics
    const freelistCount = db.getFirstSync<{ freelist_count: number }>("PRAGMA freelist_count");
    const pageSize = db.getFirstSync<{ page_size: number }>("PRAGMA page_size");
    const pageCount = db.getFirstSync<{ page_count: number }>("PRAGMA page_count");

    const freePages = freelistCount?.freelist_count ?? 0;
    const totalPages = pageCount?.page_count ?? 0;
    const pageSizeValue = pageSize?.page_size ?? 4096;

    // Recommend VACUUM if more than 10% of pages are free
    const fragmentationRatio = totalPages > 0 ? freePages / totalPages : 0;
    const needsVacuum = fragmentationRatio > 0.1;

    logger.debug("Database health check", "secureDelete", {
      freePages,
      totalPages,
      pageSize: pageSizeValue,
      fragmentationRatio: `${(fragmentationRatio * 100).toFixed(1)}%`,
      needsVacuum,
    });

    return {
      needsVacuum,
      freePages,
      pageSize: pageSizeValue,
      totalPages,
    };
  } catch (error) {
    logger.error("Database health check failed", "secureDelete", {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      needsVacuum: false,
      freePages: 0,
      pageSize: 4096,
      totalPages: 0,
    };
  }
}
