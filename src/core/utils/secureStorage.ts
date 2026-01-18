/**
 * Secure Storage wrapper for sensitive data
 *
 * Uses expo-secure-store when available, with fallback to AsyncStorage.
 * expo-secure-store uses Keychain on iOS and EncryptedSharedPreferences on Android.
 *
 * IMPORTANT: expo-secure-store has a 2KB limit per item.
 * For larger data, this module chunks the data across multiple keys.
 *
 * NOTE: expo-secure-store must be installed:
 * pnpx expo install expo-secure-store
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "./logger";

/**
 * Maximum size for a single secure store item (in bytes)
 * expo-secure-store has a 2KB (2048 bytes) limit
 * We use a slightly smaller limit to account for encoding overhead
 */
const MAX_CHUNK_SIZE = 1800;

/**
 * Suffix for chunk count metadata
 */
const CHUNK_COUNT_SUFFIX = "_chunk_count";

/**
 * SecureStore interface that matches expo-secure-store API
 */
interface SecureStoreInterface {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}

/**
 * Check if expo-secure-store is available
 * Returns the module if available, null otherwise
 */
async function getSecureStore(): Promise<SecureStoreInterface | null> {
  try {
    // Dynamic import to handle when module isn't installed
    // Using require() to avoid TypeScript type checking on uninstalled module
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SecureStore = require("expo-secure-store") as SecureStoreInterface;
    // Verify the module has the expected methods
    if (
      typeof SecureStore?.getItemAsync === "function" &&
      typeof SecureStore?.setItemAsync === "function" &&
      typeof SecureStore?.deleteItemAsync === "function"
    ) {
      return SecureStore;
    }
    return null;
  } catch {
    logger.warn("expo-secure-store not available, using AsyncStorage fallback", "secureStorage");
    return null;
  }
}

/**
 * Split a string into chunks of specified size
 */
function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

/**
 * Securely store a value
 *
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified if object)
 * @returns Promise<boolean> - True if stored successfully
 */
export async function secureSet(key: string, value: unknown): Promise<boolean> {
  try {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);
    const SecureStore = await getSecureStore();

    if (SecureStore) {
      // Check if we need to chunk the data
      if (stringValue.length > MAX_CHUNK_SIZE) {
        const chunks = chunkString(stringValue, MAX_CHUNK_SIZE);

        // Store chunk count
        await SecureStore.setItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`, String(chunks.length));

        // Store each chunk
        const chunkPromises = chunks.map((chunk, index) =>
          SecureStore.setItemAsync(`${key}_${index}`, chunk),
        );
        await Promise.all(chunkPromises);

        logger.debug(`Stored ${chunks.length} chunks for key: ${key}`, "secureStorage");
      } else {
        // Single item storage
        await SecureStore.setItemAsync(key, stringValue);
      }
    } else {
      // Fallback to AsyncStorage
      await AsyncStorage.setItem(key, stringValue);
      logger.debug("Used AsyncStorage fallback for secure set", "secureStorage");
    }

    return true;
  } catch (error) {
    logger.error("Failed to securely store value", "secureStorage", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

/**
 * Retrieve a securely stored value
 *
 * @param key - Storage key
 * @returns Promise<string | null> - Retrieved value or null
 */
export async function secureGet(key: string): Promise<string | null> {
  try {
    const SecureStore = await getSecureStore();

    if (SecureStore) {
      // Check if data is chunked
      const chunkCountStr = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);

      if (chunkCountStr) {
        const chunkCount = Number.parseInt(chunkCountStr, 10);
        const chunks: string[] = [];

        // Retrieve all chunks
        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
          if (chunk) {
            chunks.push(chunk);
          } else {
            logger.warn(`Missing chunk ${i} for key: ${key}`, "secureStorage");
            return null;
          }
        }

        logger.debug(`Retrieved ${chunks.length} chunks for key: ${key}`, "secureStorage");
        return chunks.join("");
      }

      // Single item retrieval
      return await SecureStore.getItemAsync(key);
    }

    // Fallback to AsyncStorage
    logger.debug("Used AsyncStorage fallback for secure get", "secureStorage");
    return await AsyncStorage.getItem(key);
  } catch (error) {
    logger.error("Failed to retrieve secure value", "secureStorage", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

/**
 * Delete a securely stored value
 *
 * @param key - Storage key
 * @returns Promise<boolean> - True if deleted successfully
 */
export async function secureDelete(key: string): Promise<boolean> {
  try {
    const SecureStore = await getSecureStore();

    if (SecureStore) {
      // Check if data is chunked
      const chunkCountStr = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);

      if (chunkCountStr) {
        const chunkCount = Number.parseInt(chunkCountStr, 10);

        // Delete all chunks
        const deletePromises: Promise<void>[] = [];
        for (let i = 0; i < chunkCount; i++) {
          deletePromises.push(SecureStore.deleteItemAsync(`${key}_${i}`));
        }
        deletePromises.push(SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`));

        await Promise.all(deletePromises);
        logger.debug(`Deleted ${chunkCount} chunks for key: ${key}`, "secureStorage");
      } else {
        // Single item deletion
        await SecureStore.deleteItemAsync(key);
      }
    } else {
      // Fallback to AsyncStorage
      await AsyncStorage.removeItem(key);
      logger.debug("Used AsyncStorage fallback for secure delete", "secureStorage");
    }

    return true;
  } catch (error) {
    logger.error("Failed to delete secure value", "secureStorage", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

/**
 * Check if a key exists in secure storage
 *
 * @param key - Storage key
 * @returns Promise<boolean> - True if key exists
 */
export async function secureHas(key: string): Promise<boolean> {
  const value = await secureGet(key);
  return value !== null;
}

/**
 * Secure storage interface for Zustand persist middleware
 * Can be used as a drop-in replacement for AsyncStorage in persist config
 */
export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return secureGet(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    await secureSet(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    await secureDelete(key);
  },
};

/**
 * Migrate data from AsyncStorage to SecureStore
 * Useful for upgrading existing users' data
 *
 * @param key - Storage key to migrate
 * @returns Promise<boolean> - True if migration successful
 */
export async function migrateToSecureStorage(key: string): Promise<boolean> {
  try {
    const SecureStore = await getSecureStore();
    if (!SecureStore) {
      logger.warn("Cannot migrate - SecureStore not available", "secureStorage");
      return false;
    }

    // Check if already in SecureStore
    const existingSecure = await SecureStore.getItemAsync(key);
    if (existingSecure) {
      logger.debug(`Key ${key} already in SecureStore`, "secureStorage");
      return true;
    }

    // Get from AsyncStorage
    const asyncValue = await AsyncStorage.getItem(key);
    if (!asyncValue) {
      logger.debug(`Key ${key} not found in AsyncStorage`, "secureStorage");
      return true; // Nothing to migrate
    }

    // Store in SecureStore
    const success = await secureSet(key, asyncValue);

    if (success) {
      // Optionally remove from AsyncStorage after successful migration
      // await AsyncStorage.removeItem(key);
      logger.info(`Migrated ${key} to SecureStore`, "secureStorage");
    }

    return success;
  } catch (error) {
    logger.error("Migration failed", "secureStorage", {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}
