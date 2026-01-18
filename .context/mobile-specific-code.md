# Mobile-Specific Code Analysis for Web Adaptation

**Generated:** 2026-01-18
**Purpose:** Comprehensive analysis of all mobile-specific code requiring web adaptation
**Project:** DriftLog - Offline-first workout logging app

---

## Executive Summary

This document catalogs **ALL** mobile-specific implementations in DriftLog that will require adaptation for web deployment. The app is currently iOS/Android-only with heavy reliance on native APIs, gesture handlers, and mobile-specific patterns.

### Critical Dependencies Requiring Replacement
- **expo-sqlite** - Core database (requires IndexedDB/SQL.js web alternative)
- **expo-secure-store** - Encryption (no web support, needs localStorage + crypto)
- **react-native-draggable-flatlist** - Drag & drop (needs @dnd-kit replacement)
- **expo-haptics** - Tactile feedback (no web equivalent, graceful degradation)
- **react-native-calendars** - Date picker (needs web-compatible alternative)

### Architecture Impact
- **Database Layer**: Complete rewrite needed for web storage
- **Gesture System**: Touch gestures need mouse/keyboard alternatives
- **Navigation**: Expo Router file-based routing (web-compatible but needs testing)
- **Styling**: NativeWind v5 (has web support, needs verification)

---

## 1. Platform-Specific Imports & Platform.OS Checks

### 1.1 KeyboardAvoidingView Platform Behavior

**File:** `app/session/[routineId].tsx`
- **Lines:** 270-447
- **Current Implementation:**
```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={{ flex: 1 }}
>
```
- **Issue:** KeyboardAvoidingView doesn't exist on web
- **Web Alternative:** CSS-based keyboard handling with `window.visualViewport` API
- **Priority:** HIGH - Affects all input screens

**File:** `app/routines/[id].tsx`
- **Lines:** 73, 335, 475
- **Current Implementation:**
```typescript
// Haptics check
if (Platform.OS !== "android") return;

// Keyboard behavior
behavior={Platform.OS === "ios" ? "padding" : "height"}

// Android keyboard offset
bottom: Platform.OS === "android" ? keyboardHeight : 0
```
- **Web Alternative:** 
  - Remove haptics checks (no-op on web)
  - CSS `position: sticky` for keyboard avoidance
  - Browser-native keyboard handling
- **Priority:** HIGH

**File:** `app/history/[id].tsx`
- **Lines:** 440
- **Current Implementation:**
```typescript
behavior={Platform.OS === "ios" ? "padding" : undefined}
```
- **Web Alternative:** CSS-based solution
- **Priority:** MEDIUM

---

## 2. Native-Only Components

### 2.1 Pressable (Used Throughout - 56+ Instances)

**Critical Files:**
- `src/components/ui/Button.tsx` (lines 42-54)
- `app/session/[routineId].tsx` (lines 335-440)
- `app/routines/[id].tsx` (lines 217-528)
- `app/(tabs)/plan.tsx` (lines 211-327)
- `app/(tabs)/index.tsx` (lines 218-236)
- `app/(tabs)/history.tsx` (lines 293-392)
- All UI components (FreestyleCard, RoutineCard, SessionCard, etc.)

**Current Implementation:**
```typescript
<Pressable
  onPress={handlePress}
  android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}
  accessibilityRole="button"
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
>
```

**Web Adaptation:**
- Replace with `<button>` or styled `<div role="button">`
- `android_ripple` → CSS `:active` / `:hover` states
- `hitSlop` → CSS `padding` or `::before` pseudo-element
- Ensure keyboard navigation (Tab, Enter, Space)
- Add focus-visible styles

**Priority:** CRITICAL - Core interaction pattern

### 2.2 TouchableWithoutFeedback

**File:** `app/routines/[id].tsx`
- **Lines:** 340-529
- **Current Implementation:**
```typescript
<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
  {/* Form content */}
</TouchableWithoutFeedback>
```
- **Web Alternative:** 
  - `<div onClick={() => document.activeElement?.blur()}>` 
  - Or rely on browser's native blur behavior
- **Priority:** MEDIUM

### 2.3 Modal

**File:** `src/components/ui/BottomSheet.tsx`
- **Lines:** 63-112
- **Current Implementation:**
```typescript
<Modal
  visible={visible}
  transparent
  animationType="none"
  onRequestClose={onClose}
  accessibilityViewIsModal
>
```
- **Web Alternative:**
  - HTML `<dialog>` element with Radix UI or Headless UI
  - CSS backdrop (`::backdrop` pseudo-element)
  - Focus trap with `react-focus-lock`
  - Escape key handling
- **Priority:** HIGH - Used for date pickers and bottom sheets

### 2.4 Alert

**Files:** Multiple (22 instances across codebase)
- **Primary Files:**
  - `src/core/utils/errors.ts` (lines 118-168)
  - `app/session/[routineId].tsx` (lines 79-211)
  - `app/routines/[id].tsx` (lines 118-195)
  - `app/(tabs)/plan.tsx` (lines 150-176)
  - `src/features/session/store.ts` (lines 62-494)

**Current Implementation:**
```typescript
Alert.alert("End Workout?", "Your workout is in progress.", [
  { text: "Cancel", style: "cancel" },
  { text: "End", onPress: handleEnd, style: "destructive" }
]);
```

**Web Alternative:**
- Custom modal dialog component
- Or `window.confirm()` for simple cases
- Accessible dialog with proper ARIA attributes
- Button order consistency (web conventions differ from mobile)

**Priority:** HIGH - Critical for confirmations

---

## 3. Gesture Handlers & Animations

### 3.1 React Native Gesture Handler

**File:** `app/_layout.tsx`
- **Lines:** 6, 57-61
- **Current Implementation:**
```typescript
import { GestureHandlerRootView } from "react-native-gesture-handler";

<GestureHandlerRootView style={{ flex: 1 }}>
  {children}
</GestureHandlerRootView>
```
- **Web Support:** Partial - basic gestures work, but complex interactions may fail
- **Web Alternative:** Native mouse/touch events or `@use-gesture/react`
- **Priority:** MEDIUM - Mostly used for DraggableFlatList

### 3.2 React Native Reanimated

**File:** `src/components/ui/BottomSheet.tsx`
- **Lines:** 3-8, 27-56
- **Current Implementation:**
```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const translateY = useSharedValue(windowHeight);
const sheetStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: translateY.value }],
}));
```
- **Web Support:** Partial - Reanimated v4 has web support but with limitations
- **Web Alternative:** 
  - Framer Motion for robust web animations
  - CSS transitions with `react-spring`
  - Or native CSS animations
- **Priority:** MEDIUM - Animation nice-to-have

### 3.3 React Native Animated API

**File:** `src/components/ui/Skeleton.tsx`
- **Lines:** 3, 13-38
- **Current Implementation:**
```typescript
import { Animated } from "react-native";

const shimmerAnim = useRef(new Animated.Value(0)).current;
Animated.loop(
  Animated.sequence([
    Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
  ]),
).start();
```
- **Web Support:** Works but `useNativeDriver` has no effect on web
- **Web Alternative:** CSS `@keyframes` animation
- **Priority:** LOW - Visual polish

### 3.4 DraggableFlatList (CRITICAL)

**Files:**
- `app/session/[routineId].tsx` (lines 15-18, 301-315)
- `app/routines/[id].tsx` (lines 19-22, 437-460)

**Current Implementation:**
```typescript
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

<DraggableFlatList
  data={exercises}
  onDragEnd={({ data }) => handleReorder(data)}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
/>
```

**Web Adaptation Required:**
- **Replace with:** `@dnd-kit/core` + `@dnd-kit/sortable`
- **Mouse Events:** Support mouse drag (not just touch)
- **Keyboard Support:** Arrow keys + Space to reorder (accessibility)
- **Touch Support:** Maintain touch drag on touch-enabled web devices
- **Example Web Implementation:**
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
  <SortableContext items={items} strategy={verticalListSortingStrategy}>
    {items.map(item => <SortableItem key={item.id} item={item} />)}
  </SortableContext>
</DndContext>
```

**Priority:** CRITICAL - Core feature (exercise reordering)

---

## 4. SafeAreaView & Layout Components

### 4.1 useSafeAreaInsets Hook

**Files:** 10 instances across all tab screens
- `app/(tabs)/_layout.tsx` (lines 3, 8, 19-20)
- `app/(tabs)/index.tsx` (lines 6, 21)
- `app/(tabs)/plan.tsx` (lines 6, 17)
- `app/(tabs)/history.tsx` (lines 7, 20)
- `app/(tabs)/settings.tsx` (lines 3, 11)
- `app/routines/[id].tsx` (lines 23, 31)
- `app/history/[id].tsx` (lines 16, 29)
- `src/components/session/SessionHeader.tsx` (lines 4, 16)

**Current Implementation:**
```typescript
import { useSafeAreaInsets } from "react-native-safe-area-context";
const insets = useSafeAreaInsets();

<View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
```

**Web Adaptation:**
- On web, `insets` will always be `{ top: 0, bottom: 0, left: 0, right: 0 }`
- Acceptable for web (no notches/rounded corners)
- Consider CSS `env(safe-area-inset-*)` for PWA mode
- **Recommendation:** Keep hook, defaults to zero on web

**Priority:** LOW - Graceful degradation

### 4.2 SafeAreaProvider

**File:** `app/_layout.tsx`
- **Lines:** 7, 56-62
- **Current Implementation:**
```typescript
import { SafeAreaProvider } from "react-native-safe-area-context";

<SafeAreaProvider>
  {children}
</SafeAreaProvider>
```
- **Web Support:** Works but redundant (no-op)
- **Priority:** LOW - Keep for cross-platform consistency

---

## 5. AsyncStorage Usage

### 5.1 Theme Persistence

**File:** `src/core/contexts/ThemeContext.tsx`
- **Lines:** 1, 30-31, 55
- **Current Implementation:**
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
```
- **Web Support:** Works via `localStorage` polyfill
- **Priority:** LOW - Already web-compatible

### 5.2 Session State Persistence

**File:** `src/features/session/persistence.ts`
- **Lines:** 1, 28-29, 50
- **Current Implementation:**
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

storage: createJSONStorage(() => (USE_SECURE_STORAGE ? secureStorage : AsyncStorage))
```
- **Web Support:** Works but falls back to localStorage (unencrypted)
- **Web Alternative:** IndexedDB for larger data, Web Crypto API for encryption
- **Priority:** MEDIUM

### 5.3 Settings Store

**File:** `src/features/settings/store.ts`
- **Lines:** 1, 29
- **Current Implementation:**
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
storage: createJSONStorage(() => AsyncStorage)
```
- **Web Support:** Works (localStorage wrapper)
- **Priority:** LOW

---

## 6. SQLite Database Operations (CRITICAL)

### 6.1 Database Initialization

**File:** `src/core/db/index.ts`
- **Lines:** 1-2, 11-14
- **Current Implementation:**
```typescript
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expoDb = openDatabaseSync("driftlog.db", { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });
```

**Web Adaptation Required:**
- **expo-sqlite does NOT work on web**
- **Web Alternatives:**
  1. **SQL.js** (SQLite compiled to WebAssembly)
     - Pros: True SQLite, familiar API
     - Cons: Requires loading ~1MB wasm file, manual persistence
  2. **absurd-sql** (SQL.js + IndexedDB persistence)
     - Pros: Persistent SQLite in browser
     - Cons: Complex setup, experimental
  3. **Electric-SQL** (local-first sync)
     - Pros: Offline-first, sync-capable
     - Cons: Overkill for single-user app
  4. **Drizzle ORM + Better-SQLite3** (Node.js only, not browser)
  5. **IndexedDB directly** (most web-native)
     - Pros: Native browser API, no dependencies
     - Cons: Different API, migration work required

**Recommended Approach:**
```typescript
// Option A: Platform-specific database layer
// src/core/db/index.native.ts
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

// src/core/db/index.web.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import initSqlJs from "sql.js";

// Option B: Abstracted storage interface
interface DatabaseAdapter {
  query(sql: string, params: any[]): Promise<any[]>;
  execute(sql: string, params: any[]): Promise<void>;
}
```

**Migration Path:**
1. Create database abstraction layer
2. Implement web adapter (SQL.js or IndexedDB)
3. Update all queries to use abstraction
4. Test data persistence across page reloads

**Priority:** CRITICAL - Core data layer

### 6.2 Database Queries (100+ instances)

**All store files use database:**
- `src/features/session/store.ts` (15+ queries)
- `src/features/history/store.ts` (20+ queries)
- `src/features/routines/store.ts` (10+ queries)
- `src/features/settings/store.ts` (minimal DB usage)

**Example Query:**
```typescript
const sessions = await db
  .select()
  .from(schema.sessions)
  .where(eq(schema.sessions.is_active, 1))
  .limit(20);
```

**Web Adaptation:**
- If using SQL.js: Drizzle ORM queries should work with minor adjustments
- If using IndexedDB: Complete query rewrite required
- **Priority:** CRITICAL

### 6.3 Migrations & Schema

**File:** `src/core/db/index.ts`
- **Lines:** 442-468
- **Current Implementation:**
```typescript
function runMigrations(): void {
  ensureTable("plans");
  ensureTable("sessions");
  ensureTable("exercises");
  createIndexes();
}
```
- **Web Adaptation:** Same schema, different execution method
- **Priority:** HIGH

---

## 7. Navigation Patterns

### 7.1 Expo Router (File-Based Routing)

**Files:**
- `app/_layout.tsx` (Stack navigator)
- `app/(tabs)/_layout.tsx` (Tab navigator)
- All route files (`app/(tabs)/index.tsx`, etc.)

**Current Implementation:**
```typescript
import { Stack, Tabs } from "expo-router";
import { router } from "expo-router";

// Tab navigation
<Tabs screenOptions={{ ... }}>
  <Tabs.Screen name="index" options={{ title: "Today" }} />
</Tabs>

// Programmatic navigation
router.push("/history/123");
```

**Web Support:** 
- ✅ Expo Router v6 has web support
- URLs map to routes: `/` → `index.tsx`, `/history` → `history.tsx`
- Dynamic routes work: `/history/[id]` → `/history/123`
- Tab bar becomes horizontal nav on web

**Web Considerations:**
- Browser back button handling (already works)
- Deep linking (already works)
- SEO meta tags (needs `expo-head` or `react-helmet`)
- Tab bar styling for desktop widths

**Priority:** LOW - Already web-compatible

### 7.2 Navigation Utilities

**File:** `src/core/utils/navigation.ts`
- **Lines:** 8, 16-101
- **Current Implementation:**
```typescript
import { router } from "expo-router";

export const Navigation = {
  goToTab(tab: TabRoute) {
    router.push(tab === "index" ? "/" : `/${tab}` as never);
  },
  goBack() {
    if (router.canGoBack()) router.back();
  }
};
```
- **Web Support:** Works (Expo Router is web-compatible)
- **Priority:** LOW

---

## 8. Haptic Feedback & Native APIs

### 8.1 Haptics (No Web Support)

**Files:**
- `app/routines/[id].tsx` (lines 2, 440, 443)
- `src/components/session/ExerciseRow.tsx` (lines 2, 29)

**Current Implementation:**
```typescript
import * as Haptics from "expo-haptics";

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

**Web Adaptation:**
- **No web equivalent** (Vibration API is limited and not widely supported)
- **Recommendation:** No-op on web (graceful degradation)
- Use platform-specific file:
  ```typescript
  // haptics.native.ts
  export { impactAsync } from 'expo-haptics';
  
  // haptics.web.ts
  export const impactAsync = () => Promise.resolve();
  ```

**Priority:** LOW - Optional tactile feedback

### 8.2 StatusBar

**Files:** All screens (9 instances)
- `app/_layout.tsx` (lines 4, 72)
- `app/(tabs)/index.tsx` (lines 3, 123)
- All other screens

**Current Implementation:**
```typescript
import { StatusBar } from "expo-status-bar";
<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
```

**Web Support:** No-op on web (browsers don't have status bar)
**Priority:** LOW - Already handles web gracefully

### 8.3 Keyboard Utilities

**File:** `app/routines/[id].tsx`
- **Lines:** 11, 340
- **Current Implementation:**
```typescript
import { Keyboard } from "react-native";
<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
```
- **Web Alternative:** `document.activeElement?.blur()`
- **Priority:** LOW

---

## 9. File System Operations

**Status:** Not used in current codebase
- No `expo-file-system` imports found
- No file read/write operations
- Data persistence is entirely through SQLite and AsyncStorage

**Priority:** N/A

---

## 10. Expo Modules with Web Limitations

### 10.1 expo-secure-store (NO WEB SUPPORT)

**File:** `src/core/utils/secureStorage.ts`
- **Lines:** 4-5, 30-203
- **Current Implementation:**
```typescript
import * as SecureStore from "expo-secure-store";

export const secureStorage = {
  async setItem(key: string, value: string) {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  },
  async getItem(key: string) {
    return await SecureStore.getItemAsync(key);
  }
};
```

**Web Adaptation:**
- expo-secure-store uses iOS Keychain / Android EncryptedSharedPreferences
- **No web equivalent** (Web Crypto API is not key-chain storage)

**Web Alternatives:**
1. **localStorage + Web Crypto API** (encryption in browser)
   ```typescript
   import { subtle } from 'crypto';
   
   async function encrypt(data: string, key: CryptoKey) {
     const encoded = new TextEncoder().encode(data);
     const iv = crypto.getRandomValues(new Uint8Array(12));
     const encrypted = await subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
     return { encrypted, iv };
   }
   ```
2. **IndexedDB for sensitive data** (browser-level encryption if available)
3. **Accept reduced security on web** (localStorage plaintext with warning)

**Recommendation:**
```typescript
// secureStorage.native.ts
export { secureStorage } from 'expo-secure-store';

// secureStorage.web.ts
export const secureStorage = {
  // Use localStorage + Web Crypto API or accept plaintext
  async setItem(key, value) {
    localStorage.setItem(key, value); // Warning: unencrypted
  }
};
```

**Priority:** HIGH - Security-sensitive data

### 10.2 expo-crypto

**File:** `src/core/utils/encryption.ts`
- **Lines:** Uses expo-crypto for hashing
- **Web Support:** Partial - some methods work, others don't
- **Web Alternative:** Web Crypto API (`SubtleCrypto`)
- **Priority:** MEDIUM

### 10.3 expo-font

**Files:** `app/_layout.tsx` (lines 1, 19-21)
- **Current Implementation:**
```typescript
import { useFonts } from "expo-font";
const [loaded, error] = useFonts({ /* fonts */ });
```
- **Web Support:** Works (fonts loaded via CSS)
- **Priority:** LOW

### 10.4 expo-splash-screen

**Files:** `app/_layout.tsx` (lines 3, 15, 46)
- **Current Implementation:**
```typescript
import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync();
await SplashScreen.hideAsync();
```
- **Web Support:** No-op on web (no native splash screen)
- **Priority:** LOW

### 10.5 expo-linear-gradient

**Status:** Installed but not used in current codebase
- **Web Support:** Works (CSS `linear-gradient()` fallback)
- **Priority:** N/A

---

## 11. Third-Party Libraries

### 11.1 react-native-calendars (LIMITED WEB SUPPORT)

**Files:**
- `src/components/ui/DatePicker.tsx` (lines 2, 39-64)
- `src/components/ui/DateRangePicker.tsx` (lines 4)

**Current Implementation:**
```typescript
import { Calendar } from "react-native-calendars";

<Calendar
  current={selectedDate}
  onDayPress={handleDayPress}
  markedDates={{ [selectedDate]: { selected: true } }}
  theme={{ ... }}
/>
```

**Web Compatibility:**
- **Officially**: "Web support is experimental"
- **Reality**: Mostly works but has styling issues and touch event problems

**Web Alternatives:**
1. **react-day-picker** (web-first, accessible)
2. **@mui/x-date-pickers** (Material UI)
3. **react-datepicker**
4. HTML `<input type="date">` (native but limited styling)

**Recommendation:**
```typescript
// DatePicker.native.tsx
import { Calendar } from 'react-native-calendars';

// DatePicker.web.tsx
import { DayPicker } from 'react-day-picker';
```

**Priority:** HIGH - Core date selection

### 11.2 @shopify/flash-list

**File:** `app/(tabs)/history.tsx`
- **Lines:** 2, 408-435
- **Current Implementation:**
```typescript
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={sessions}
  renderItem={renderSession}
  estimatedItemSize={120}
/>
```

**Web Support:** 
- ✅ FlashList has web support (uses `react-window` under the hood)
- Performance may differ from mobile
- Scrollbar styling needs CSS

**Priority:** LOW - Already web-compatible

### 11.3 zustand

**Files:** All store files
- `src/features/session/store.ts`
- `src/features/history/store.ts`
- `src/features/routines/store.ts`
- `src/features/settings/store.ts`

**Web Support:** ✅ Fully compatible
**Priority:** LOW - No changes needed

### 11.4 drizzle-orm

**Files:** Database layer
- **Web Support:** Depends on driver
- `drizzle-orm/expo-sqlite` → Mobile only
- `drizzle-orm/better-sqlite3` → Works with SQL.js on web
- **Priority:** HIGH - Core database

---

## 12. Styling & Theme System

### 12.1 NativeWind v5

**Files:** All component files
- `global.css` (Tailwind configuration)
- All components use `className` prop

**Current Implementation:**
```typescript
<View className="bg-light-surface dark:bg-dark-surface p-4 rounded-xl">
```

**Web Support:**
- ✅ NativeWind v5 has web support
- Uses Tailwind CSS engine
- Dark mode works via `dark:` prefix

**Web Considerations:**
- Test responsive breakpoints (`sm:`, `md:`, `lg:`)
- Verify hover states (`:hover` works on web, not mobile)
- Test focus-visible for keyboard navigation
- Shadow styles may differ (CSS vs native)

**Priority:** LOW - Already web-compatible

### 12.2 useColorScheme Hook

**Files:**
- `src/components/ui/Skeleton.tsx` (lines 1, 12)
- NativeWind's `useColorScheme` hook

**Web Support:** Works (reads `prefers-color-scheme` on web)
**Priority:** LOW

### 12.3 Theme Context

**File:** `src/core/contexts/ThemeContext.tsx`
- **Lines:** 4-7 (uses React Native's `Appearance` API)
- **Current Implementation:**
```typescript
import { Appearance, useColorScheme as useNativeColorScheme } from "react-native";
Appearance.setColorScheme("dark");
```
- **Web Support:** Works (polyfilled by React Native Web)
- **Priority:** LOW

---

## 13. Icons & Assets

### 13.1 @expo/vector-icons (Ionicons)

**Files:** Used in 20+ components
- All UI components
- All screen files

**Current Implementation:**
```typescript
import { Ionicons } from "@expo/vector-icons";
<Ionicons name="add" size={24} color="#ffffff" />
```

**Web Support:** 
- ✅ Works on web (renders as SVG)
- Icon fonts are loaded automatically

**Web Considerations:**
- Icons are ~300KB on first load
- Consider icon tree-shaking or separate icon library for web

**Priority:** LOW - Works but could be optimized

### 13.2 Image Assets

**Status:** Only app icons/splash screens (no runtime image usage)
- `assets/icon.png`
- `assets/splash.png`
- `assets/adaptive-icon.png`

**Web Support:** Standard image files work on web
**Priority:** LOW

---

## 14. Input Components

### 14.1 TextInput

**Files:** 8+ instances
- `app/session/[routineId].tsx` (lines 12, 58, 318)
- `app/routines/[id].tsx` (lines 15, 54-55, 236, 400, 481)
- `app/history/[id].tsx` (lines 13, 454, 471)
- `src/components/ui/SearchBar.tsx` (lines 3, 88)

**Current Implementation:**
```typescript
import { TextInput } from "react-native";

<TextInput
  ref={inputRef}
  value={value}
  onChangeText={setValue}
  placeholder="Exercise name"
  className="flex-1 text-base text-light-text-primary"
  underlineColorAndroid="transparent"
  selectionColor={colorScheme === "dark" ? "#ff9f6c" : "#f4a261"}
/>
```

**Web Adaptation:**
- React Native's `TextInput` renders as `<input>` on web
- ✅ Most props work (value, onChangeText, placeholder)
- ❌ `underlineColorAndroid` ignored (mobile-only)
- ❌ `selectionColor` limited browser support

**Web-Specific Issues:**
1. `onChangeText` → `onChange` event signature differs
2. `autoCapitalize` → Use CSS `text-transform`
3. `returnKeyType` → Use `enterKeyHint` HTML attribute
4. `keyboardType` → Use `inputMode` HTML attribute

**Recommendation:**
- Keep current implementation (React Native Web handles translation)
- Add web-specific CSS for focus styles
- Test IME (Input Method Editor) on web

**Priority:** MEDIUM - Core input pattern

### 14.2 Switch Component

**File:** `app/(tabs)/settings.tsx`
- **Lines:** 2, 42-80
- **Current Implementation:**
```typescript
import { Switch } from "react-native";

<Switch
  value={selectedScheme === "dark"}
  onValueChange={handleToggle}
  trackColor={{ false: "#d1d5db", true: "#ff9f6c" }}
  thumbColor="#ffffff"
/>
```

**Web Support:**
- React Native's Switch renders as `<input type="checkbox">` with custom styling
- ✅ Works but may look different from mobile
- Use CSS to match design system

**Priority:** LOW

---

## 15. Scroll & List Components

### 15.1 ScrollView

**Files:** Multiple screens
- `app/(tabs)/plan.tsx` (lines 5, 263-351)
- `app/(tabs)/index.tsx` (lines 5, 124-239)
- `app/history/[id].tsx` (lines 11, 164-212, 370-422, 443-503)
- `app/(tabs)/settings.tsx` (lines 2, 21-115)
- `src/components/planning/WeekNavigationRail.tsx` (lines 3, 89-176)

**Current Implementation:**
```typescript
import { ScrollView } from "react-native";

<ScrollView
  className="flex-1"
  contentContainerStyle={{ paddingBottom: insets.bottom }}
  showsVerticalScrollIndicator={false}
>
```

**Web Support:**
- ✅ ScrollView renders as `<div>` with `overflow: scroll`
- ✅ Works well on web

**Web Considerations:**
- `showsVerticalScrollIndicator` → Use CSS `::-webkit-scrollbar`
- `contentContainerStyle` → Maps to inner div
- Keyboard scrolling works automatically

**Priority:** LOW - Already web-compatible

### 15.2 FlashList (Covered in Section 11.2)

---

## 16. Dimensions & Window APIs

### 16.1 useWindowDimensions

**File:** `src/components/ui/BottomSheet.tsx`
- **Lines:** 2, 26
- **Current Implementation:**
```typescript
import { useWindowDimensions } from "react-native";
const { height: windowHeight } = useWindowDimensions();
```

**Web Support:** 
- ✅ Works on web (returns `window.innerWidth/Height`)
- Updates on resize events

**Priority:** LOW - Already web-compatible

### 16.2 Dimensions API

**Status:** Not directly used (useWindowDimensions preferred)
**Priority:** N/A

---

## 17. Performance Optimizations Needed for Web

### 17.1 Code Splitting

**Current State:** Single bundle for entire app
**Web Best Practice:** Split by route

**Recommendation:**
```typescript
// Use React.lazy + Suspense for route-based splitting
const HistoryScreen = lazy(() => import('./app/(tabs)/history'));

<Suspense fallback={<LoadingSpinner />}>
  <HistoryScreen />
</Suspense>
```

**Priority:** MEDIUM - Performance optimization

### 17.2 Image Optimization

**Current State:** No runtime images currently
**If images are added:**
- Use Next.js Image component equivalent
- WebP format with fallbacks
- Lazy loading

**Priority:** LOW (future consideration)

### 17.3 Database Query Optimization

**Current State:** All queries fetch into memory
**Web Consideration:**
- IndexedDB queries are async (add loading states)
- Consider virtual scrolling for large lists
- Implement pagination (already exists for history)

**Priority:** MEDIUM

---

## 18. Accessibility Differences

### 18.1 Screen Reader Support

**Current Implementation:**
- Uses `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`
- React Native props

**Web Adaptation:**
- These map to ARIA attributes on web
- ✅ Most props translate correctly
- Add additional ARIA attributes where needed:
  - `aria-describedby`
  - `aria-live` for dynamic content
  - `aria-expanded` for collapsible sections

**Priority:** MEDIUM

### 18.2 Keyboard Navigation

**Current State:** Touch-optimized, limited keyboard support

**Web Requirements:**
- Tab navigation (focus order)
- Enter/Space for buttons
- Arrow keys for lists
- Escape to close modals
- Focus trapping in modals

**Files Needing Enhancement:**
- All Pressable buttons (Tab + Enter/Space)
- BottomSheet (Escape key, focus trap)
- DraggableFlatList replacement (keyboard reordering)

**Priority:** HIGH - Web accessibility standard

### 18.3 Focus Management

**Recommendation:**
- Add `react-focus-lock` for modals
- Implement `useAutoFocus` hook for form inputs
- Add visible focus indicators (`:focus-visible`)

**Priority:** HIGH

---

## 19. Summary of Critical Web Adaptations

### Must-Have (CRITICAL)

1. **Database Layer** - Replace expo-sqlite with web-compatible solution
   - Files: `src/core/db/index.ts` + all stores
   - Effort: HIGH (2-3 weeks)
   - Options: SQL.js, IndexedDB, or hybrid approach

2. **Drag & Drop** - Replace react-native-draggable-flatlist
   - Files: `app/session/[routineId].tsx`, `app/routines/[id].tsx`
   - Effort: MEDIUM (1 week)
   - Solution: @dnd-kit/core + @dnd-kit/sortable

3. **Touch to Mouse Events** - Update all Pressable components
   - Files: 20+ component files
   - Effort: MEDIUM (1-2 weeks)
   - Solution: Platform-specific components or styled buttons

4. **Keyboard Navigation** - Add full keyboard support
   - Files: All interactive components
   - Effort: HIGH (2-3 weeks)
   - Solution: Focus management, key handlers, ARIA attributes

### Should-Have (HIGH)

5. **Secure Storage** - Replace expo-secure-store
   - Files: `src/core/utils/secureStorage.ts`
   - Effort: LOW (2-3 days)
   - Solution: localStorage + Web Crypto API

6. **Date Picker** - Replace react-native-calendars
   - Files: `src/components/ui/DatePicker.tsx`, `DateRangePicker.tsx`
   - Effort: MEDIUM (1 week)
   - Solution: react-day-picker or @mui/x-date-pickers

7. **Keyboard Avoidance** - Implement web keyboard handling
   - Files: 3 screens with KeyboardAvoidingView
   - Effort: LOW (2-3 days)
   - Solution: CSS sticky positioning + visualViewport API

8. **Modal System** - Replace React Native Modal
   - Files: `src/components/ui/BottomSheet.tsx`
   - Effort: MEDIUM (1 week)
   - Solution: HTML dialog or Radix UI

### Nice-to-Have (MEDIUM/LOW)

9. **Haptics** - Graceful degradation (no-op on web)
   - Effort: LOW (1 day)
   - Solution: Platform-specific files

10. **Animations** - Verify Reanimated web support
    - Effort: MEDIUM (3-5 days)
    - Solution: Framer Motion fallback if needed

11. **Code Splitting** - Optimize bundle size
    - Effort: MEDIUM (1 week)
    - Solution: Route-based lazy loading

---

## 20. Recommended Implementation Strategy

### Phase 1: Foundation (2-3 weeks)
1. Database abstraction layer + web implementation
2. Navigation testing (Expo Router on web)
3. Styling verification (NativeWind responsive design)
4. Theme system testing

### Phase 2: Core Interactions (2-3 weeks)
5. Replace Pressable with web-compatible buttons
6. Implement keyboard navigation
7. Replace DraggableFlatList with @dnd-kit
8. Add focus management

### Phase 3: Native Replacements (1-2 weeks)
9. Replace react-native-calendars
10. Implement web keyboard avoidance
11. Replace Modal/Alert with web alternatives
12. Add secure storage for web

### Phase 4: Polish (1 week)
13. Accessibility audit (WCAG compliance)
14. Performance optimization (code splitting, lazy loading)
15. Cross-browser testing (Chrome, Firefox, Safari)
16. Mobile web responsive design

### Total Estimated Effort: 6-9 weeks

---

## 21. Testing Checklist

### Functional Testing
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Session state persists across page reloads
- [ ] Navigation (browser back/forward buttons)
- [ ] Deep linking (direct URL access)
- [ ] Date selection and filtering
- [ ] Exercise reordering (drag & drop)
- [ ] Theme switching (light/dark/system)
- [ ] Search functionality
- [ ] Data export/delete

### Accessibility Testing
- [ ] Keyboard-only navigation (Tab, Enter, Escape)
- [ ] Screen reader support (NVDA, JAWS, VoiceOver)
- [ ] Focus indicators visible
- [ ] ARIA labels correct
- [ ] Color contrast (WCAG AA)
- [ ] Text resizing (200% zoom)

### Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Firefox (desktop + mobile)
- [ ] Safari (desktop + mobile)
- [ ] Edge (desktop)

### Performance Testing
- [ ] Initial load time (<3s)
- [ ] Time to interactive (<5s)
- [ ] Large dataset handling (1000+ sessions)
- [ ] Smooth animations (60fps)
- [ ] Database query speed

### PWA Testing (if applicable)
- [ ] Offline functionality
- [ ] Add to home screen
- [ ] Push notifications (if implemented)
- [ ] Background sync (if implemented)

---

## 22. Web-Specific Features to Add

### Desktop Enhancements
- Multi-column layout for wide screens
- Keyboard shortcuts (Ctrl+S to save, Ctrl+F to search)
- Drag & drop file upload (for future import feature)
- Right-click context menus
- Hover tooltips

### Mobile Web Considerations
- Touch-friendly tap targets (44x44px minimum)
- Swipe gestures (back navigation, delete)
- Pull-to-refresh
- Bottom sheet alternatives (full-screen modals on small screens)
- Virtual keyboard handling

### Progressive Web App (PWA)
- Service worker for offline support
- Web App Manifest
- Install prompt
- Push notifications (optional)
- Background sync (optional)

---

## Conclusion

DriftLog is a well-architected React Native app with clean separation of concerns, making web adaptation feasible but non-trivial. The **database layer is the biggest challenge** (expo-sqlite has no web support), followed by **gesture interactions** (drag & drop) and **native component replacements** (Modal, KeyboardAvoidingView).

With proper planning and a phased approach, this app can be successfully ported to web while maintaining the excellent offline-first architecture and user experience.

**Estimated total effort:** 6-9 weeks for full web compatibility
**Critical path:** Database abstraction → Core interactions → Native replacements → Polish

---

**Document End**
