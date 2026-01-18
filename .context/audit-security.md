# 🔒 DriftLog Security Audit Report

**Audit Date**: January 17, 2026
**Application**: DriftLog (React Native/Expo Workout Logging App)
**Version**: 1.0.0
**Audit Scope**: Data Storage, Input Validation, State Management, Dependencies, App Configuration

---

## Executive Summary

DriftLog is an **offline-first** application that stores workout data locally with no network communication. This significantly reduces the attack surface compared to cloud-connected apps. However, several security considerations should be addressed to protect user data from local device attacks, data theft, and unintended data leakage.

**Overall Risk Level**: **Medium** (for a local-only fitness app)

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Findings | 0 | 2 | 5 | 4 |

---

## 🔴 HIGH SEVERITY

### 1. Unencrypted SQLite Database

**File**: src/core/db/index.ts

**Vulnerability**: The SQLite database stores all workout data in plaintext without encryption.

```typescript
const expoDb = openDatabaseSync("driftlog.db", { enableChangeListener: true });
```

**Risk Level**: HIGH

**Attack Vector**:
- On a rooted/jailbroken device, any app with root access can read the database
- If the device is stolen/lost, data can be extracted via forensic tools
- iOS/Android backups may include unencrypted database

**Affected Data**:
- Workout sessions (dates, times)
- Exercise names and sets
- Personal reflections and notes

**Mitigation**:
```typescript
// Option 1: Use expo-sqlite-encrypted (requires native module)
import * as SQLite from 'expo-sqlite-encrypted';

// Option 2: Use SQLCipher for encryption
// Note: Requires ejecting from Expo managed workflow

// Option 3: Encrypt sensitive fields at application layer
import * as SecureStore from 'expo-secure-store';
// Store encryption key in SecureStore, encrypt notes/reflections
```

**Recommendation**: For a fitness app, implement field-level encryption for sensitive data (reflections, notes) while keeping non-sensitive data (exercise counts, timestamps) unencrypted for query performance.

---

### 2. AsyncStorage Used for Session State (Unencrypted)

**File**: src/features/session/persistence.ts

**Vulnerability**: Session state containing workout data is persisted to AsyncStorage, which stores data in plaintext on both iOS and Android.

```typescript
export const sessionPersistConfig = {
  name: SESSION_STORAGE_KEY,
  storage: createJSONStorage(() => AsyncStorage),
```

**Risk Level**: HIGH

**Attack Vector**:
- AsyncStorage on Android is stored in SharedPreferences (plaintext XML)
- AsyncStorage on iOS uses NSUserDefaults (plaintext plist)
- Backup extraction can reveal complete workout history

**Mitigation**:
```typescript
import * as SecureStore from 'expo-secure-store';

// Create secure storage wrapper for Zustand
const secureStorage = {
  getItem: async (name: string) => await SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => await SecureStore.deleteItemAsync(name),
};

export const sessionPersistConfig = {
  name: SESSION_STORAGE_KEY,
  storage: createJSONStorage(() => secureStorage),
```

**Note**: SecureStore has a ~2KB limit per key, so consider compressing data or only storing sensitive portions securely.

---

## 🟠 MEDIUM SEVERITY

### 3. Insufficient Input Validation on Exercise Names

**File**: src/features/session/store.ts

**Vulnerability**: Limited input validation could allow excessively long inputs or special characters that may cause rendering issues.

```typescript
addExercise: (name: string) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    Alert.alert("Invalid Exercise Name", "Please enter an exercise name.");
    throw new Error("Exercise name cannot be empty");
  }
  if (trimmedName.length > 100) {
    Alert.alert("Name Too Long", "Exercise name must be less than 100 characters.");
    throw new Error("Exercise name too long (max 100 characters)");
  }
```

**Risk Level**: MEDIUM

**Issues**:
- No character type validation (allows control characters, emojis could cause display issues)
- 100 character limit is validated but not enforced in UI
- No validation on routine names, notes, or reflection text

**Mitigation**:
```typescript
const EXERCISE_NAME_REGEX = /^[\p{L}\p{N}\s\-'".()]+$/u;

function validateExerciseName(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new ValidationError("Exercise name required", "Please enter an exercise name.");
  }

  if (trimmed.length > 100) {
    throw new ValidationError("Name too long", "Exercise name must be under 100 characters.");
  }

  if (!EXERCISE_NAME_REGEX.test(trimmed)) {
    throw new ValidationError("Invalid characters", "Please use only letters, numbers, and common punctuation.");
  }

  return trimmed;
}
```

---

### 4. Debug Information Exposed in Production

**File**: src/components/ErrorBoundary.tsx

**Vulnerability**: Stack traces are displayed in error UI when `__DEV__` is true, but the check doesn't guarantee this won't leak in production builds.

```tsx
{__DEV__ && (
  <View className="mt-6 p-4 bg-light-bg-cream dark:bg-dark-bg-secondary rounded-lg w-full">
    <Text className="text-xs font-mono text-light-text-tertiary dark:text-dark-text-tertiary">
      {error.stack?.substring(0, 200)}...
    </Text>
  </View>
)}
```

**Risk Level**: MEDIUM

**Issues**:
- `__DEV__` is React Native's development mode flag which should be `false` in production
- Stack traces could reveal file paths, function names, and internal logic
- Error messages logged to console are not stripped in production

**Mitigation**:
1. Add explicit build-time checks:
```typescript
// In metro.config.js or babel config
if (process.env.NODE_ENV === 'production') {
  // Strip console.error/console.log
}
```

2. Remove stack trace display entirely or use proper error tracking:
```tsx
// Instead of displaying stack traces, send to error tracking service
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  if (!__DEV__) {
    // Sentry.captureException(error);
  }
}
```

---

### 5. Android Backup Enabled by Default

**File**: app.json

**Vulnerability**: The Android configuration doesn't explicitly disable backup, which means app data can be backed up via ADB or cloud backup.

```json
"android": {
  "adaptiveIcon": {...},
  "package": "com.driftlog.app",
  "versionCode": 1,
  "permissions": [],
  "softwareKeyboardLayoutMode": "resize"
}
```

**Risk Level**: MEDIUM

**Attack Vector**:
- `adb backup` can extract app data including SQLite database
- Google Cloud backups may store unencrypted workout data
- Device migration could transfer sensitive data

**Mitigation**:
```json
"android": {
  "adaptiveIcon": {...},
  "package": "com.driftlog.app",
  "versionCode": 1,
  "permissions": [],
  "allowBackup": false,
  "softwareKeyboardLayoutMode": "resize"
}
```

Or create a backup rules file to exclude sensitive data:
```xml
<!-- res/xml/backup_rules.xml -->
<full-backup-content>
    <exclude domain="database" path="driftlog.db" />
    <exclude domain="sharedpref" path="*" />
</full-backup-content>
```

---

### 6. No Secure Data Deletion

**Files**: Multiple store files

**Vulnerability**: When sessions or routines are deleted, data is removed from SQLite but:
1. SQLite doesn't zero-out deleted data (can be recovered with forensic tools)
2. AsyncStorage cached data may persist
3. No secure wipe on app uninstall

**Risk Level**: MEDIUM

**Mitigation**:
```typescript
// For SQLite - run VACUUM after sensitive deletions
async function secureDeleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  // Force SQLite to reclaim space and overwrite deleted data
  await db.run(sql`VACUUM`);
}

// For complete account deletion, provide a "wipe all data" option
async function wipeAllData(): Promise<void> {
  // Delete all tables
  await db.delete(sessions);
  await db.delete(exercises);
  await db.delete(sets);
  await db.delete(routines);
  await db.delete(reflections);

  // Clear AsyncStorage
  await AsyncStorage.clear();

  // VACUUM database
  await db.run(sql`VACUUM`);
}
```

---

### 7. Timer IDs Stored in Global State (Memory Concern)

**File**: src/features/session/store.ts

**Vulnerability**: Timer IDs (autoEndTimerId) stored in Zustand state could leak if state is logged or inspected.

```typescript
autoEndTimerId: ReturnType<typeof setTimeout> | null;
```

**Risk Level**: MEDIUM

**Issue**: While not directly exploitable, storing native handles in app state:
- Could cause memory leaks if not properly cleaned up
- May appear in crash logs or debugging tools
- Violates principle of keeping non-serializable data out of state

**Mitigation**: Store timer references in a module-scoped variable instead:
```typescript
// Outside the store
let autoEndTimerRef: ReturnType<typeof setTimeout> | null = null;

// In store actions
resetActivityTimer: () => {
  if (autoEndTimerRef) {
    clearTimeout(autoEndTimerRef);
    autoEndTimerRef = null;
  }
  // ...
}
```

---

## 🟢 LOW SEVERITY

### 8. Missing Rate Limiting on Database Operations

**Files**: All store files

**Vulnerability**: No throttling on rapid database operations which could lead to denial of service on the local device.

**Risk Level**: LOW

**Scenario**: A malicious script or UI bug rapidly calling addExercise or `addSet()` could:
- Fill up device storage
- Cause app to become unresponsive
- Crash due to memory exhaustion

**Mitigation**:
```typescript
import { throttle } from 'lodash';

// Throttle write operations
const throttledAddExercise = throttle(
  (name: string) => get().addExerciseInternal(name),
  100,
  { leading: true, trailing: false }
);
```

---

### 9. Console Logging in Production

**Files**: Multiple files (store.ts, index.ts, etc.)

**Vulnerability**: `console.error` and `console.log` statements throughout the codebase will output to the device console in production.

```typescript
console.error("Failed to start session:", error);
console.error("Failed to load routines:", error);
console.warn("Session already active...");
```

**Risk Level**: LOW

**Issue**: While not directly exploitable, console output:
- Can be viewed via Safari Web Inspector (iOS) or Chrome DevTools (Android)
- May reveal internal application logic
- Can impact performance

**Mitigation**:
```typescript
// Create a logger that's disabled in production
const logger = {
  error: (...args: unknown[]) => {
    if (__DEV__) console.error(...args);
    // In production, send to error tracking service
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },
};
```

---

### 10. Exposed App Privacy Status

**File**: app.json

**Vulnerability**: The `privacy` field is set to `"unlisted"` which controls Expo project visibility.

```json
"privacy": "unlisted"
```

**Risk Level**: LOW

**Note**: This is appropriate for pre-release development. Ensure this is reviewed before public release.

---

### 11. No Data Export Encryption

**Observation**: If a data export feature is added in the future, ensure exported data is encrypted.

**Risk Level**: LOW (Feature not implemented)

**Recommendation**: When implementing export functionality:
```typescript
async function exportData(password: string): Promise<string> {
  const data = await getAllUserData();
  const encrypted = await encrypt(JSON.stringify(data), password);
  return encrypted;
}
```

---

## ✅ SECURITY POSITIVES

1. **No Network Calls**: The offline-first architecture eliminates entire categories of vulnerabilities (MITM, API security, authentication)

2. **Drizzle ORM**: Using an ORM prevents SQL injection by parameterizing all queries

3. **No Hardcoded Secrets**: No API keys, tokens, or credentials found in the codebase

4. **Type Safety**: TypeScript strict mode helps prevent type-related vulnerabilities

5. **Error Boundaries**: Proper error handling prevents crashes from exposing sensitive state

6. **Minimal Permissions**: Android config requests no permissions beyond defaults

7. **No Eval/InnerHTML**: No dangerous JavaScript execution patterns found

---

## 📋 DEPENDENCY SECURITY CHECK

Reviewing package.json dependencies:

| Package | Version | Status |
|---------|---------|--------|
| expo | 54.0.31 | ✅ Current |
| drizzle-orm | 0.45.1 | ✅ Current |
| zustand | 5.0.9 | ✅ Current |
| react-native | 0.81.5 | ✅ Current |
| react | 19.1.0 | ✅ Current |

**Recommendation**: Run regular dependency audits:
```bash
pnpm audit
pnpx expo-doctor
```

---

## 🎯 PRIORITIZED REMEDIATION PLAN

### Immediate (High Priority)
1. **Encrypt sensitive AsyncStorage data** - Use `expo-secure-store` for session persistence
2. **Disable Android backup** - Add `allowBackup: false` to app.json

### Short-term (Medium Priority)
3. **Add field-level encryption** for reflections and notes in SQLite
4. **Implement input validation** across all text inputs
5. **Add secure deletion** with VACUUM for sensitive data

### Long-term (Low Priority)
6. **Integrate error tracking** (Sentry) and remove console logging
7. **Add rate limiting** to prevent resource exhaustion
8. **Create data wipe functionality** for account deletion

---

## Summary

DriftLog's offline-first architecture provides inherent security benefits. The main concerns center around **local data protection** - ensuring that if a device is compromised, lost, or stolen, workout data (especially personal reflections) remains protected. Implementing encryption for AsyncStorage and sensitive database fields would significantly improve the security posture with minimal performance impact.
