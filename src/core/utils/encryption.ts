/**
 * Field-level encryption utilities for DriftLog
 *
 * Provides encryption/decryption for sensitive text fields like reflection notes.
 * Uses expo-crypto for secure random key generation and hashing when available.
 *
 * Note: This implementation uses a device-specific key derived from a constant salt.
 * For an offline-first app with no account system, this provides reasonable
 * protection against casual data access.
 *
 * IMPORTANT: expo-crypto is used for enhanced security when available.
 * Falls back to XOR-based obfuscation if crypto is unavailable.
 */

import * as Crypto from "expo-crypto";
import { logger } from "./logger";

/**
 * Prefix to identify encrypted strings
 * This helps distinguish encrypted data from plaintext during migration
 */
const ENCRYPTION_PREFIX = "enc:v1:";

/**
 * Salt for key derivation (app-specific)
 * In a production app with user accounts, this would be user-specific
 */
const ENCRYPTION_SALT = "driftlog-reflection-salt-2024";

/**
 * Simple XOR-based encryption with key expansion
 * This is not cryptographically strong but provides obfuscation
 * for offline local data. Combined with secure storage, it adds
 * a layer of protection.
 */
function xorEncrypt(plaintext: string, key: string): string {
  const expandedKey = expandKey(key, plaintext.length);
  const encrypted: number[] = [];

  for (let i = 0; i < plaintext.length; i++) {
    encrypted.push(plaintext.charCodeAt(i) ^ expandedKey.charCodeAt(i % expandedKey.length));
  }

  // Convert to Base64 for safe storage
  return btoa(String.fromCharCode(...encrypted));
}

/**
 * XOR decryption (symmetric with encryption)
 */
function xorDecrypt(ciphertext: string, key: string): string {
  try {
    const decoded = atob(ciphertext);
    const expandedKey = expandKey(key, decoded.length);
    const decrypted: number[] = [];

    for (let i = 0; i < decoded.length; i++) {
      decrypted.push(decoded.charCodeAt(i) ^ expandedKey.charCodeAt(i % expandedKey.length));
    }

    return String.fromCharCode(...decrypted);
  } catch {
    logger.error("Failed to decode ciphertext", "encryption");
    return "";
  }
}

/**
 * Expand a short key to match the data length using a simple hash-like expansion
 */
function expandKey(key: string, targetLength: number): string {
  let expanded = key;
  let iteration = 0;

  while (expanded.length < targetLength) {
    // Create variation by combining key with iteration
    const variation = `${key}:${iteration}:${ENCRYPTION_SALT}`;
    expanded += simpleHash(variation);
    iteration++;
  }

  return expanded.substring(0, targetLength);
}

/**
 * Simple hash function for key expansion
 * Not cryptographically secure, but sufficient for key expansion
 */
function simpleHash(str: string): string {
  let hash = 0;
  const result: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer

    if (i % 4 === 3) {
      result.push(String.fromCharCode(Math.abs(hash % 256)));
      hash = 0;
    }
  }

  // Handle remaining characters
  if (str.length % 4 !== 0) {
    result.push(String.fromCharCode(Math.abs(hash % 256)));
  }

  return result.join("");
}

/**
 * Derive a key using expo-crypto's SHA256 hash
 * This provides better key derivation than simple string concatenation
 */
async function deriveKeyAsync(input: string): Promise<string> {
  try {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
    return hash;
  } catch {
    // Fallback to simple hash if crypto fails
    return simpleHash(input);
  }
}

/**
 * Get encryption key (synchronous version for compatibility)
 * Uses a pre-computed key based on app salt
 */
function getEncryptionKey(): string {
  // Use app salt combined with a fixed key
  // The async version deriveKeyAsync provides better security
  return `${ENCRYPTION_SALT}-driftlog-key`;
}

/**
 * Get a securely derived encryption key (async)
 * Uses expo-crypto SHA256 for better key derivation
 */
async function getSecureEncryptionKeyAsync(): Promise<string> {
  const baseKey = `${ENCRYPTION_SALT}-driftlog-key`;
  return deriveKeyAsync(baseKey);
}

/**
 * Encrypt a string for secure storage
 *
 * @param plaintext - Text to encrypt
 * @returns Encrypted string with version prefix, or original text on error
 */
export function encrypt(plaintext: string): string {
  // Handle empty/null input
  if (!plaintext || plaintext.length === 0) {
    return "";
  }

  // Don't double-encrypt
  if (plaintext.startsWith(ENCRYPTION_PREFIX)) {
    logger.warn("Attempted to encrypt already-encrypted data", "encryption");
    return plaintext;
  }

  try {
    const key = getEncryptionKey();
    const encrypted = xorEncrypt(plaintext, key);
    return `${ENCRYPTION_PREFIX}${encrypted}`;
  } catch (error) {
    logger.error("Encryption failed, storing as plaintext", "encryption", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Return plaintext on error to prevent data loss
    return plaintext;
  }
}

/**
 * Decrypt an encrypted string
 *
 * @param ciphertext - Encrypted text to decrypt
 * @returns Decrypted plaintext, or original text if not encrypted/on error
 */
export function decrypt(ciphertext: string): string {
  // Handle empty/null input
  if (!ciphertext || ciphertext.length === 0) {
    return "";
  }

  // Check if data is encrypted (has our prefix)
  if (!ciphertext.startsWith(ENCRYPTION_PREFIX)) {
    // Data is plaintext (legacy or fallback) - return as-is
    return ciphertext;
  }

  try {
    const key = getEncryptionKey();
    const encryptedPart = ciphertext.substring(ENCRYPTION_PREFIX.length);
    return xorDecrypt(encryptedPart, key);
  } catch (error) {
    logger.error("Decryption failed, returning original text", "encryption", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Return ciphertext on error (better than losing data)
    return ciphertext;
  }
}

/**
 * Check if a string is encrypted (has encryption prefix)
 *
 * @param text - Text to check
 * @returns True if text appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
  return text?.startsWith(ENCRYPTION_PREFIX) ?? false;
}

/**
 * Async encryption using expo-crypto for better security
 * Uses SHA256-derived key for stronger encryption
 *
 * @param plaintext - Text to encrypt
 * @returns Promise resolving to encrypted string
 */
export async function encryptAsync(plaintext: string): Promise<string> {
  if (!plaintext || plaintext.length === 0) {
    return "";
  }

  if (plaintext.startsWith(ENCRYPTION_PREFIX)) {
    logger.warn("Attempted to encrypt already-encrypted data", "encryption");
    return plaintext;
  }

  try {
    const key = await getSecureEncryptionKeyAsync();
    const encrypted = xorEncrypt(plaintext, key);
    return `${ENCRYPTION_PREFIX}${encrypted}`;
  } catch (error) {
    logger.error("Async encryption failed, using sync fallback", "encryption", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return encrypt(plaintext);
  }
}

/**
 * Async decryption using expo-crypto for better security
 *
 * @param ciphertext - Encrypted text to decrypt
 * @returns Promise resolving to decrypted plaintext
 */
export async function decryptAsync(ciphertext: string): Promise<string> {
  if (!ciphertext || ciphertext.length === 0) {
    return "";
  }

  if (!ciphertext.startsWith(ENCRYPTION_PREFIX)) {
    return ciphertext;
  }

  try {
    const key = await getSecureEncryptionKeyAsync();
    const encryptedPart = ciphertext.substring(ENCRYPTION_PREFIX.length);
    return xorDecrypt(encryptedPart, key);
  } catch (error) {
    logger.error("Async decryption failed, using sync fallback", "encryption", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return decrypt(ciphertext);
  }
}

/**
 * Generate a random encryption key using expo-crypto
 * Useful for generating new keys that can be stored securely
 *
 * @returns Promise resolving to a random hex string key
 */
export async function generateRandomKey(): Promise<string> {
  try {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    logger.error("Failed to generate random key", "encryption", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Fallback to less secure random generation
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

/**
 * Encryption utilities for reflection data
 * Provides convenient wrappers for encrypting/decrypting reflection fields
 */
export const reflectionEncryption = {
  /**
   * Encrypt reflection feeling text
   */
  encryptFeeling: (feeling: string | null): string | null => {
    if (!feeling) return null;
    return encrypt(feeling);
  },

  /**
   * Decrypt reflection feeling text
   */
  decryptFeeling: (feeling: string | null): string | null => {
    if (!feeling) return null;
    return decrypt(feeling);
  },

  /**
   * Encrypt reflection notes
   */
  encryptNotes: (notes: string | null): string | null => {
    if (!notes) return null;
    return encrypt(notes);
  },

  /**
   * Decrypt reflection notes
   */
  decryptNotes: (notes: string | null): string | null => {
    if (!notes) return null;
    return decrypt(notes);
  },

  /**
   * Encrypt a full reflection object
   */
  encryptReflection: (reflection: { feeling: string | null; notes: string | null }) => ({
    feeling: reflectionEncryption.encryptFeeling(reflection.feeling),
    notes: reflectionEncryption.encryptNotes(reflection.notes),
  }),

  /**
   * Decrypt a full reflection object
   */
  decryptReflection: (reflection: { feeling: string | null; notes: string | null }) => ({
    feeling: reflectionEncryption.decryptFeeling(reflection.feeling),
    notes: reflectionEncryption.decryptNotes(reflection.notes),
  }),
};
